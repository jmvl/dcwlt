'use client';

import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import { Connection } from '@solana/web3.js';
import { buildSPLTokenTransfer, DEVNET_RPC, formatTokenAmount } from '../../src/utils/transactions';
import { api } from '../../convex/_generated';

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
 * Provides payment execution functionality that:
 * 1. Builds a Solana transaction for SPL token transfer
 * 2. Signs the transaction with Privy wallet
 * 3. Submits the transaction to Solana Devnet
 * 4. Updates Convex balance after confirmation
 * 5. Returns the transaction signature or error
 *
 * @returns Object with executePayment function and loading state
 *
 * @example
 * ```tsx
 * const { executePayment, loading } = usePayment();
 *
 * const handlePayment = async () => {
 *   const result = await executePayment({
 *     recipient: '9abc...xyz',
 *     amount: '100000000',
 *     splToken: 'TokenMintAddress',
 *   });
 *
 *   if (result.success) {
 *     console.log('Payment successful:', result.signature);
 *   } else {
 *     console.error('Payment failed:', result.error);
 *   }
 * };
 * ```
 */
export function usePayment() {
  const { signTransaction, user } = usePrivy();
  const recordPayment = useMutation(api.wallets.recordPayment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      try {
        // Get sender wallet address from Privy user
        const solanaWallet = user?.linkedAccounts?.find(
          (account: any) => account.type === 'wallet' && account.chainType === 'solana'
        );

        if (!solanaWallet || !('address' in solanaWallet)) {
          return {
            success: false,
            error: 'No Solana wallet found. Please login first.',
          };
        }

        const sender = solanaWallet.address as string;

        // Step 1: Build the transaction
        console.log('[usePayment] Building transaction...', { ...params, sender });
        const transaction = await buildSPLTokenTransfer({
          ...params,
          sender,
        });

        // Step 2: Serialize transaction for Privy signing
        console.log('[usePayment] Serializing transaction...');
        const transactionSerialized = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        // Convert to base64 for Privy
        const transactionBase64 = Buffer.from(transactionSerialized).toString('base64');

        // Step 3: Sign the transaction with Privy
        console.log('[usePayment] Signing transaction with Privy...');
        let signedTransaction;

        try {
          // Privy's signTransaction for Solana expects an object with chainType and transaction
          // Using type assertion since Privy types may not match exactly
          const signRequest: any = {
            chainType: 'solana',
            transaction: transactionBase64,
          };
          const signed = await signTransaction(signRequest);
          signedTransaction = signed;
        } catch (signError) {
          console.error('[usePayment] Signing failed:', signError);
          return {
            success: false,
            error: 'Failed to sign transaction. Please try again.',
          };
        }

        // Step 4: Submit to Solana Devnet
        console.log('[usePayment] Submitting transaction to Devnet...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');

        // Decode signed transaction from base64
        const signedTransactionBuffer = Buffer.from(signedTransaction, 'base64');

        // Submit transaction
        const signature = await connection.sendRawTransaction(
          signedTransactionBuffer,
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          }
        );

        console.log('[usePayment] Transaction submitted:', signature);

        // Step 5: Wait for confirmation
        console.log('[usePayment] Waiting for confirmation...');
        const confirmation = await connection.confirmTransaction(
          signature,
          'confirmed'
        );

        if (confirmation.value.err) {
          console.error('[usePayment] Transaction failed:', confirmation.value.err);
          return {
            success: false,
            error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
          };
        }

        // Step 6: Update Convex balance
        console.log('[usePayment] Updating Convex balance...');
        try {
          // Convert amount from smallest unit to EVT
          const amountEVT = parseFloat(formatTokenAmount(params.amount));

          await recordPayment({
            walletAddress: sender,
            amount: amountEVT,
            signature,
            type: 'payment',
          });

          console.log('[usePayment] Convex balance updated');
        } catch (convexError) {
          console.error('[usePayment] Failed to update Convex balance:', convexError);
          // Don't fail the payment if Convex update fails
          // The transaction was still successful on-chain
        }

        console.log('[usePayment] Payment successful:', signature);
        return {
          success: true,
          signature,
        };
      } catch (err) {
        console.error('[usePayment] Payment error:', err);

        // Provide specific error messages
        let errorMessage = 'Payment failed. Please try again.';

        if (err instanceof Error) {
          if (err.message.includes('insufficient')) {
            errorMessage = 'Insufficient funds for this payment';
          } else if (err.message.includes('network') || err.message.includes('RPC')) {
            errorMessage = 'Network error. Please check your connection and try again';
          } else if (err.message.includes('timeout')) {
            errorMessage = 'Transaction timed out. Please check if it was processed';
          } else if (err.message.includes('Invalid')) {
            errorMessage = 'Invalid transaction details';
          }
        }

        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [signTransaction, user, recordPayment]
  );

  return {
    executePayment,
    loading,
    error,
  };
}
