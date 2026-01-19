/**
 * Seed Merchant Wallets for Solana POC
 *
 * This script generates 10 pre-seeded merchant wallets with:
 * - Unique Solana keypairs
 * - 0.1 SOL airdrop for gas fees
 * - Metadata saved to backend/data/merchants.json
 *
 * Usage:
 *   node seed-merchants.js
 */

const fs = require('fs');
const path = require('path');
const { Keypair, Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Merchant configuration
const MERCHANTS = [
  {
    name: 'Coffee Shop #1',
    description: 'Downtown location - Fresh coffee and pastries'
  },
  {
    name: 'Coffee Shop #2',
    description: 'Uptown location - Artisan coffee blends'
  },
  {
    name: 'Book Store',
    description: 'Main Street - Wide selection of books and magazines'
  },
  {
    name: 'Electronics Store',
    description: 'Mall location - Latest gadgets and accessories'
  },
  {
    name: 'Restaurant',
    description: 'Fine dining experience - International cuisine'
  },
  {
    name: 'Gas Station',
    description: 'Highway exit 5 - Fuel and convenience store'
  },
  {
    name: 'Grocery Store',
    description: 'Organic foods - Fresh produce and sustainable products'
  },
  {
    name: 'Pharmacy',
    description: '24/7 open - Prescription and health products'
  },
  {
    name: 'Gym',
    description: 'Fitness center - State-of-the-art equipment'
  },
  {
    name: 'Movie Theater',
    description: 'Cinema complex - Latest blockbusters and classics'
  }
];

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const MERCHANTS_FILE = path.join(DATA_DIR, 'merchants.json');
const AIRDROP_AMOUNT = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`Creating data directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Generate a merchant wallet with keypair
 */
function generateMerchantWallet(id, merchantInfo) {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString('hex');

  return {
    id: `merchant-${id}`,
    name: merchantInfo.name,
    description: merchantInfo.description,
    publicKey,
    secretKey,
    createdAt: new Date().toISOString()
  };
}

/**
 * Request airdrop for a merchant wallet
 */
async function requestAirdrop(connection, publicKey, retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  try {
    console.log(`  Requesting airdrop for ${publicKey}...`);
    const signature = await connection.requestAirdrop(publicKey, AIRDROP_AMOUNT);

    console.log(`  Airdrop signature: ${signature}`);
    console.log(`  Confirming transaction...`);

    const confirmation = await connection.confirmTransaction(signature);

    if (confirmation.value.err) {
      throw new Error(`Airdrop transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    const balance = await connection.getBalance(publicKey);
    console.log(`  ✓ Airdrop successful! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    return true;
  } catch (error) {
    console.error(`  ✗ Airdrop failed: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`  Retrying airdrop (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return requestAirdrop(connection, publicKey, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('=== Solana POC - Merchant Seeding Script ===\n');

  // Determine Solana network
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = network === 'devnet'
    ? 'https://api.devnet.solana.com'
    : 'http://localhost:8899'; // Localhost for local validator

  console.log(`Network: ${network}`);
  console.log(`RPC URL: ${rpcUrl}\n`);

  // Initialize connection
  const connection = new Connection(rpcUrl, 'confirmed');

  // Ensure data directory exists
  ensureDataDir();

  // Check if merchants file already exists
  if (fs.existsSync(MERCHANTS_FILE)) {
    console.log(`Warning: ${MERCHANTS_FILE} already exists.`);
    console.log('To regenerate merchants, delete the existing file first.\n');
    const existing = JSON.parse(fs.readFileSync(MERCHANTS_FILE, 'utf8'));
    console.log(`Existing merchants: ${existing.length}`);
    return;
  }

  // Generate merchant wallets
  console.log('Generating merchant wallets...\n');
  const merchants = [];

  for (let i = 0; i < MERCHANTS.length; i++) {
    const merchantInfo = MERCHANTS[i];
    const id = i + 1;

    console.log(`[${id}/${MERCHANTS.length}] Creating ${merchantInfo.name}...`);

    const merchant = generateMerchantWallet(id, merchantInfo);
    const publicKey = new Keypair({
      secretKey: Buffer.from(merchant.secretKey, 'hex')
    }).publicKey;

    try {
      // Request airdrop
      await requestAirdrop(connection, publicKey);

      merchants.push(merchant);
      console.log(`  ✓ Merchant created successfully\n`);
    } catch (error) {
      console.error(`  ✗ Failed to create merchant: ${error.message}\n`);
      console.error('  Merchant keypair was generated but not airdropped.');
      console.error('  You can airdrop manually later using the saved data.\n');

      // Still save the merchant even if airdrop failed
      merchants.push(merchant);
    }
  }

  // Save to file
  console.log(`Saving merchant data to ${MERCHANTS_FILE}...`);
  fs.writeFileSync(
    MERCHANTS_FILE,
    JSON.stringify(merchants, null, 2),
    'utf8'
  );

  console.log('\n=== Summary ===');
  console.log(`Total merchants created: ${merchants.length}`);
  console.log(`Data saved to: ${MERCHANTS_FILE}`);
  console.log('\nMerchant Public Keys:');
  merchants.forEach(m => {
    console.log(`  ${m.name}: ${m.publicKey}`);
  });

  console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
  console.log('  - The merchants.json file contains SECRET KEYS');
  console.log('  - Never commit this file to version control');
  console.log('  - Add merchants.json to .gitignore');
  console.log('  - In production, use proper key management (HSM, AWS KMS, etc.)');
  console.log('  - These are devnet wallets only - never use on mainnet');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { generateMerchantWallet, MERCHANTS };
