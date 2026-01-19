const QRCode = require('qrcode');

// EVT Token Info
const EVT_MINT = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';
const EVT_DECIMALS = 9;

// Merchant wallet (you can replace this with a real merchant wallet)
const MERCHANT_WALLET = 'CeJrezfkhgphNCtSSjCVpZVdy1cY467EywuxiAj3hVVY'; // Bank wallet acting as merchant for testing

// Generate payment URLs for different test scenarios
const scenarios = [
  {
    name: 'beer-5-evt',
    label: 'Test Merchant - Beer',
    message: 'Delicious craft beer',
    amount: '5000000000', // 5 EVT (5 * 10^9)
    description: '5 EVT for a beer'
  },
  {
    name: 'water-2-evt',
    label: 'Test Merchant - Water',
    message: 'Refreshing bottled water',
    amount: '2000000000', // 2 EVT
    description: '2 EVT for water'
  },
  {
    name: 'snacks-1-evt',
    label: 'Test Merchant - Snacks',
    message: 'Mixed snacks pack',
    amount: '1000000000', // 1 EVT
    description: '1 EVT for snacks'
  },
  {
    name: 'coffee-3-evt',
    label: 'Test Merchant - Coffee',
    message: 'Hot premium coffee',
    amount: '3000000000', // 3 EVT
    description: '3 EVT for coffee'
  }
];

console.log('\n🎫 Generating EVT Payment QR Codes...\n');

let completed = 0;
scenarios.forEach(scenario => {
  const labelEncoded = encodeURIComponent(scenario.label);
  const messageEncoded = encodeURIComponent(scenario.message);

  // Solana Pay URL format
  const url = `solana:${MERCHANT_WALLET}?amount=${scenario.amount}&spl-token=${EVT_MINT}&label=${labelEncoded}&message=${messageEncoded}`;

  QRCode.toFile(
    `test-qr-${scenario.name}.png`,
    url,
    {
      width: 400,
      margin: 2,
    },
    (error) => {
      completed++;
      if (error) {
        console.error(`❌ Error generating ${scenario.name}:`, error.message);
        if (completed === scenarios.length) {
          printInstructions();
        }
        return;
      }
      console.log(`✅ ${scenario.description}`);
      console.log(`   📁 test-qr-${scenario.name}.png`);
      console.log(`   🏪 ${scenario.label}`);
      console.log(`   💰 ${scenario.amount / 1e9} EVT`);
      console.log('');

      if (completed === scenarios.length) {
        printInstructions();
      }
    }
  );
});

function printInstructions() {
  console.log('\n📱 How to test:');
  console.log('1. Open one of the QR images on another device or print it');
  console.log('2. In the PWA, go to Dashboard → "Scan QR"');
  console.log('3. Scan the QR code');
  console.log('4. Confirm the payment details show correctly');
  console.log('5. Wait 3 seconds for safety countdown');
  console.log('6. Tap "Confirm Payment"');
  console.log('7. Sign with Privy (requires SOL for gas fees)');
  console.log('8. View transaction on Solana Explorer\n');

  console.log('🔗 EVT Token on Explorer:');
  console.log('https://explorer.solana.com/address/4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq?cluster=devnet\n');

  console.log('💡 Need SOL for gas? Airdrop on Devnet:');
  console.log('https://faucet.solana.com/\n');
}
