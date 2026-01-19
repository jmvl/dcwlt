const { Keypair } = require('@solana/web3.js');
const crypto = require('crypto');

// Generate a real keypair
const keypair = Keypair.generate();
const privateKey = Buffer.from(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

// Create shards (XOR sharding)
const shard1 = crypto.randomBytes(64);
const shard2 = Buffer.alloc(64);

for (let i = 0; i < 64; i++) {
  shard2[i] = privateKey[i] ^ shard1[i];
}

const shard1Hex = shard1.toString('hex');
const shard2Hex = shard2.toString('hex');
const walletId = 'real-wallet-' + Date.now();

console.log('Generated Real Wallet:');
console.log('Wallet ID:', walletId);
console.log('Public Key:', publicKey);
console.log('Shard1 (first 16 chars):', shard1Hex.substring(0, 16) + '...');
console.log('Shard2 (first 16 chars):', shard2Hex.substring(0, 16) + '...');
console.log('');

// Now test the flow with fetch
async function testTopUp() {
  const baseURL = 'http://localhost:3001/api';
  
  // Step 1: Store shard 2
  console.log('Step 1: Storing Shard 2...');
  const storeRes = await fetch(`${baseURL}/store-shard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletId, shard2: shard2Hex })
  });
  const storeData = await storeRes.json();
  console.log('Store Response:', JSON.stringify(storeData, null, 2));
  console.log('');
  
  // Step 2: Perform top-up
  console.log('Step 2: Topping up 50 EVENT tokens...');
  const topupRes = await fetch(`${baseURL}/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      walletId, 
      shard1: shard1Hex, 
      amount: 50 
    })
  });
  const topupData = await topupRes.json();
  console.log('Top-Up Response:', JSON.stringify(topupData, null, 2));
  console.log('');
  
  // Step 3: Check balance
  console.log('Step 3: Checking token balance...');
  const balanceRes = await fetch(`${baseURL}/token-balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: publicKey })
  });
  const balanceData = await balanceRes.json();
  console.log('Balance Response:', JSON.stringify(balanceData, null, 2));
  
  return { storeData, topupData, balanceData };
}

testTopUp().then(results => {
  console.log('');
  console.log('========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log('Store Shard 2:', results.storeData.success ? '✅ PASS' : '❌ FAIL');
  console.log('Top-Up:', results.topupData.success ? '✅ PASS' : '❌ FAIL');
  console.log('Final Balance:', results.balanceData.tokenBalance, 'tokens');
  
  if (results.topupData.signature) {
    console.log('');
    console.log('Transaction Signature:', results.topupData.signature);
    console.log('Explorer URL:', results.topupData.explorerUrl);
  }
}).catch(err => {
  console.error('Test failed:', err);
});
