# Event Wallet Backend

Top-up simulation server for the Event Wallet POC. This server simulates Visa payments by transferring Event Tokens from a bank wallet to user wallets on Solana Devnet.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your bank wallet path and token address
   ```

3. **Required environment variables:**
   - `BANK_WALLET_PATH` - Path to bank wallet JSON file (created during blockchain setup)
   - `TOKEN_ADDRESS` - Event Token address from `spl-token create-token`

## Run

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server runs on http://localhost:3000

## API Endpoints

### POST /api/topup

Simulates a Visa top-up by transferring Event Tokens from the bank wallet to a user wallet.

**Request:**
```json
{
  "walletAddress": "user_wallet_publickey_base58",
  "amount": 50
}
```

**Response (success):**
```json
{
  "success": true,
  "signature": "transaction_signature",
  "amount": 50,
  "message": "Sent 50 Event Tokens",
  "explorerUrl": "https://explorer.solana.com/tx/SIGNATURE?cluster=devnet"
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "event-wallet-backend",
  "bankWalletConfigured": true,
  "tokenAddressConfigured": true,
  "bankWalletAddress": "bank_wallet_publickey",
  "network": "solana-devnet"
}
```

### GET /api/status

Service status and available endpoints.

## How It Works

1. Mobile app calls `/api/topup` with user's wallet address
2. Backend loads bank wallet keypair from `BANK_WALLET_PATH`
3. Backend creates SPL token transfer instruction
4. Backend signs transaction with bank wallet
5. Backend sends transaction to Solana Devnet
6. Returns transaction signature to mobile app

## Important Notes

- This is a **POC simulation** - no real Visa integration
- Uses **Solana Devnet only** (testnet with fake money)
- Bank wallet must have sufficient SOL for gas fees
- Bank wallet must have sufficient Event Tokens to transfer

## Testing

Test the endpoint with curl:
```bash
curl -X POST http://localhost:3000/api/topup \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_WALLET_ADDRESS", "amount": 50}'
```

## Troubleshooting

**"Bank wallet not configured" error:**
- Ensure `BANK_WALLET_PATH` is set in `.env`
- Verify the wallet file exists at the specified path

**"TOKEN_ADDRESS not set" error:**
- Ensure `TOKEN_ADDRESS` is set in `.env`
- This should be the token address from `spl-token create-token`

**Transaction fails:**
- Ensure bank wallet has devnet SOL for fees (`solana balance`)
- Ensure bank wallet has sufficient Event Tokens
- Check that token account exists for bank wallet
