# Task 15 Completion Guide

Backend Express server code is complete. Follow these steps to finish Task 15.

## Files Created ✅

1. `backend/src/server.ts` - Express server (5.9KB)
2. `backend/package.json` - Dependencies configured
3. `backend/tsconfig.json` - TypeScript configuration
4. `backend/.env.example` - Environment template
5. `backend/README.md` - Setup documentation
6. `backend/FIX_IMPORT.patch` - Patch file for Transaction import

## Step 1: Fix the Import

**Option A - Apply the patch:**
```bash
cd /Users/jm/Codebase/dcwlt/backend
patch -p1 < FIX_IMPORT.patch
```

**Option B - Manual fix:**
Edit `backend/src/server.ts` line 4:
```typescript
// FROM:
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

// TO:
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
```

## Step 2: Install Dependencies

```bash
cd /Users/jm/Codebase/dcwlt/backend
npm install
```

Expected output: ~1387 packages installed

## Step 3: Configure Environment

```bash
cd /Users/jm/Codebase/dcwlt/backend
cp .env.example .env
```

Then edit `.env` with:
```bash
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

## Step 4: Verify Installation

```bash
# Build TypeScript
npm run build

# Test run (if wallet and token are configured)
npm run dev
```

Server should start on http://localhost:3000

## Step 5: Test the API

Once server is running, test health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "event-wallet-backend",
  "bankWalletConfigured": false,
  "tokenAddressConfigured": false,
  "bankWalletAddress": null,
  "network": "solana-devnet"
}
```

## What the Server Does

The backend provides `/api/topup` endpoint that:
1. Receives wallet address and amount from mobile app
2. Loads bank wallet keypair
3. Creates SPL token transfer instruction
4. Signs and sends transaction to Solana Devnet
5. Returns transaction signature

This simulates the "Visa top-up" feature by transferring tokens from the bank wallet to user wallets.

## Next Task (Task 16)

After backend is running, Task 16 will integrate the `/api/topup` endpoint with the mobile app's DashboardScreen component.
