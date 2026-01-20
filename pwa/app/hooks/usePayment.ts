'use client';

import { useState, useCallback } from 'react';
import { useWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { useQueryClient } from '@tanstack/react-query';
import { Connection, PublicKey } from '@solana/web3.js';
import { buildSPLTokenTransfer, DEVNET_RPC } from '../../src/utils/transactions';
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
  /** Whether an airdrop was performed */
  airdropped?: boolean;
}

/**
 * Hook for executing Solana Pay payments
 *
 * Uses Privy's useSignTransaction hook to sign transactions.
 * This is the correct approach for Privy embedded wallets.
 *
 * @returns Object with executePayment function and loading state
 */
export function usePayment() {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [airdropStatus, setAirdropStatus] = useState<string | null>(null);

  // Convex mutations for transaction records
  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransactionStatus = useMutation(api.transactions.updateTransactionStatus);

  /**
   * Execute a payment transaction
   *
   * @param params - Payment parameters
   * @returns Payment result with success status and signature/error
   */
  const executePayment = useCallback(
    async (params: PaymentParams): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

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
        // Step 0: Check SOL balance before attempting transaction
        console.log('[usePayment] Checking SOL balance and recipient ATA...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const senderPubkey = new PublicKey(sender);
        const solBalance = await connection.getBalance(senderPubkey);
        console.log('[usePayment] SOL balance:', solBalance / 1e9, 'SOL');

        // Check if recipient's ATA exists to determine SOL requirement
        const recipientPubkey = new PublicKey(params.recipient);
        const tokenMintPubkey = new PublicKey(params.splToken);
        const { getAssociatedTokenAddress } = await import('@solana/spl-token');
        const recipientATA = await getAssociatedTokenAddress(tokenMintPubkey, recipientPubkey);
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);
        const recipientATAExists = recipientATAInfo !== null;
        console.log('[usePayment] Recipient ATA exists:', recipientATAExists);

        // Calculate minimum SOL required
        // If recipient ATA exists: only need transaction fee (~0.000005 SOL)
        // If recipient ATA doesn't exist: need transaction fee + ATA rent (~0.002 SOL)
        const TRANSACTION_FEE = 0.00001 * 1e9; // 0.00001 SOL buffer for transaction fee
        const ATA_RENT = 0.00203928 * 1e9; // Rent for ATA
        const minSolRequired = recipientATAExists
          ? TRANSACTION_FEE
          : TRANSACTION_FEE + ATA_RENT;

        console.log('[usePayment] Minimum SOL required:', minSolRequired / 1e9, 'SOL');

        if (solBalance < minSolRequired) {
          console.log('[usePayment] Insufficient SOL balance, requesting airdrop...');
          setAirdropStatus('Requesting SOL from Devnet faucet...');
          // Auto-airdrop SOL from Devnet faucet when user has insufficient balance
          // This is a devnet-only feature - on mainnet, users would need to acquire SOL
          try {
            const airdropSignature = await connection.requestAirdrop(
              senderPubkey,
              0.01 * 1e9 // Airdrop 0.01 SOL (enough for ~100 transactions)
            );
            console.log('[usePayment] Airdrop requested:', airdropSignature);
            setAirdropStatus('Confirming airdrop...');

            // Wait for airdrop confirmation
            await connection.confirmTransaction(airdropSignature, 'confirmed');

            // Refresh SOL balance after airdrop
            const newSolBalance = await connection.getBalance(senderPubkey);
            console.log('[usePayment] New SOL balance after airdrop:', newSolBalance / 1e9, 'SOL');

            if (newSolBalance < minSolRequired) {
              setAirdropStatus(null);
              return {
                success: false,
                airdropped: true,
                error: `Airdrop received but still insufficient SOL. Please wait a moment and try again.`,
              };
            }
            setAirdropStatus(null);
          } catch (airdropError: any) {
            console.error('[usePayment] Airdrop failed:', airdropError);
            setAirdropStatus(null);
            return {
              success: false,
              error: `Failed to airdrop SOL for gas fees. Error: ${airdropError?.message || 'Unknown error'}. Please try again.`,
            };
          }
        }

        // Step 1: Build the transaction
        console.log('[usePayment] Building transaction...', {
          recipient: params.recipient,
          amount: params.amount,
          splToken: params.splToken,
          sender
        });
        console.log('[usePayment] Recipient address validation:', {
          length: params.recipient?.length,
          startsWith: params.recipient?.substring(0, 10),
          isValidBase58: /^[1-9A-HJ-NP-Za-km-z]+$/.test(params.recipient || '')
        });
        const transaction = await buildSPLTokenTransfer({
          ...params,
          sender,
        });

        console.log('[usePayment] Transaction built, preparing to sign...');

        // Step 2: Serialize the transaction for signing
        // For VersionedTransaction, we use serialize() which returns the full transaction bytes
        const transactionBytes = transaction.serialize();
        console.log('[usePayment] Transaction serialized, length:', transactionBytes.length);
        console.log('[usePayment] Calling Privy signTransaction...');

        // Step 3: Sign using Privy's useSignTransaction hook
        // showWalletUIs: false bypasses Privy's action sheet since we have custom UI
        const { signedTransaction } = await signTransaction({
          transaction: transactionBytes,
          wallet: solanaWallet,
          chain: 'solana:devnet',
          options: {
            uiOptions: {
              showWalletUIs: false,
            },
          },
        });

        console.log('[usePayment] Transaction signed successfully!');
        console.log('[usePayment] Signed transaction length:', signedTransaction.length);

        // Initialize transaction ID for tracking
        let convexTransactionId: string | null = null;

        // Step 4: Create transaction record in Convex as PENDING (before sending to Solana)
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

        // Step 5: Send the signed transaction to Solana
        console.log('[usePayment] Sending transaction to Solana Devnet...');
        // Reuse the connection created earlier for SOL balance check

        // Send to Solana
        const txSignature = await connection.sendRawTransaction(signedTransaction);

        console.log('[usePayment] Transaction sent:', txSignature);

        // Step 6: Wait for confirmation
        console.log('[usePayment] Waiting for confirmation...');
        const confirmation = await connection.confirmTransaction(
          txSignature,
          'confirmed'
        );

        if (confirmation.value.err) {
          console.error('[usePayment] Transaction failed:', confirmation.value.err);

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
            error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
          };
        }

        // Step 7: Update transaction to CONFIRMED in Convex
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

        // Step 8: Invalidate balance query to trigger refetch from Solana
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
    [wallets, signTransaction, queryClient, createTransaction, updateTransactionStatus]
  );

  return {
    executePayment,
    loading,
    error,
    airdropStatus,
  };
}
