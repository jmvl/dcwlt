# Event Wallet Merchant Terminal

QR code generator for accepting Event Token payments via Solana Pay.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your merchant wallet and token address
   ```

3. **Required environment variables:**
   - `MERCHANT_WALLET` - Merchant's Solana wallet address
   - `TOKEN_ADDRESS` - Event Token address from `spl-token create-token`

## Run

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server runs on http://localhost:3001

## How It Works

1. Open merchant terminal in browser: http://localhost:3001
2. Select product (Beer = 5 EVT, Burger = 10 EVT, etc.)
3. Server generates Solana Pay QR code
4. Customer scans QR code with Event Wallet app
5. App initiates token transfer to merchant wallet
6. Payment completes on Solana Devnet

## API Endpoints

### GET /api/qr/:amount

Generate a payment QR code for a specific amount.

**Response:**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "url": "solana:ADDRESS?amount=5&spl-token=TOKEN",
  "amount": 5,
  "recipient": "MERCHANT_WALLET_ADDRESS",
  "token": "TOKEN_ADDRESS"
}
```

### GET /health

Health check endpoint.

### GET /api/status

Service status and configuration info.

## Creating a Merchant Wallet

If you don't have a merchant wallet yet:

```bash
# Generate new merchant wallet
solana-keygen new --outfile ~/merchant-wallet.json --no-passphrase

# Get the public address
solana-keygen pubkey ~/merchant-wallet.json

# Save this address to MERCHANT_WALLET in .env
```

## Testing the Flow

1. Start merchant server: `npm run dev`
2. Open http://localhost:3001
3. Click on a product (e.g., Beer = 5 EVT)
4. QR code will be displayed
5. Scan with Event Wallet mobile app
6. Confirm payment in app
7. Tokens transfer to merchant wallet

## Important Notes

- This is a **POC simulation** - no real money involved
- Uses **Solana Devnet only** (testnet)
- Merchant must have Event Tokens to give change (if needed)
- Token address must match across backend, merchant, and mobile app
- QR codes use Solana Pay protocol format

## Troubleshooting

**"Merchant wallet not configured" error:**
- Ensure `MERCHANT_WALLET` is set in `.env`
- Verify it's a valid Solana address

**"Token address not configured" error:**
- Ensure `TOKEN_ADDRESS` is set in `.env`
- Use the same token address as backend and mobile app

**QR code not generating:**
- Check browser console for errors
- Verify server is running on port 3001
- Ensure both wallet and token are configured
