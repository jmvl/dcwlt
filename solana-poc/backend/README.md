# Solana POC Backend

Backend server for Solana POC with merchant wallet management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Seeding Merchant Wallets

Generate 10 pre-seeded merchant wallets with SOL airdrops:

```bash
node seed-merchants.js
```

This will:
- Generate unique Solana keypairs for each merchant
- Request 0.1 SOL airdrop per wallet (for gas fees)
- Save merchant data to `data/merchants.json`

### Generated Merchants

1. Coffee Shop #1 - Downtown location
2. Coffee Shop #2 - Uptown location
3. Book Store - Main Street
4. Electronics Store - Mall location
5. Restaurant - Fine dining
6. Gas Station - Highway exit 5
7. Grocery Store - Organic foods
8. Pharmacy - 24/7 open
9. Gym - Fitness center
10. Movie Theater - Cinema complex

### Merchant Data Structure

Each merchant in `data/merchants.json` contains:
```json
{
  "id": "merchant-1",
  "name": "Coffee Shop #1",
  "description": "Downtown location - Fresh coffee and pastries",
  "publicKey": "Base58EncodedPublicKey",
  "secretKey": "HexEncodedSecretKey",
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

## Security Warning

**CRITICAL**: The `data/merchants.json` file contains SECRET KEYS.

- Never commit this file to version control
- The file is already in `.gitignore`
- In production, use proper key management (HSM, AWS KMS, etc.)
- These are devnet wallets only - never use on mainnet

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### GET /api/merchants
Returns list of all merchants (public information only)

Response:
```json
{
  "merchants": [
    {
      "id": "merchant-1",
      "name": "Coffee Shop #1",
      "description": "Downtown location",
      "publicKey": "..."
    }
  ]
}
```

### GET /api/merchants/:id
Get specific merchant by ID

### POST /api/transfer
Create a transfer transaction from user to merchant

Request:
```json
{
  "fromPublicKey": "userPublicKey",
  "toMerchantId": "merchant-1",
  "amount": 5,
  "splToken": "tokenAddress" // optional
}
```

## Environment Variables

```env
# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Server Configuration
PORT=3000
NODE_ENV=development

# Token Configuration (if using SPL tokens)
TOKEN_ADDRESS=your_token_address_here
```
