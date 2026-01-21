/**
 * Sponsored Transaction API Endpoint
 *
 * This endpoint implements gas sponsorship for Solana transactions.
 * It receives a partially signed transaction from the client, adds the fee payer signature,
 * and broadcasts it to the Solana network.
 *
 * Flow:
 * 1. Client creates transaction with backend fee payer address
 * 2. Client signs the transaction message (not full transaction)
 * 3. Client sends partially signed transaction to this endpoint
 * 4. Server validates transaction and signs with fee payer
 * 5. Server broadcasts transaction to Solana
 * 6. Server returns transaction signature to client
 *
 * Security:
 * - Validates fee payer is the expected backend wallet
 * - Checks for unauthorized SOL transfers from fee payer
 * - Validates transaction structure before signing
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  VersionedTransaction,
  SystemProgram,
} from '@solana/web3.js';
import * as bs58 from 'bs58';

/**
 * Environment variables for fee payer wallet
 *
 * FEE_PAYER_PRIVATE_KEY: Base58-encoded private key for fee payer wallet
 * FEE_PAYER_ADDRESS: Expected fee payer address (for validation)
 * NEXT_PUBLIC_SOLANA_RPC_URL: Solana RPC endpoint (default: Devnet)
 */

const FEE_PAYER_PRIVATE_KEY = process.env.FEE_PAYER_PRIVATE_KEY;
const FEE_PAYER_ADDRESS = process.env.FEE_PAYER_ADDRESS;
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * Request body for sponsored transaction
 */
interface SponsorTransactionRequest {
  /** Base64-encoded serialized transaction (partially signed by user) */
  transaction: string;
}

/**
 * Response body for sponsored transaction
 */
