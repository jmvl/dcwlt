'use client';

import { useState, useCallback } from 'react';
import { useWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { useQueryClient } from '@tanstack/react-query';
import { Connection, Transaction } from '@solana/web3.js';
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

  // Convex mutation for creating transaction records
  const createTransaction = useMutation(api.transactions.createTransaction);

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
        // Step 1: Build the transaction
        console.log('[usePayment] Building transaction...', { ...params, sender });
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
        const { signedTransaction } = await signTransaction({
          transaction: transactionBytes,
          wallet: solanaWallet,
          chain: 'solana:devnet',
        });

        console.log('[usePayment] Transaction signed successfully!');
        console.log('[usePayment] Signed transaction length:', signedTransaction.length);

        // Step 4: Send the signed transaction to Solana
        console.log('[usePayment] Sending transaction to Solana Devnet...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');

        // Send to Solana
        const txSignature = await connection.sendRawTransaction(signedTransaction);

        console.log('[usePayment] Transaction sent:', txSignature);

        // Step 5: Wait for confirmation
        console.log('[usePayment] Waiting for confirmation...');
        const confirmation = await connection.confirmTransaction(
          txSignature,
          'confirmed'
        );

        if (confirmation.value.err) {
          console.error('[usePayment] Transaction failed:', confirmation.value.err);
          return {
            success: false,
            error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
          };
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

        // Step 7: Create transaction record in Convex (if merchant and item provided)
        if (params.merchantId && params.itemId) {
          console.log('[usePayment] Creating Convex transaction record...');
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
            const transactionId = await createTransaction({
              merchantId: params.merchantId as any,
              itemId: params.itemId as any,
              customerWallet: sender,
              amount: amountInEVT,
              signature: txSignature,
            });
            console.log('[usePayment] Convex transaction record created:', transactionId);
          } catch (convexError) {
            console.error('[usePayment] Failed to create Convex transaction record:', convexError);
            // Don't fail the payment if Convex write fails
            // The transaction was still successful on-chain
          }
        } else {
          console.log('[usePayment] Skipping Convex transaction record (no merchantId/itemId)', {
            hasMerchantId: !!params.merchantId,
            hasItemId: !!params.itemId,
          });
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
    [wallets, signTransaction, queryClient, createTransaction]
  );

  return {
    executePayment,
    loading,
    error,
  };
}
