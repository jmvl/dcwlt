/**
 * Solana POC Backend Server
 *
 * Key Sharding Architecture:
 * - Stores Shard 2 of private key (encrypted in memory only)
 * - Never stores full private key
 * - Never persists to disk
 * - Provides partial signatures for transactions
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram
} = require('@solana/web3.js');

// Load environment variables from .env file
require('dotenv').config();

const store = require('./store');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const app = express();
const PORT = process.env.PORT || 3002;

// Security: Store shards in memory only (cleared on server restart)
// Key: walletId (from browser), Value: { shard2: Buffer, iv: Buffer, salt: Buffer }
const keyShardStore = new Map();

// Solana connection
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

// Load token configuration
let tokenConfig = null;
try {
  const tokenConfigPath = require('path').join(__dirname, 'data', 'token-config.json');
  if (require('fs').existsSync(tokenConfigPath)) {
    tokenConfig = JSON.parse(require('fs').readFileSync(tokenConfigPath, 'utf8'));
    console.log('[TOKEN] EVENT token configuration loaded');
  }
} catch (error) {
  console.warn('[TOKEN] No token configuration found. Run setup-token.js first.');
}

// Encryption key (in production, use proper key management)
if (!process.env.ENCRYPTION_KEY) {
  console.error('[FATAL] ENCRYPTION_KEY environment variable must be set');
  console.error('[FATAL] Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const SCRYPT_PARAMS = {
  N: 2 ** 20, // CPU cost
  r: 8,       // Block size
  p: 1        // Parallelization
};

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static files from public directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Validate Solana public key
 */