interface SponsorTransactionResponse {
  /** Transaction signature from Solana */
  signature: string;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Validate environment variables are set
 */
function validateEnvironment() {
  const errors: string[] = [];

  if (!FEE_PAYER_PRIVATE_KEY) {
    errors.push('FEE_PAYER_PRIVATE_KEY environment variable is not set');
  }
  if (!FEE_PAYER_ADDRESS) {
    errors.push('FEE_PAYER_ADDRESS environment variable is not set');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Validate fee payer in transaction matches expected backend wallet
 *
 * @param transaction - The transaction to validate
 * @throws Error if fee payer doesn't match expected address
 */
function validateFeePayer(transaction: VersionedTransaction) {
  const message = transaction.message;

  // Get static account keys (version 0 transactions)
  const feePayerIndex = message.staticAccountKeys[0];

  if (!feePayerIndex) {
    throw new Error('Transaction has no fee payer');
  }

  const feePayerAddress = feePayerIndex.toBase58();

  if (feePayerAddress !== FEE_PAYER_ADDRESS) {
    throw new Error(
      `Invalid fee payer: expected ${FEE_PAYER_ADDRESS}, got ${feePayerAddress}`
    );
  }

  console.log('[SponsorTransaction] Fee payer validated:', feePayerAddress);
}

/**
 * Check for unauthorized SOL transfers from fee payer
 *
 * This is a critical security check to prevent draining the fee payer wallet.
 * We inspect all instructions and reject any that transfer SOL from the fee payer.
 *
 * @param transaction - The transaction to check
 * @throws Error if unauthorized transfer detected
 */
function checkForUnauthorizedTransfers(transaction: VersionedTransaction) {
  const message = transaction.message;
  const compiledInstructions = message.compiledInstructions;
  const accountKeys = message.staticAccountKeys;

  console.log('[SponsorTransaction] Checking for unauthorized transfers...');

  for (let i = 0; i < compiledInstructions.length; i++) {
    const instruction = compiledInstructions[i];
    const programId = accountKeys[instruction.programIdIndex].toBase58();

    console.log(`[SponsorTransaction] Instruction ${i}: programId=${programId}`);

    // Check if this is a System Program instruction (potential SOL transfer)
    if (programId === SystemProgram.programId.toBase58()) {
      console.log('[SponsorTransaction] System Program instruction detected, inspecting...');

      // Decode instruction data
      // SystemProgram.transfer instruction has:
      // - instruction type: 2 bytes (4 for Transfer)
      // - lamports: 8 bytes
      const data = instruction.data;

      if (data.length >= 1) {
        const instructionType = data[0];

        // SystemProgram.transfer has instruction type 2
        if (instructionType === 2) {
          console.log('[SponsorTransaction] SOL transfer instruction detected!');

          // Check if fee payer is the source account
          const accountIndices = instruction.accountKeyIndexes;
          if (accountIndices.length >= 2) {
            const sourceIndex = accountIndices[0];
            const sourceAddress = accountKeys[sourceIndex].toBase58();

            // If source is fee payer (index 0), reject the transaction
            if (sourceIndex === 0) {
              throw new Error(
                'Unauthorized SOL transfer from fee payer detected. Rejecting transaction.'
              );
            }

            console.log('[SponsorTransaction] SOL transfer from:', sourceAddress);
          }
        }
      }
    }
  }

  console.log('[SponsorTransaction] No unauthorized transfers detected');
}

/**
 * POST /api/sponsor-transaction
 *
 * Receives a partially signed transaction, adds fee payer signature, and broadcasts to Solana.
 */
export async function POST(request: NextRequest) {
  console.log('[SponsorTransaction] Received sponsored transaction request');

  try {
    // Step 1: Validate environment
    validateEnvironment();

    // Step 2: Parse request body
    const body: SponsorTransactionRequest = await request.json();

    if (!body.transaction) {
      return NextResponse.json(
        { success: false, error: 'Missing transaction in request body' },
        { status: 400 }
      );
    }

    console.log('[SponsorTransaction] Transaction received, length:', body.transaction.length);

    // Step 3: Deserialize transaction
    const transactionBytes = Buffer.from(body.transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBytes);

    console.log('[SponsorTransaction] Transaction deserialized successfully');

    // Step 4: Validate fee payer
    validateFeePayer(transaction);

    // Step 5: Check for unauthorized transfers
    checkForUnauthorizedTransfers(transaction);

    // Step 6: Load fee payer keypair
    const feePayerKeypair = Keypair.fromSecretKey((bs58 as any).default.decode(FEE_PAYER_PRIVATE_KEY!));
    console.log('[SponsorTransaction] Fee payer loaded:', feePayerKeypair.publicKey.toBase58());

    // Verify the loaded keypair matches the expected address
    if (feePayerKeypair.publicKey.toBase58() !== FEE_PAYER_ADDRESS) {
      throw new Error(
        `Fee payer keypair mismatch: loaded ${feePayerKeypair.publicKey.toBase58()}, expected ${FEE_PAYER_ADDRESS}`
      );
    }

    // Step 7: Sign transaction with fee payer
    console.log('[SponsorTransaction] Signing transaction with fee payer...');

    // Check if transaction is already partially signed
    const signatureCount = transaction.signatures.length;
    console.log('[SponsorTransaction] Existing signatures:', signatureCount);

    // Sign the transaction with fee payer keypair
    transaction.sign([feePayerKeypair]);

    console.log('[SponsorTransaction] Transaction signed by fee payer');

    // Step 8: Create connection and send transaction
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    console.log('[SponsorTransaction] Sending transaction to Solana...');

    const serializedTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(serializedTransaction);

    console.log('[SponsorTransaction] Transaction sent:', signature);

    // Step 9: Wait for confirmation
    console.log('[SponsorTransaction] Waiting for confirmation...');

    // Poll for transaction confirmation with timeout
    const CONFIRMATION_TIMEOUT = 30000; // 30 seconds
    const POLL_INTERVAL = 1000; // 1 second
    const startTime = Date.now();

    let confirmed = false;

    while (Date.now() - startTime < CONFIRMATION_TIMEOUT) {
      const status = await connection.getSignatureStatus(signature);

      if (status.value) {
        // We have a status response
        if (status.value.err) {
          console.error('[SponsorTransaction] Transaction failed:', status.value.err);
          return NextResponse.json(
            {
              success: false,
              error: `Transaction failed: ${JSON.stringify(status.value.err)}`,
            },
            { status: 400 }
          );
        }

        // Transaction confirmed successfully
        confirmed = true;
        console.log('[SponsorTransaction] Transaction confirmed successfully');
        break;
      }

      // Status is null, transaction still pending, wait and retry
      console.log('[SponsorTransaction] Transaction pending, waiting...');
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    if (!confirmed) {
      console.error('[SponsorTransaction] Transaction confirmation timeout');
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction confirmation timeout - please check if transaction was submitted',
        },
        { status: 408 }
      );
    }

    // Step 10: Return success response
    const response: SponsorTransactionResponse = {
      success: true,
      signature,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[SponsorTransaction] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
