/**
 * Solana POC - Token Setup Script
 *
 * This script initializes the EVENT token system on Solana Devnet:
 * 1. Creates a pool wallet keypair
 * 2. Requests SOL airdrop for gas fees
 * 3. Creates EVENT token SPL mint
 * 4. Creates token account for pool
 * 5. Mints 1,000,000 EVENT tokens to pool
 * 6. Saves configuration to backend/data/token-config.json
 *
 * Usage: node setup-token.js
 *
 * Environment: Solana Devnet (testnet only)
 */

const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction
} = require('@solana/web3.js');
const {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Configuration
const DEVNET_RPC_URL = 'https://api.devnet.solana.com';
const TOKEN_SUPPLY = 1000000; // 1 million EVENT tokens
const TOKEN_DECIMALS = 9; // Standard SPL token decimals
const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'token-config.json');
const WALLET_FILE = path.join(DATA_DIR, 'pool-wallet.json');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

/**
 * Logs a message with color and timestamp
 */
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Ensures the data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    log('Created data directory', colors.green);
  }
}

/**
 * Saves the pool wallet keypair to disk
 */
function saveWallet(keypair) {
  const secretKey = Array.from(keypair.secretKey);
  fs.writeFileSync(
    WALLET_FILE,
    JSON.stringify(secretKey, null, 2),
    { mode: 0o600 } // Read/write for owner only
  );
  log(`Pool wallet saved to: ${WALLET_FILE}`, colors.green);
}

/**
 * Loads the pool wallet keypair from disk
 */
function loadWallet() {
  if (fs.existsSync(WALLET_FILE)) {
    const secretKeyArray = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  }
  return null;
}

/**
 * Saves token configuration to disk
 */
function saveTokenConfig(config) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(config, null, 2)
  );
  log(`Token configuration saved to: ${CONFIG_FILE}`, colors.green);
}

/**
 * Requests an airdrop of SOL for gas fees
 */
async function requestAirdrop(connection, keypair, amountSol = 2) {
  const signature = await connection.requestAirdrop(
    keypair.publicKey,
    amountSol * LAMPORTS_PER_SOL
  );

  log(`Airdrop requested: ${amountSol} SOL`, colors.yellow);
  log(`Transaction signature: ${signature}`, colors.blue);

  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed');

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  log(`Confirmed balance: ${balance / LAMPORTS_PER_SOL} SOL`, colors.green);

  return signature;
}

/**
 * Creates the EVENT token mint
 */
async function createEventToken(connection, payer, mintAuthority) {
  log('Creating EVENT token mint...', colors.yellow);

  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null, // Freeze authority (none)
    TOKEN_DECIMALS
  );

  log(`EVENT token mint created: ${mint.toBase58()}`, colors.green);

  return mint;
}

/**
 * Creates a token account for the pool wallet
 */
async function createTokenAccount(connection, payer, mint, owner) {
  log('Creating token account for pool wallet...', colors.yellow);

  const tokenAccount = await createAccount(
    connection,
    payer,
    mint,
    owner.publicKey
  );

  log(`Token account created: ${tokenAccount.toBase58()}`, colors.green);

  return tokenAccount;
}

/**
 * Mints EVENT tokens to the pool's token account
 */
