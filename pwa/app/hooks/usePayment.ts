/**
 * usePayment Hook - Feature-Flagged Payment System
 *
 * Supports two modes:
 * - Database mode (USE_DATABASE_TOKENS=true): Instant Convex mutations, no blockchain
 * - Solana mode (default): Blockchain transactions with gas sponsorship
 *
 * @see Plan 05-06: Feature flag implementation
 * @see Plan 05-07: Payment flow integration
 */

'use client';

import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { USE_DATABASE_TOKENS } from '@/src/config/tokens';

// Solana imports (conditionally used)
import { useWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { useQueryClient } from '@tanstack/react-query';
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { DEVNET_RPC } from '../../src/utils/transactions';
import { balanceQueryKeys } from './useSolanaBalance';

/**
 * Payment parameters
 */
export interface PaymentParams {
  /** Recipient wallet address */
  recipient: string;
  /** Amount to transfer in EVT (database mode) or smallest unit (Solana mode) */
  amount: string;
  /** SPL Token mint address (ignored in database mode) */
  splToken?: string;
  /** Optional merchant ID for Convex transaction record */
  merchantId?: string;
  /** Optional item ID for Convex transaction record */
  itemId?: string;
}

/**
 * Payment result
 */
export interface PaymentResult {
  /** Whether the payment succeeded */
  success: boolean;
  /** Transaction ID (Convex ID in database mode, signature in Solana mode) */
  transactionId?: string;
  /** Transaction signature (Solana mode only) */
  signature?: string;
  /** Error message (if failed) */
  error?: string;
  /** New sender balance (database mode only) */
  newBalance?: number;
}

/**
 * Hook for executing payments with feature flag support
 *
 * When USE_DATABASE_TOKENS is true:
 * - Uses Convex transferBalance mutation
 * - Instant, no gas fees, no blockchain
 * - Amount is in EVT tokens
 *
 * When USE_DATABASE_TOKENS is false:
 * - Uses Solana blockchain with gas sponsorship
 * - Amount is in lamports (smallest unit)
 * - Transaction signed by Privy, sponsored by backend
 *
 * @returns Object with executePayment function and loading state
 */
export function usePayment() {
  const { user } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Privy ID for database mode
  const privyId = user?.id;

  // Get wallet address from Privy user's linked accounts
  const solanaWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet && 'address' in solanaWallet ? solanaWallet.address : undefined;

  // Convex mutation for database mode
  const transferBalance = useMutation(api.wallets.transferBalance);

  // Privy hooks for Solana mode
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const queryClient = useQueryClient();

  const executePayment = useCallback(
    async (params: PaymentParams): Promise<PaymentResult> => {
      if (USE_DATABASE_TOKENS) {
        // DATABASE MODE: Use Convex mutation
        return executeDatabasePayment(
          params,
          privyId,
          transferBalance,
          setLoading,
          setError
        );
      } else {
        // SOLANA MODE: Use existing blockchain flow
        return executeSolanaPayment(
          params,
          walletAddress,
          wallets,
          signTransaction,
          queryClient,
          setLoading,
          setError
        );
      }
    },
    [privyId, walletAddress, transferBalance, wallets, signTransaction, queryClient]
  );

  return {
    executePayment,
    loading,
    error,
    walletAddress, // Expose for consumers that need it
  };
}

/**
 * Execute payment using Convex database mutation
 * Instant, no blockchain, no gas fees
 */
async function executeDatabasePayment(
  params: PaymentParams,
  privyId: string | undefined,
  transferBalance: any,
  setLoading: (b: boolean) => void,
  setError: (e: string | null) => void
): Promise<PaymentResult> {
  if (!privyId) {
    return { success: false, error: 'No user ID available. Please log in again.' };
  }

  setLoading(true);
  setError(null);

  try {
    console.log('[usePayment] Database mode: executing transferBalance mutation', {
      privyId,
      recipient: params.recipient,
      amount: params.amount,
      merchantId: params.merchantId,
      itemId: params.itemId,
    });

    // Amount is already in EVT (no conversion needed)
    const amountInEVT = Number(params.amount);

    const result = await transferBalance({
      senderPrivyId: privyId,
      recipientWalletAddress: params.recipient,
      amount: amountInEVT,
      merchantId: params.merchantId as any,
      itemId: params.itemId as any,
    });

    console.log('[usePayment] Database transfer successful:', result);

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newSenderBalance,
    };
  } catch (err: any) {
    console.error('[usePayment] Database transfer failed:', err);
    const errorMsg = err?.message || 'Payment failed';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    setLoading(false);
  }
}

