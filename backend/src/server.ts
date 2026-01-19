import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting configuration
const RATE_LIMIT_TOPUP_MAX = parseInt(process.env.RATE_LIMIT_TOPUP_MAX || '10', 10);
const RATE_LIMIT_TOPUP_WINDOW_MS = parseInt(process.env.RATE_LIMIT_TOPUP_WINDOW_MS || '60000', 10);
const RATE_LIMIT_HEALTH_MAX = parseInt(process.env.RATE_LIMIT_HEALTH_MAX || '60', 10);
const RATE_LIMIT_STATUS_MAX = parseInt(process.env.RATE_LIMIT_STATUS_MAX || '60', 10);

// Disable rate limiting during tests
const isTest = process.env.NODE_ENV === 'test';

// Create a pass-through limiter for tests
const passthroughLimiter = (_req: any, _res: any, next: any) => next();

// Health check endpoint rate limiter (less strict)
const healthLimiter = isTest ? passthroughLimiter : rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMIT_HEALTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many health check requests. Please try again later.'
  }
});

// Status endpoint rate limiter (less strict)
const statusLimiter = isTest ? passthroughLimiter : rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMIT_STATUS_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many status requests. Please try again later.'
  }
});

// Top-up endpoint rate limiter (strict - prevents abuse)
const topupLimiter = isTest ? passthroughLimiter : rateLimit({
  windowMs: RATE_LIMIT_TOPUP_WINDOW_MS,
  max: RATE_LIMIT_TOPUP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many top-up requests. Please try again later.',
    retryAfter: Math.ceil(RATE_LIMIT_TOPUP_WINDOW_MS / 1000)
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many top-up requests. Please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_TOPUP_WINDOW_MS / 1000)
    });
  }
});

// Export app for testing
export { app };

// Load bank wallet from environment path
function loadBankWallet(): Keypair {
  const walletPath = process.env.BANK_WALLET_PATH || '';
  if (!walletPath) {
    throw new Error('BANK_WALLET_PATH not set in .env');
  }

  if (!fs.existsSync(walletPath)) {
    throw new Error(`Bank wallet file not found: ${walletPath}`);
  }

  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

// Initialize bank wallet
let bankWalletKeypair: Keypair;
try {
  bankWalletKeypair = loadBankWallet();
  console.log(`✅ Bank wallet loaded: ${bankWalletKeypair.publicKey.toBase58()}`);
} catch (error) {
  console.error('❌ Failed to load bank wallet:', error);
  console.error('⚠️  Backend will start but /api/topup will fail until wallet is configured');
}

// Top-up endpoint - simulates Visa payment by transferring tokens from bank wallet
app.post('/api/topup', topupLimiter, async (req, res) => {
  try {
    const { walletAddress, amount = 50 } = req.body;

    // Validation
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required'
      });
    }

    if (!bankWalletKeypair) {
      return res.status(500).json({
        success: false,
        error: 'Bank wallet not configured. Set BANK_WALLET_PATH in .env'
      });
    }

    const tokenAddress = process.env.TOKEN_ADDRESS;
    if (!tokenAddress) {
      return res.status(500).json({
        success: false,
        error: 'TOKEN_ADDRESS not set in .env'
      });
    }

    // Validate amount
    const topUpAmount = parseInt(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    console.log(`📝 Processing top-up: ${topUpAmount} EVT to ${walletAddress}`);

    // Connect to Solana
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const tokenMint = new PublicKey(tokenAddress);
    const toWallet = new PublicKey(walletAddress);

    // Get associated token accounts
    const fromATA = await getAssociatedTokenAddress(
      tokenMint,
      bankWalletKeypair.publicKey
    );

    // Ensure the recipient has an associated token account
    console.log(`   Ensuring ATA exists for ${toWallet.toBase58()}...`);
    const toAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      bankWalletKeypair,
      tokenMint,
      toWallet
    );
    const toATA = toAccount.address;

    console.log(`   From: ${fromATA.toBase58()}`);
    console.log(`   To: ${toATA.toBase58()}`);

    // Create transfer instruction
    // SPL Token uses 9 decimals by default
    const instruction = createTransferInstruction(
      fromATA,
      toATA,
      bankWalletKeypair.publicKey,
      topUpAmount * 1e9  // Convert to smallest unit (9 decimals)
    );

    // Create and sign transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = bankWalletKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign and send transaction
    const signature = await connection.sendTransaction(transaction, [bankWalletKeypair]);

    // Wait for transaction confirmation with 'confirmed' commitment
    console.log(`⏳ Waiting for confirmation...`);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`✅ Top-up successful: ${signature}`);

    res.json({
      success: true,
      signature,
      amount: topUpAmount,
      message: `Sent ${topUpAmount} Event Tokens`,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });

  } catch (error) {
    console.error('❌ Top-up error:', error);

    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Health check endpoint
app.get('/health', healthLimiter, (req, res) => {
  const bankWalletConfigured = !!bankWalletKeypair;
  const tokenAddressConfigured = !!process.env.TOKEN_ADDRESS;

  res.json({
    status: 'ok',
    service: 'event-wallet-backend',
    bankWalletConfigured,
    tokenAddressConfigured,
    bankWalletAddress: bankWalletConfigured ? bankWalletKeypair.publicKey.toBase58() : null,
    network: 'solana-devnet'
  });
});

// Get backend status
app.get('/api/status', statusLimiter, (req, res) => {
  res.json({
    service: 'Event Wallet Top-Up Simulation',
    version: '1.0.0',
    endpoints: {
      topup: 'POST /api/topup',
      health: 'GET /health',
      status: 'GET /api/status'
    },
    configuration: {
      bankWalletConfigured: !!bankWalletKeypair,
      tokenAddressConfigured: !!process.env.TOKEN_ADDRESS,
      network: 'solana-devnet'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/api/topup', '/health', '/api/status']
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Event Wallet Backend Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Network: Solana Devnet`);
    console.log(`\n📚 Endpoints:`);
    console.log(`   POST /api/topup    - Simulate Visa top-up`);
    console.log(`   GET  /health        - Health check`);
    console.log(`   GET  /api/status    - Service status\n`);
  });
}