async function mintEventTokens(connection, payer, mint, destination, amount) {
  log(`Minting ${amount} EVENT tokens...`, colors.yellow);

  const signature = await mintTo(
    connection,
    payer,
    mint,
    destination,
    payer, // Mint authority
    amount * Math.pow(10, TOKEN_DECIMALS)
  );

  log(`Tokens minted successfully`, colors.green);
  log(`Transaction signature: ${signature}`, colors.blue);

  return signature;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('\n' + colors.bright + colors.blue + '='.repeat(60));
    console.log('Solana POC - EVENT Token Setup');
    console.log('='.repeat(60) + colors.reset + '\n');

    // Ensure data directory exists
    ensureDataDir();

    // Initialize connection to Solana Devnet
    log(`Connecting to Solana Devnet: ${DEVNET_RPC_URL}`, colors.blue);
    const connection = new Connection(DEVNET_RPC_URL, 'confirmed');

    // Check if wallet already exists
    let poolWallet = loadWallet();
    let isNewWallet = false;

    if (!poolWallet) {
      log('Creating new pool wallet...', colors.yellow);
      poolWallet = Keypair.generate();
      saveWallet(poolWallet);
      isNewWallet = true;
    } else {
      log('Loaded existing pool wallet', colors.green);
    }

    log(`Pool wallet address: ${poolWallet.publicKey.toBase58()}`, colors.blue);

    // Request airdrop for new wallets or low balance
    const balance = await connection.getBalance(poolWallet.publicKey);
    log(`Current SOL balance: ${balance / LAMPORTS_PER_SOL} SOL`, colors.blue);

    if (isNewWallet || balance < 0.5 * LAMPORTS_PER_SOL) {
      log('Insufficient SOL for gas fees, requesting airdrop...', colors.yellow);

      try {
        await requestAirdrop(connection, poolWallet, 2);
      } catch (airdropError) {
        if (airdropError.message.includes('429') || airdropError.message.includes('airdrop limit')) {
          console.log('\n' + colors.red + 'Airdrop rate limit reached!' + colors.reset);
          console.log(colors.yellow + 'The Devnet faucet has a daily limit. To get test SOL:' + colors.reset);
          console.log('');
          console.log('  1. Visit https://faucet.solana.com');
          console.log(`  2. Enter this wallet address: ${colors.bright}${poolWallet.publicKey.toBase58()}${colors.reset}`);
          console.log('  3. Request airdrop from the web faucet');
          console.log('  4. Wait for the SOL to arrive (usually 10-30 seconds)');
          console.log('  5. Run this script again: node setup-token.js');
          console.log('');
          console.log(colors.yellow + 'Alternative: Use Solana CLI' + colors.reset);
          console.log(`  solana airdrop 2 ${poolWallet.publicKey.toBase58()} --url devnet`);
          console.log('');

          // Save wallet config so user can retry with same wallet
          const partialConfig = {
            network: 'devnet',
            poolAddress: poolWallet.publicKey.toBase58(),
            message: 'Wallet created. Please fund it using the methods above and re-run this script.'
          };
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(partialConfig, null, 2));

          process.exit(1);
        } else {
          throw airdropError;
        }
      }
    } else {
      log('Sufficient SOL balance for operations', colors.green);
    }

    // Create EVENT token mint
    const eventMint = await createEventToken(
      connection,
      poolWallet,
      poolWallet
    );

    // Create token account for pool
    const poolTokenAccount = await createTokenAccount(
      connection,
      poolWallet,
      eventMint,
      poolWallet
    );

    // Mint tokens to pool
    await mintEventTokens(
      connection,
      poolWallet,
      eventMint,
      poolTokenAccount,
      TOKEN_SUPPLY
    );

    // Save configuration
    const config = {
      network: 'devnet',
      rpcUrl: DEVNET_RPC_URL,
      token: {
        name: 'EVENT',
        symbol: 'EVENT',
        decimals: TOKEN_DECIMALS,
        supply: TOKEN_SUPPLY,
        mintAddress: eventMint.toBase58(),
        totalSupplyRaw: TOKEN_SUPPLY * Math.pow(10, TOKEN_DECIMALS)
      },
      pool: {
        address: poolWallet.publicKey.toBase58(),
        tokenAccount: poolTokenAccount.toBase58()
      },
      createdAt: new Date().toISOString()
    };

    saveTokenConfig(config);

    // Display summary
    console.log('\n' + colors.bright + colors.green + '='.repeat(60));
    console.log('Token Setup Complete!');
    console.log('='.repeat(60) + colors.reset + '\n');

    console.log(colors.bright + 'EVENT Token Details:' + colors.reset);
    console.log(`  Mint Address:  ${colors.blue}${config.token.mintAddress}${colors.reset}`);
    console.log(`  Total Supply:  ${colors.blue}${config.token.supply.toLocaleString()} EVENT${colors.reset}`);
    console.log(`  Decimals:      ${colors.blue}${config.token.decimals}${colors.reset}`);

    console.log('\n' + colors.bright + 'Pool Wallet Details:' + colors.reset);
    console.log(`  Address:       ${colors.blue}${config.pool.address}${colors.reset}`);
    console.log(`  Token Account: ${colors.blue}${config.pool.tokenAccount}${colors.reset}`);

    console.log('\n' + colors.bright + 'Configuration Files:' + colors.reset);
    console.log(`  Wallet:        ${colors.yellow}${WALLET_FILE}${colors.reset}`);
    console.log(`  Config:        ${colors.yellow}${CONFIG_FILE}${colors.reset}`);

    console.log('\n' + colors.bright + colors.green + '✓ Setup complete! You can now start the backend server.' + colors.reset);
    console.log('');

  } catch (error) {
    console.error('\n' + colors.red + 'Error during token setup:' + colors.reset);
    console.error(colors.red + error.message + colors.reset);

    if (error.logs) {
      console.error(colors.red + 'Transaction logs:' + colors.reset);
      error.logs.forEach(log => console.error(colors.red + '  ' + log + colors.reset));
    }

    process.exit(1);
  }
}

// Export functions for use by server.js
module.exports = {
  loadWallet,
  saveWallet,
  saveTokenConfig
};

// Run the script if this is the main module (not when imported)
if (require.main === module) {
  main();
}
