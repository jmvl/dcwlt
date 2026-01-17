/**
 * Solana transaction builder for SPL token transfers
 *
 * Uses @solana/web3.js to build SPL token transactions.
 * These transactions can be signed by Privy and submitted to Solana Devnet.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

/**
 * Event Token decimals (SPL tokens use 9 decimals by default)
 */
export const TOKEN_DECIMALS = 9;

/**
 * Solana Devnet RPC URL
 */
export const DEVNET_RPC = 'https://api.devnet.solana.com';

/**
 * Parameters for building an SPL token transfer transaction
 */
export interface BuildTransferParams {
  /** Recipient wallet address */
  recipient: string;
  /** Amount to transfer in smallest unit (lamports) */
  amount: string;
  /** SPL Token mint address */
  splToken: string;
  /** Sender wallet address (fee payer) */
  sender: string;
}

/**
 * Builds an SPL token transfer transaction
 *
 * Creates a Solana transaction that transfers SPL tokens from sender
 * to recipient. The transaction is unsigned and ready to be signed
 * by a wallet (e.g., Privy).
 *
 * @param params - Transfer parameters
 * @returns Transaction object ready for signing
 * @throws Error if transaction building fails
 *
 * @example
 * ```typescript
 * const transaction = await buildSPLTokenTransfer({
 *   recipient: '9abc...xyz',
 *   amount: '100000000', // 1 token with 9 decimals
 *   splToken: 'TokenMintAddress',
 *   sender: 'senderAddress',
 * });
 * ```
 */
export async function buildSPLTokenTransfer(
  params: BuildTransferParams
): Promise<Transaction> {
  const { recipient, amount, splToken, sender } = params;

  try {
    // Convert string addresses to PublicKey objects
    const recipientPubkey = new PublicKey(recipient);
    const senderPubkey = new PublicKey(sender);
    const tokenMintPubkey = new PublicKey(splToken);

    // Convert amount from string to bigint (smallest unit)
    const amountBigInt = BigInt(amount);

    // Create connection to Devnet
    const connection = new Connection(DEVNET_RPC, 'confirmed');

    // Fetch latest blockhash for transaction lifetime
    const { blockhash } = await connection.getLatestBlockhash();

    // Derive Associated Token Account addresses
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      senderPubkey
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      recipientPubkey
    );

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: senderPubkey,
    });

    // Add transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPubkey,
      amountBigInt,
      undefined,
      TOKEN_PROGRAM_ID
    );

    transaction.add(transferInstruction);

    return transaction;
  } catch (error) {
    console.error('[buildSPLTokenTransfer] Failed to build transaction:', error);
    throw new Error(
      `Failed to build transfer transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Converts token amount from smallest unit to decimal (e.g., 100000000 -> 1.0)
 *
 * @param amountSmallestUnit - Amount in smallest unit (lamports)
 * @param decimals - Token decimals (default 9)
 * @returns Formatted decimal amount
 *
 * @example
 * ```typescript
 * const displayAmount = formatTokenAmount('100000000'); // "1.0"
 * ```
 */
export function formatTokenAmount(
  amountSmallestUnit: string,
  decimals: number = TOKEN_DECIMALS
): string {
  const amount = BigInt(amountSmallestUnit);
  const divisor = BigInt(10 ** decimals);

  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  // Pad fraction with leading zeros if needed
  const fractionStr = fraction.toString().padStart(decimals, '0');
  return `${whole}.${fractionStr}`.replace(/\.?0+$/, '');
}

/**
 * Converts decimal token amount to smallest unit (e.g., 1.0 -> 100000000)
 *
 * @param amountDecimal - Amount in decimal (e.g., "1.5")
 * @param decimals - Token decimals (default 9)
 * @returns Amount in smallest unit as string
 *
 * @example
 * ```typescript
 * const smallestUnit = parseTokenAmount('1.5'); // "1500000000"
 * ```
 */
export function parseTokenAmount(
  amountDecimal: string,
  decimals: number = TOKEN_DECIMALS
): string {
  const [whole = '0', fraction = ''] = amountDecimal.split('.');

  const wholeBigInt = BigInt(whole);
  const fractionBigInt = BigInt(
    fraction.padEnd(decimals, '0').slice(0, decimals)
  );

  const multiplier = BigInt(10 ** decimals);
  return (wholeBigInt * multiplier + fractionBigInt).toString();
}
