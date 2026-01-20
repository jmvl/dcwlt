'use client';

import { useState, useCallback } from 'react';
import { useWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { useQueryClient } from '@tanstack/react-query';
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { DEVNET_RPC } from '../../src/utils/transactions';
import { balanceQueryKeys } from './useSolanaBalance';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Payment parameters
 */
export interface PaymentParams {
  /** Recipient wallet address */
  recipient: string;
  /** Amount to transfer in smallest unit (lamports) */
  amount: string;
  /** SPL Token mint address */
  splToken: string;
  /** Optional merchant ID for Convex transaction record (string ID at runtime) */
  merchantId?: string;
  /** Optional item ID for Convex transaction record (string ID at runtime) */
  itemId?: string;
}

/**
 * Payment result
 */
export interface PaymentResult {
  /** Whether the payment succeeded */
  success: boolean;
  /** Transaction signature (if successful) */
  signature?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Hook for executing Solana Pay payments with gas sponsorship
 *
 * This hook implements sponsored transactions where the backend pays gas fees.
 * Users can transact without needing SOL in their wallet.
 *
 * Flow:
 * 1. Client creates transaction with backend fee payer address
 * 2. Client signs the transaction message (not full transaction)
 * 3. Client sends partially signed transaction to backend
 * 4. Backend adds fee payer signature and broadcasts to Solana
 *
 * @returns Object with executePayment function and loading state
 */
export function usePayment() {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get fee payer address from environment variable
  const feePayerAddress = process.env.NEXT_PUBLIC_FEE_PAYER_ADDRESS;

  // Convex mutations for transaction records
  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransactionStatus = useMutation(api.transactions.updateTransactionStatus);

  /**
   * Execute a payment transaction with gas sponsorship
   *
   * This implements a sponsored transaction flow where the backend pays gas fees:
   * 1. Creates transaction with backend fee payer address
   * 2. Signs the transaction message (not full transaction)
   * 3. Sends to backend API for fee payer signature and broadcast
   *
   * @param params - Payment parameters
   * @returns Payment result with success status and signature/error
   */
  const executePayment = useCallback(
    async (params: PaymentParams): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      // Validate fee payer address is configured
      if (!feePayerAddress) {
        const errorMsg = 'Fee payer address not configured. Please check environment variables.';
        console.error('[usePayment]', errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }

      console.log('[usePayment] Available Solana wallets:', wallets.length);
      console.log('[usePayment] Wallets:', wallets.map(w => ({
        address: w.address,
      })));

      // Check if we have any wallets
      if (wallets.length === 0) {
        console.error('[usePayment] No Solana wallets available!');
        return {
          success: false,
          error: 'No wallet found. Please create a wallet in your profile first.',
        };
      }

      // Get the first Solana wallet
      const solanaWallet = wallets[0];
      const sender = solanaWallet.address;
      console.log('[usePayment] Using wallet:', sender);

      try {
        // Step 1: Build the transaction with backend fee payer
        console.log('[usePayment] Building transaction with sponsored gas...', {
          recipient: params.recipient,
          amount: params.amount,
          splToken: params.splToken,
          sender,
          feePayer: feePayerAddress,
        });

        const connection = new Connection(DEVNET_RPC, 'confirmed');

        // Import required utilities
        const {
          createTransferInstruction,
          getAssociatedTokenAddress,
          createAssociatedTokenAccountIdempotentInstruction,
        } = await import('@solana/spl-token');

        // Get the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash('finalized');

        // Convert addresses to PublicKey objects
        const senderPubkey = new PublicKey(sender);
        const recipientPubkey = new PublicKey(params.recipient);
        const tokenMintPubkey = new PublicKey(params.splToken);
        const feePayerPubkey = new PublicKey(feePayerAddress);

        // Get the associated token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          senderPubkey
        );
        const recipientTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          recipientPubkey
        );

        // Convert amount to bigint
        const amountBigInt = BigInt(params.amount);

        // Build instructions array
        const instructions = [];

        // Check if recipient's ATA exists, if not, add instruction to create it
        const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
        if (!recipientAccountInfo) {
          console.log('[usePayment] Recipient ATA does not exist, creating it...');
          const createATAInstruction = createAssociatedTokenAccountIdempotentInstruction(
            feePayerPubkey,         // payer (backend fee payer)
            recipientTokenAccount,  // ATA address to create
            recipientPubkey,        // owner of the ATA
            tokenMintPubkey         // token mint
          );
          instructions.push(createATAInstruction);
        }

        // Create the SPL token transfer instruction
        const transferInstruction = createTransferInstruction(
          senderTokenAccount,     // source
          recipientTokenAccount,  // destination
          senderPubkey,           // authority (owner of source account)
          amountBigInt            // amount
        );
        instructions.push(transferInstruction);

        // Create a transaction message with the backend fee payer
        const messageV0 = new TransactionMessage({
          payerKey: feePayerPubkey,      // Backend pays gas fees
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        // Create a VersionedTransaction from the v0 message
        const transaction = new VersionedTransaction(messageV0);

        console.log('[usePayment] Transaction built with sponsored gas');

        // Step 2: Sign the transaction message (not full transaction)
        // Following Privy's sponsored transaction pattern
        console.log('[usePayment] Signing transaction message...');

        // Serialize the message (not the full transaction) as Uint8Array
        const messageBytes = transaction.message.serialize();

        // Sign the message using Privy (expects Uint8Array)
        const { signature: userSignature } = await solanaWallet.signMessage({
          message: messageBytes,
        });

        console.log('[usePayment] Message signed, adding signature to transaction...');

        // Add the user's signature to the transaction
        transaction.addSignature(senderPubkey, userSignature);

        console.log('[usePayment] User signature added to transaction');

        // Initialize transaction ID for tracking
        let convexTransactionId: string | null = null;

        // Step 3: Create transaction record in Convex as PENDING (before sending to backend)
        // This provides audit trail even if Solana transaction fails
        if (params.merchantId && params.itemId) {
          console.log('[usePayment] Creating Convex transaction record as PENDING...');
          console.log('[usePayment] IDs:', {
            merchantId: params.merchantId.toString(),
            itemId: params.itemId.toString(),
            customerWallet: sender,
            amount: params.amount,
          });
          try {
            // Convert amount from base units to display amount (EVT)
            const amountInEVT = Number(params.amount) / 1e9; // TOKEN_DECIMALS = 9

            console.log('[usePayment] Calling createTransaction mutation...');
            // Type assertion: params.merchantId and params.itemId are string IDs at runtime
            // The Convex mutation expects Id<> types for type safety, but at runtime these are just strings
            convexTransactionId = await createTransaction({
              merchantId: params.merchantId as any,
              itemId: params.itemId as any,
              customerWallet: sender,
              amount: amountInEVT,
              // No signature yet - transaction is pending
            });
            console.log('[usePayment] Convex transaction record created:', convexTransactionId);
          } catch (convexError) {
            console.error('[usePayment] Failed to create Convex transaction record:', convexError);
            // Don't fail the payment if Convex write fails
            // The transaction can still proceed on Solana
          }
        } else {
          console.log('[usePayment] Skipping Convex transaction record (no merchantId/itemId)', {
            hasMerchantId: !!params.merchantId,
            hasItemId: !!params.itemId,
          });
        }

        // Step 4: Send partially signed transaction to backend for fee payer signature and broadcast
        console.log('[usePayment] Sending to backend for gas sponsorship...');

        const serializedTransaction = Buffer.from(transaction.serialize()).toString('base64');

        const backendResponse = await fetch('/api/sponsor-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction: serializedTransaction,
          }),
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error('[usePayment] Backend error:', errorData);

          // Update Convex transaction to FAILED status
          if (convexTransactionId) {
            try {
              await updateTransactionStatus({
                transactionId: convexTransactionId as any,
                status: 'failed',
              });
              console.log('[usePayment] Convex transaction updated to: failed');
            } catch (updateError) {
              console.error('[usePayment] Failed to update transaction status:', updateError);
            }
          }

          return {
            success: false,
            error: errorData.error || 'Backend failed to sponsor transaction',
          };
        }

        const { success, signature: txSignature, error: backendError } = await backendResponse.json();

        if (!success || backendError) {
          console.error('[usePayment] Transaction failed:', backendError);

          // Update Convex transaction to FAILED status
          if (convexTransactionId) {
            try {
              await updateTransactionStatus({
                transactionId: convexTransactionId as any,
                status: 'failed',
              });
              console.log('[usePayment] Convex transaction updated to: failed');
            } catch (updateError) {
              console.error('[usePayment] Failed to update transaction status:', updateError);
            }
          }

          return {
            success: false,
            error: backendError || 'Transaction failed',
          };
        }

        console.log('[usePayment] Transaction successful:', txSignature);

        // Step 5: Update transaction to CONFIRMED in Convex
        if (convexTransactionId) {
          try {
            await updateTransactionStatus({
              transactionId: convexTransactionId as any,
              status: 'confirmed',
              signature: txSignature,
            });
            console.log('[usePayment] Convex transaction updated to: confirmed');
          } catch (updateError) {
            console.error('[usePayment] Failed to update transaction status:', updateError);
            // Don't fail the payment if Convex update fails
            // The transaction was still successful on-chain
          }
        }

        // Step 6: Invalidate balance query to trigger refetch from Solana
        console.log('[usePayment] Invalidating balance query...');
        try {
          queryClient.invalidateQueries({
            queryKey: balanceQueryKeys.detail(sender),
          });
          console.log('[usePayment] Balance query invalidated successfully');
        } catch (queryError) {
          console.error('[usePayment] Failed to invalidate balance query:', queryError);
          // Don't fail the payment if query invalidation fails
          // The transaction was still successful on-chain
        }

        console.log('[usePayment] Payment successful:', txSignature);
        return {
          success: true,
          signature: txSignature,
        };
      } catch (signError: any) {
        console.error('[usePayment] Payment failed!');
        console.error('[usePayment] Error type:', signError?.constructor?.name);
        console.error('[usePayment] Error message:', signError?.message);
        console.error('[usePayment] Error stack:', signError?.stack);
        console.error('[usePayment] Full error:', signError);

        // Extract useful error info
        let errorMsg = 'Failed to sign transaction. ';
        if (signError?.message) {
          errorMsg += `Error: ${signError.message}`;
        } else {
          errorMsg += `Please try again. Details: ${JSON.stringify(signError)}`;
        }

        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setLoading(false);
      }
    },
    [wallets, signTransaction, queryClient, createTransaction, updateTransactionStatus, feePayerAddress]
  );

  return {
    executePayment,
    loading,
    error,
  };
}
