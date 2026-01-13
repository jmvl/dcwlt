# Task 15 - Backend Server - Remaining Steps

The backend Express server is 99% complete. Follow these steps to finish:

## Step 1: Fix Transaction Import

Edit `backend/src/server.ts` line 4:

**FROM:**
```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
```

**TO:**
```typescript
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
```

This fixes the error: `Transaction is not defined` (line 106 uses Transaction but it's not imported).

## Step 2: Install Dependencies

```bash
cd /Users/jm/Codebase/dcwlt/backend
npm install
```

This will install ~100 packages including:
- @solana/web3.js
- @solana/spl-token
- express
- cors
- dotenv
- TypeScript dev dependencies

## Step 3: Create .env File

```bash
cd /Users/jm/Codebase/dcwlt/backend
cp .env.example .env
```

Then edit `.env` and add:
```bash
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

## Step 4: Verify

```bash
# Build TypeScript
npm run build

# Start server (development mode)
npm run dev
```

Server should start on http://localhost:3000

## API Endpoints

Once running:

```bash
# Health check
curl http://localhost:3000/health

# Top-up (requires wallet address and token configured)
curl -X POST http://localhost:3000/api/topup \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_WALLET_ADDRESS", "amount": 50}'
```

## Next Task

After backend is running, Task 16 integrates the `/api/topup` endpoint with the mobile app's DashboardScreen.