/**
 * Execute payment using Solana blockchain with gas sponsorship
 * Original implementation preserved for fallback
 */
async function executeSolanaPayment(
  params: PaymentParams,
  walletAddress: string | undefined,
  wallets: any[],
  signTransaction: any,
  queryClient: any,
  setLoading: (b: boolean) => void,
  setError: (e: string | null) => void
): Promise<PaymentResult> {
  setLoading(true);
  setError(null);

  // Get fee payer address from environment variable
  const feePayerAddress = process.env.NEXT_PUBLIC_FEE_PAYER_ADDRESS;

  // Validate fee payer address is configured
  if (!feePayerAddress) {
    const errorMsg = 'Fee payer address not configured. Please check environment variables.';
    console.error('[usePayment]', errorMsg);
    setLoading(false);
    return { success: false, error: errorMsg };
  }

  console.log('[usePayment] Solana mode: available wallets:', wallets.length);

  // Check if we have any wallets
  if (wallets.length === 0) {
    console.error('[usePayment] No Solana wallets available!');
    setLoading(false);
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
    const tokenMintPubkey = new PublicKey(params.splToken!);
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
        feePayerPubkey,
        recipientTokenAccount,
        recipientPubkey,
        tokenMintPubkey
      );
      instructions.push(createATAInstruction);
    }

    // Create the SPL token transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPubkey,
      amountBigInt
    );
    instructions.push(transferInstruction);

    // Create a transaction message with the backend fee payer
    const messageV0 = new TransactionMessage({
      payerKey: feePayerPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // Create a VersionedTransaction from the v0 message
    const transaction = new VersionedTransaction(messageV0);

    console.log('[usePayment] Transaction built with sponsored gas');

    // Step 2: Sign the transaction message
    console.log('[usePayment] Signing transaction message...');

    // Serialize the message as Uint8Array
    const messageBytes = transaction.message.serialize();

    // Sign the message using Privy
    const { signature: userSignature } = await solanaWallet.signMessage({
      message: messageBytes,
    });

    console.log('[usePayment] Message signed, adding signature to transaction...');

    // Add the user's signature to the transaction
    transaction.addSignature(senderPubkey, userSignature);

    console.log('[usePayment] User signature added to transaction');

    // Step 3: Send to backend for fee payer signature and broadcast
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
      setLoading(false);
      return {
        success: false,
        error: errorData.error || 'Backend failed to sponsor transaction',
      };
    }

    const { success, signature: txSignature, error: backendError } = await backendResponse.json();

    if (!success || backendError) {
      console.error('[usePayment] Transaction failed:', backendError);
      setLoading(false);
      return {
        success: false,
        error: backendError || 'Transaction failed',
      };
    }

    console.log('[usePayment] Transaction successful:', txSignature);

    // Step 4: Invalidate balance query to trigger refetch
    console.log('[usePayment] Invalidating balance query...');
    try {
      queryClient.invalidateQueries({
        queryKey: balanceQueryKeys.detail(sender),
      });
      console.log('[usePayment] Balance query invalidated successfully');
    } catch (queryError) {
      console.error('[usePayment] Failed to invalidate balance query:', queryError);
    }

    console.log('[usePayment] Payment successful:', txSignature);
    setLoading(false);
    return {
      success: true,
      signature: txSignature,
      transactionId: txSignature, // Use signature as transaction ID in Solana mode
    };
  } catch (signError: any) {
    console.error('[usePayment] Payment failed!');
    console.error('[usePayment] Error type:', signError?.constructor?.name);
    console.error('[usePayment] Error message:', signError?.message);

    let errorMsg = 'Failed to sign transaction. ';
    if (signError?.message) {
      errorMsg += `Error: ${signError.message}`;
    } else {
      errorMsg += `Please try again. Details: ${JSON.stringify(signError)}`;
    }

    setLoading(false);
    return { success: false, error: errorMsg };
  }
}
