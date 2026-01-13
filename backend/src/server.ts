import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.post('/api/topup', async (req, res) => {
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

    // Connect to Solana Devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const tokenMint = new PublicKey(tokenAddress);
    const toWallet = new PublicKey(walletAddress);

    // Get associated token accounts
    const fromATA = await getAssociatedTokenAddress(
      tokenMint,
      bankWalletKeypair.publicKey
    );
    const toATA = await getAssociatedTokenAddress(tokenMint, toWallet);

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
app.get('/health', (req, res) => {
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
app.get('/api/status', (req, res) => {
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