function isValidPublicKey(publicKey) {
  try {
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

// Security middleware
app.use((req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Rate limiting (basic)
  const ip = req.ip || req.connection.remoteAddress;
  // In production, implement proper rate limiting

  next();
});

/**
 * Encrypt shard 2 using AES-256-GCM
 */
function encryptShard(shard) {
  const iv = crypto.randomBytes(12); // GCM standard IV length
  const salt = crypto.randomBytes(16);

  // Derive key from master key + salt
  const derivedKey = crypto.pbkdf2Sync(
    ENCRYPTION_KEY,
    salt,
    100000,
    32,
    'sha256'
  );

  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  let encrypted = cipher.update(shard, undefined, 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt shard 2 using AES-256-GCM
 */
function decryptShard(encryptedData, ivHex, saltHex, authTagHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const salt = Buffer.from(saltHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const derivedKey = crypto.pbkdf2Sync(
    ENCRYPTION_KEY,
    salt,
    100000,
    32,
    'sha256'
  );

  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData, 'hex'),
    decipher.final()
  ]);
  return decrypted;
}

/**
 * POST /api/store-shard
 * Store encrypted shard 2 in memory
 */
app.post('/api/store-shard', (req, res) => {
  try {
    const { walletId, shard2 } = req.body;

    if (!walletId || !shard2) {
      return res.status(400).json({
        success: false,
        error: 'walletId and shard2 are required'
      });
    }

    // Encrypt shard 2 before storing
    const encrypted = encryptShard(Buffer.from(shard2, 'hex'));

    // Store in memory only
    keyShardStore.set(walletId, encrypted);

    console.log(`[SECURITY] Shard 2 stored for wallet: ${walletId.substring(0, 8)}...`);
    console.log(`[SECURITY] Total wallets in memory: ${keyShardStore.size}`);

    res.json({
      success: true,
      message: 'Shard 2 stored securely in memory',
      shardId: crypto.randomBytes(16).toString('hex')
    });
  } catch (error) {
    console.error('[ERROR] Failed to store shard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/get-balance
 * Get SOL balance for a wallet address
 */
app.post('/api/get-balance', async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey || !isValidPublicKey(publicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana public key'
      });
    }

    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    res.json({
      success: true,
      balance: balanceInSol,
      lamports: balance,
      network: 'devnet'
    });
  } catch (error) {
    console.error('[ERROR] Failed to get balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/request-airdrop
 * Request SOL airdrop on devnet
 */
app.post('/api/request-airdrop', async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey || !isValidPublicKey(publicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana public key'
      });
    }

    const pubKey = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(pubKey, 1 * LAMPORTS_PER_SOL);

    // Wait for confirmation
    await connection.confirmTransaction(signature);

    res.json({
      success: true,
      signature,
      message: '1 SOL airdropped to your wallet'
    });
  } catch (error) {
    console.error('[ERROR] Airdrop failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/transfer
 * Transfer SOL using sharded key
 * Note: This is a simplified version. In production, use MPC properly.
 */
app.post('/api/transfer', async (req, res) => {
  try {
    const { walletId, shard1, toAddress, amount } = req.body;

    if (!walletId || !shard1 || !toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'walletId, shard1, toAddress, and amount are required'
      });
    }

    // Validate amount
    if (amount <= 0 || amount > 10000 || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between 0 and 10000 SOL'
      });
    }

    // Retrieve encrypted shard 2 from memory
    const encryptedShard2 = keyShardStore.get(walletId);

    if (!encryptedShard2) {
      return res.status(404).json({
        success: false,
        error: 'Shard 2 not found. Wallet may have expired from server memory.'
      });
    }

    // Decrypt shard 2
    const shard2 = decryptShard(
      encryptedShard2.encrypted,
      encryptedShard2.iv,
      encryptedShard2.salt,
      encryptedShard2.authTag
    );

    // Combine shards (XOR for simplicity - in production use Shamir's)
    const shard1Buf = Buffer.from(shard1, 'hex');
    const privateKey = Buffer.allocUnsafe(64);
    for (let i = 0; i < shard2.length; i++) {
      privateKey[i] = shard1Buf[i] ^ shard2[i];
    }

    // Create keypair from combined private key
    const keypair = Keypair.fromSecretKey(privateKey.slice(0, 64));

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amount * LAMPORTS_PER_SOL
      })
    );

    // Sign and send
    const signature = await connection.sendTransaction(transaction, [keypair]);

    console.log(`[TRANSFER] ${amount} SOL sent from ${keypair.publicKey.toString()} to ${toAddress}`);

    res.json({
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });
  } catch (error) {
    console.error('[ERROR] Transfer failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/clear-shard
 * Clear shard 2 from memory (logout)
 */
app.delete('/api/clear-shard', (req, res) => {
  try {
    const { walletId } = req.body;

    if (walletId && keyShardStore.has(walletId)) {
      keyShardStore.delete(walletId);
      console.log(`[SECURITY] Shard 2 cleared for wallet: ${walletId.substring(0, 8)}...`);
    }

    res.json({
      success: true,
      message: 'Shard cleared from memory'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    network: 'devnet',
    activeWallets: keyShardStore.size,
    security: 'key-sharding-enabled',
    memoryOnly: true
  });
});

/**
 * GET /api/security-info
 * Information about security architecture
 */
app.get('/api/security-info', (req, res) => {
  res.json({
    keySharding: {
      algorithm: 'XOR (simplified)',
      shards: 2,
      threshold: '2-of-2',
      backendEncryption: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-SHA256',
      iterations: 100000
    },
    storage: {
      backend: 'Memory only (cleared on restart)',
      frontend: 'sessionStorage (cleared on tab close)',
      persistence: false
    },
    network: 'devnet',
    warnings: [
      'This is a POC - not production ready',
      'Use hardware security modules for production',
      'Implement proper MPC for production',
      'Add audit logging and monitoring'
    ]
  });
});

/**
 * POST /api/token-balance
 * Get EVENT token balance for an address
 */
app.post('/api/token-balance', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !isValidPublicKey(address)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Solana address required'
      });
    }

    if (!tokenConfig) {
      return res.status(503).json({
        success: false,
        error: 'Token system not initialized. Run setup-token.js first.'
      });
    }

    const TOKEN_MINT = tokenConfig.token.mintAddress;
    const POOL_TOKEN_ACCOUNT = tokenConfig.pool.tokenAccount;
    const pubKey = new PublicKey(address);

    // Get user's token account
    const tokenAccounts = await connection.getTokenAccountsByOwner(pubKey, {
      mint: new PublicKey(TOKEN_MINT)
    });

    let balance = 0;
    if (tokenAccounts.value.length > 0) {
      const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
      balance = parseFloat(accountInfo.value.uiAmount) || 0;
    }

    // Also get SOL balance
    const solBalance = await connection.getBalance(pubKey);
    const balanceInSol = solBalance / LAMPORTS_PER_SOL;

    res.json({
      success: true,
      balance: balanceInSol,
      tokenBalance: balance,
      network: 'devnet'
    });
  } catch (error) {
    console.error('[ERROR] Token balance check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/setup-token
 * Initialize EVENT token system
 */
app.post('/api/setup-token', async (req, res) => {
  try {
    // Run the setup-token.js script
    const { execSync } = require('child_process');
    const output = execSync('node setup-token.js', {
      cwd: __dirname,
      stdio: 'pipe'
    }).toString();

    // Reload token config
    const tokenConfigPath = require('path').join(__dirname, 'data', 'token-config.json');
    tokenConfig = JSON.parse(require('fs').readFileSync(tokenConfigPath, 'utf8'));

    res.json({
      success: true,
      message: 'Token system initialized',
      config: tokenConfig
    });
  } catch (error) {
    console.error('[ERROR] Token setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/topup
 * Transfer EVENT tokens from pool to user
 */
app.post('/api/topup', async (req, res) => {
  try {
    const { walletId, shard1, amount } = req.body;

    if (!walletId || !shard1 || !amount) {
      return res.status(400).json({
        success: false,
        error: 'walletId, shard1, and amount are required'
      });
    }

    if (amount <= 0 || amount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between 0 and 10000'
      });
    }

    if (!tokenConfig) {
      return res.status(503).json({
        success: false,
        error: 'Token system not initialized. Run setup-token.js first.'
      });
    }

    // Get pool wallet
    const poolWallet = require('./setup-token').loadWallet();
    if (!poolWallet) {
      return res.status(503).json({
        success: false,
        error: 'Pool wallet not found. Run setup-token.js first.'
      });
    }

    // Get user's public key from sharding
    const encryptedShard2 = keyShardStore.get(walletId);
    if (!encryptedShard2) {
      return res.status(404).json({
        success: false,
        error: 'Shard 2 not found. Wallet may have expired.'
      });
    }

    const shard2 = decryptShard(
      encryptedShard2.encrypted,
      encryptedShard2.iv,
      encryptedShard2.salt,
      encryptedShard2.authTag
    );

    const shard1Buf = Buffer.from(shard1, 'hex');
    const privateKey = Buffer.allocUnsafe(64);
    for (let i = 0; i < shard2.length; i++) {
      privateKey[i] = shard1Buf[i] ^ shard2[i];
    }

    const userKeypair = Keypair.fromSecretKey(privateKey.slice(0, 64));

    // Get or create user's associated token account using helper
    const { getOrCreateAssociatedTokenAccount, transfer } = require('@solana/spl-token');

    console.log('[TOPUP] Getting or creating user token account...');

    const userTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
      connection,
      poolWallet,                                      // Payer for account creation
      new PublicKey(tokenConfig.token.mintAddress),   // Token mint
      userKeypair.publicKey                           // Owner of the token account
    );

    console.log('[TOPUP] Token account:', userTokenAccountInfo.address.toString());

    // Use transfer() helper with CORRECT parameter order from Context7
    const signature = await transfer(
      connection,                                     // 1. Connection
      poolWallet,                                     // 2. Payer (fee payer)
      new PublicKey(tokenConfig.pool.tokenAccount),   // 3. Source (pool's token account)
      userTokenAccountInfo.address,                   // 4. Destination (user's token account)
      poolWallet,                                     // 5. Owner of source account (poolWallet signs)
      Number(amount * 1e9),                           // 6. Amount as Number (9 decimals)
      [],                                             // 7. Multi-signers (none)
      { commitment: "confirmed" }                     // 8. Confirm options
    );

    console.log(`[TOPUP] ${amount} EVENT sent to ${userKeypair.publicKey.toString()}`);

    res.json({
      success: true,
      signature,
      amount,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });
  } catch (error) {
    console.error('[ERROR] Top-up failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage || 'Failed to top-up tokens'
    });
  }
});

/**
 * POST /api/merchant/create
 * Create new merchant
 */
app.post('/api/merchant/create', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Merchant name is required'
      });
    }

    const merchant = store.addMerchant({
      name,
      description: description || ''
    });

    res.json({
      success: true,
      merchant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/merchant/list
 * Get all merchants
 */
app.get('/api/merchant/list', (req, res) => {
  const merchants = store.listMerchants();
  res.json({
    success: true,
    merchants
  });
});

/**
 * PUT /api/merchant/:id
 * Update merchant
 */
app.put('/api/merchant/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const merchant = store.updateMerchant(id, { name, description });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      merchant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/merchant/:id
 * Delete merchant
 */
app.delete('/api/merchant/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = store.deleteMerchant(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      message: 'Merchant deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/merchant/:id/transactions
 * Get merchant transaction history
 */
app.get('/api/merchant/:id/transactions', (req, res) => {
  try {
    const { id } = req.params;
    const transactions = store.getTransactions(id);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/pay
 * Pay merchant with EVENT tokens
 */
app.post('/api/pay', async (req, res) => {
  try {
    const { walletId, shard1, merchantId, amount } = req.body;

    if (!walletId || !shard1 || !merchantId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'walletId, shard1, merchantId, and amount are required'
      });
    }

    if (amount <= 0 || amount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between 0 and 10000'
      });
    }

    const merchant = store.getMerchant(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Get user keypair from shards
    const encryptedShard2 = keyShardStore.get(walletId);
    if (!encryptedShard2) {
      return res.status(404).json({
        success: false,
        error: 'Shard 2 not found. Wallet may have expired.'
      });
    }

    const shard2 = decryptShard(
      encryptedShard2.encrypted,
      encryptedShard2.iv,
      encryptedShard2.salt,
      encryptedShard2.authTag
    );

    const shard1Buf = Buffer.from(shard1, 'hex');
    const privateKey = Buffer.allocUnsafe(64);
    for (let i = 0; i < shard2.length; i++) {
      privateKey[i] = shard1Buf[i] ^ shard2[i];
    }

    const userKeypair = Keypair.fromSecretKey(privateKey.slice(0, 64));

    // Get merchant keypair
    const merchantKeypair = Keypair.fromSecretKey(
      Buffer.from(merchant.secretKey, 'hex')
    );

    if (!tokenConfig) {
      return res.status(503).json({
        success: false,
        error: 'Token system not initialized. Run setup-token.js first.'
      });
    }

    // Create token transfer
    const { createTransferInstruction } = require('@solana/spl-token');

    const transferInstruction = createTransferInstruction(
      await connection.getTokenAccountsByOwner(userKeypair.publicKey, {
        mint: new PublicKey(tokenConfig.token.mintAddress)
      }).then(accounts => accounts.value[0]?.pubkey),
      new PublicKey(tokenConfig.token.mintAddress),
      await connection.getTokenAccountsByOwner(merchantKeypair.publicKey, {
        mint: new PublicKey(tokenConfig.token.mintAddress)
      }).then(accounts => accounts.value[0]?.pubkey),
      userKeypair.publicKey,
      amount * 1e9
    );

    const transaction = new Transaction().add(transferInstruction);
    const signature = await connection.sendTransaction(transaction, [userKeypair]);

    // Record transaction
    store.addTransaction({
      type: 'PAYMENT',
      from: userKeypair.publicKey.toBase58(),
      to: merchant.publicKey,
      amount,
      merchantId,
      merchantName: merchant.name,
      signature
    });

    console.log(`[PAYMENT] ${amount} EVENT sent to ${merchant.name}`);

    res.json({
      success: true,
      signature,
      amount,
      merchant: merchant.name,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });
  } catch (error) {
    console.error('[ERROR] Payment failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
// Start server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Solana POC Backend - Key Sharding Demo            ║
╠══════════════════════════════════════════════════════════════╣
║  Port:        ${PORT}
║  Network:     Devnet only                                   ║
║  Security:    Key sharding (2-of-2)                         ║
║  Storage:     Memory only (no persistence)                  ║
╠══════════════════════════════════════════════════════════════╣
║  ENDPOINTS:                                                 ║
║  POST   /api/store-shard      - Store encrypted shard 2     ║
║  POST   /api/get-balance      - Get SOL balance            ║
║  POST   /api/request-airdrop  - Request devnet airdrop     ║
║  POST   /api/transfer         - Transfer SOL               ║
║  DELETE /api/clear-shard      - Clear shard from memory    ║
║  GET    /api/health          - Health check               ║
║  GET    /api/security-info   - Security details           ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SECURITY] Shutting down server...');
  console.log(`[SECURITY] Clearing ${keyShardStore.size} shards from memory`);
  keyShardStore.clear();
  process.exit(0);
});

module.exports = app;
