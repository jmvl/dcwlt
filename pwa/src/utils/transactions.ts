/**
 * Solana transaction builder for SPL token transfers
 *
 * Uses @solana/web3.js to build SPL token transactions.
 * These transactions can be signed by Privy and submitted to Solana Devnet.
 */

import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
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
 * Creates a Solana VersionedTransaction (v1) that transfers SPL tokens from sender
 * to recipient. The transaction is unsigned and ready to be signed by a wallet.
 *
 * Uses VersionedTransaction for compatibility with @solana/kit and Privy.
 *
 * @param params - Transaction parameters including recipient, amount, token mint, and sender
 * @returns Promise<VersionedTransaction> - Unsigned transaction ready for signing
 */
export async function buildSPLTokenTransfer(
  params: BuildTransferParams
): Promise<VersionedTransaction> {
  const { recipient, amount, splToken, sender } = params;

  // Create connection to fetch latest blockhash
  const connection = new Connection(DEVNET_RPC, 'confirmed');

  // Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash('finalized');

  // Convert addresses to PublicKey objects
  const senderPubkey = new PublicKey(sender);
  const recipientPubkey = new PublicKey(recipient);
  const tokenMintPubkey = new PublicKey(splToken);

  // Get the associated token accounts
  // These are the token accounts that hold the SPL tokens for each wallet
  const senderTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    senderPubkey
  );
  const recipientTokenAccount = await getAssociatedTokenAddress(
    tokenMintPubkey,
    recipientPubkey
  );

  // Convert amount to bigint (SPL tokens use bigint for amounts)
  const amountBigInt = BigInt(amount);

  // Build instructions array
  // Start with an instruction to create the recipient's ATA if it doesn't exist
  const instructions = [];

  // Check if recipient's ATA exists, if not, add instruction to create it
  const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
  if (!recipientAccountInfo) {
    console.log('[buildSPLTokenTransfer] Recipient ATA does not exist, creating it...');
    // Create the ATA if it doesn't exist (idempotent - safe to run even if it exists)
    const createATAInstruction = createAssociatedTokenAccountIdempotentInstruction(
      senderPubkey,           // payer
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

  // Create a transaction message with the instruction(s)
  const messageV0 = new TransactionMessage({
    payerKey: senderPubkey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  // Create a VersionedTransaction from the v0 message
  const transaction = new VersionedTransaction(messageV0);

  return transaction;
}

/**
 * Formats a token amount for display
 * Converts from smallest unit (lamports) to full tokens
 */
export function formatTokenAmount(amountLamports: string | number): string {
  const amount = BigInt(amountLamports);
  const divisor = BigInt(10 ** TOKEN_DECIMALS);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const fractional = remainder.toString().padStart(TOKEN_DECIMALS, '0');
  return `${whole}.${fractional.slice(0, 2)}`;
}

/**
 * Parses a token amount from display format
 * Converts from full tokens to smallest unit (lamports)
 */
export function parseTokenAmount(amountTokens: string): bigint {
  const [whole, fractional = ''] = amountTokens.split('.');
  const paddedFractional = fractional.padEnd(TOKEN_DECIMALS, '0').slice(0, TOKEN_DECIMALS);
  return BigInt(whole + paddedFractional);
}

/**
 * Fetches the SPL token balance for a wallet
 *
 * Gets the balance of SPL tokens held by a wallet for a specific token mint.
 * Uses the associated token account address derived from wallet + mint.
 *
 * @param walletAddress - Solana wallet address to check balance for
 * @param tokenMintAddress - SPL Token mint address
 * @returns Promise<number> - Token balance in human-readable format
 * @throws Error if unable to fetch balance
 *
 * @example
 * ```typescript
 * const balance = await getSPLTokenBalance(
 *   '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
 *   '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq'
 * );
 * console.log(balance); // e.g., 50.5
 * ```
 */
export async function getSPLTokenBalance(
  walletAddress: string,
  tokenMintAddress: string
): Promise<number> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  // Convert addresses to PublicKey objects
  const walletPubkey = new PublicKey(walletAddress);
  const mintPubkey = new PublicKey(tokenMintAddress);
  
  // Derive the associated token account address
  const tokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    walletPubkey
  );
  
  try {
    // Fetch the balance from Solana
    const balanceInfo = await connection.getTokenAccountBalance(tokenAccount);
    
    // Return the human-readable amount
    if (balanceInfo.value.uiAmount == null) {
      // Account exists but has no balance
      return 0;
    }
    
    return balanceInfo.value.uiAmount;
  } catch (error: any) {
    // If the token account doesn't exist yet, return 0
    if (error?.message?.includes('could not find account') ||
        error?.message?.includes('Invalid account owner')) {
      return 0;
    }
    
    // Re-throw other errors
    throw new Error(`Failed to fetch token balance: ${error?.message || error}`);
  }
}
