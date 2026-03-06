const QRCode = require('qrcode');

// Simple SOL payment QR (no token needed for initial testing)
const url = 'solana:7UX2i7SucgLMQcfZ75s3DxQnZn8uBQHcNPvGJFyFMaE?amount=1000&label=Test+Merchant&message=Test+payment';

QRCode.toFile(
  'test-payment-qr.png',
  url,
  {
    width: 400,
    margin: 2,
  },
  (error) => {
    if (error) {
      console.error('Error generating QR code:', error);
      process.exit(1);
    }
    console.log('\n✅ QR code generated!');
    console.log('📁 File: test-payment-qr.png');
    console.log('🔗 URL:', url);
    console.log('\n💡 Open this file on your phone or scan from another device');
  }
);
