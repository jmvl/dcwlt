# Remaining Tasks for Android Wallet POC

## Quick Summary

All implementation code is **COMPLETE**. Only manual setup steps remain (~1 hour total).

---

## Code Fixes Required (2 minutes)

### 1. Backend Server - Missing Transaction Import

**File**: `backend/src/server.ts`
**Line**: 4

**Current**:
```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
```

**Fix To**:
```typescript
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
```

**Why**: The code uses `new Transaction()` on line 106 but doesn't import `Transaction`.

### 2. Mobile App - DashboardScreen Top-Up Integration

**File**: `event-wallet/src/screens/DashboardScreen.tsx`

The API service exists at `event-wallet/src/services/api.ts` but DashboardScreen still has placeholder code.

**Changes Required**:
1. Add import: `import { topUpWallet, TopUpResponse } from '../services/api';`
2. Add state: `const [isToppingUp, setIsToppingUp] = useState(false);`
3. Replace `handleSimulateTopUp` function with proper API call
4. Update button to show loading state

**Reference**: See `TASK_15_16_COMPLETION.patch` in project root for full patch details.

---

## Manual Setup Steps (~1 hour)

### Step 1: Blockchain Setup (5 minutes)

```bash
# Configure Solana for Devnet
solana config set --url devnet

# Create bank wallet
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase
solana config set --keypair ~/bank-wallet.json

# Get devnet SOL for gas fees
solana airdrop 2

# Create Event Token (SAVE THIS TOKEN ADDRESS!)
spl-token create-token
# Output will show: Token: <TOKEN_ADDRESS>

# Create token account for bank wallet
spl-token create-account <TOKEN_ADDRESS>

# Mint 1,000,000 tokens to bank wallet
spl-token mint <TOKEN_ADDRESS> 1000000

# Verify supply
spl-token supply <TOKEN_ADDRESS>
```

**CRITICAL**: Save the token address to:
- `event-wallet/src/config/constants.ts` (replace `YOUR_TOKEN_ADDRESS_HERE`)
- `backend/.env` (as `TOKEN_ADDRESS=<TOKEN_ADDRESS>`)
- `merchant/.env` (as `TOKEN_ADDRESS=<TOKEN_ADDRESS>`)

### Step 2: Backend Setup (5 minutes)

```bash
cd backend

# Apply the Transaction import fix (see above)
# Then install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file:
# BANK_WALLET_PATH=/Users/jm/bank-wallet.json
# TOKEN_ADDRESS=<from Step 1>

# Start backend server
npm run dev
# Should see: ✅ Bank wallet loaded: <address>
```

**Verify**: Open http://localhost:3000/health - should return JSON with `"status": "ok"`.

### Step 3: Merchant Setup (5 minutes)

```bash
# Create merchant wallet
solana-keygen new --outfile ~/merchant-wallet.json --no-passphrase
solana-keygen pubkey ~/merchant-wallet.json

cd merchant

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file:
# MERCHANT_WALLET=<from pubkey command above>
# TOKEN_ADDRESS=<from Step 1>

# Start merchant server
npm run dev
# Should see: 🏪 Event Wallet Merchant Terminal
```

**Verify**: Open http://localhost:3001 - should see merchant terminal UI.

### Step 4: Web3Auth Setup (2 minutes)

1. Go to https://dashboard.web3auth.io
2. Create a new project
3. Select "React Native" as platform
4. Copy the Client ID
5. Update `event-wallet/app.json`:
   ```json
   "web3auth": {
     "clientId": "YOUR_CLIENT_ID_HERE",
     ...
   }
   ```

### Step 5: Mobile App Integration (5 minutes)

Apply the DashboardScreen changes from `TASK_15_16_COMPLETION.patch` (see "Code Fixes Required" above).

Then:
```bash
cd event-wallet

# Install dependencies (should already be done)
npm install

# Build development client
npx expo run:android
```

---

## Testing Flow (20 minutes)

Once all services are running:

1. **Test Backend Top-Up**:
   ```bash
   curl -X POST http://localhost:3000/api/topup \
     -H "Content-Type: application/json" \
     -d '{"walletAddress":"<your_wallet>","amount":50}'
   ```
   Should return: `{"success":true,"signature":"..."}`

2. **Test Merchant QR**:
   ```bash
   curl http://localhost:3001/api/qr/5
   ```
   Should return: `{"success":true,"qrCode":"data:image/png;base64,..."}`

3. **Test Mobile App**:
   - App opens on Android device/emulator
   - Tap "Continue with Google"
   - Complete Gmail login via Web3Auth
   - See wallet address on dashboard
   - Tap "Simulate Top Up"
   - Wait for transaction confirmation
   - Balance updates to 50 EVT
   - Open merchant terminal (localhost:3001)
   - Select product (e.g., Beer = 5 EVT)
   - Tap "Scan to Pay" in app
   - Scan QR code
   - Confirm payment
   - Balance updates to 45 EVT

4. **Verify on Explorer**:
   - Open https://explorer.solana.com/?cluster=devnet
   - Search for your wallet address
   - Should see transactions

---

## File Structure Reference

```
dcwlt/
├── event-wallet/              # React Native app
│   ├── src/
│   │   ├── config/constants.ts    # ⚠️ UPDATE with token address
│   │   ├── services/api.ts        # ✅ Top-up API service
│   │   ├── screens/
│   │   │   └── DashboardScreen.tsx  # ⚠️ UPDATE with top-up integration
│   │   └── contexts/Web3AuthContext.tsx
│   ├── app.json               # ⚠️ UPDATE with Web3Auth Client ID
│   └── package.json           # ✅ Dependencies installed
│
├── backend/                   # Top-up server
│   ├── src/server.ts          # ⚠️ FIX: Add Transaction import
│   ├── .env.example           # ✅ Template ready
│   └── package.json           # ✅ Dependencies configured
│
├── merchant/                  # QR generator
│   ├── src/server.ts          # ✅ Complete
│   ├── public/index.html      # ✅ Web UI ready
│   ├── .env.example           # ✅ Template ready
│   └── package.json           # ✅ Dependencies configured
│
└── TASK_15_16_COMPLETION.patch   # 📄 Full patch details
```

---

## Success Criteria Checklist

- [ ] Solana Devnet configured
- [ ] Bank wallet created and funded
- [ ] Event Token created and minted (1M tokens)
- [ ] Token address saved to all config files
- [ ] Backend server running on localhost:3000
- [ ] Merchant server running on localhost:3001
- [ ] Web3Auth Client ID configured
- [ ] DashboardScreen integrated with top-up API
- [ ] Backend Transaction import fixed
- [ ] Android development client built
- [ ] Complete flow tested (login → top-up → payment)
- [ ] Transaction visible on Solana explorer

---

## Next Steps

1. Apply code fixes (2 min)
2. Complete blockchain setup (5 min)
3. Configure and start services (10 min)
4. Build and test mobile app (30 min)
5. Create final documentation (Task 20)

**Total Time**: ~1 hour

---

## Troubleshooting

### Backend: "Bank wallet file not found"
- Ensure you created the wallet at `~/bank-wallet.json`
- Check `BANK_WALLET_PATH` in `backend/.env`

### Backend: "TOKEN_ADDRESS not set"
- Complete Step 1 (blockchain setup) first
- Save token address to `backend/.env`

### Mobile: "Token address not configured"
- Update `event-wallet/src/config/constants.ts`
- Replace `YOUR_TOKEN_ADDRESS_HERE` with actual token address

### Mobile: "Top-up failed"
- Ensure backend is running on localhost:3000
- Check backend logs for errors
- Verify bank wallet has tokens

### Merchant: QR code shows error
- Check `TOKEN_ADDRESS` in `merchant/.env`
- Verify `MERCHANT_WALLET` is set correctly

---

## Architecture Reminder

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Gmail     │─────>│   Web3Auth   │─────>│ Solana      │
│   (Login)   │      │   (Key Gen)  │      │ Devnet      │
└─────────────┘      └──────────────┘      └─────────────┘
                                                      │
                                                      v
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Merchant   │<─────│    QR Pay    │<─────│   Balance   │
│  Terminal   │      │   (Scanner)  │      │  (Display)  │
└─────────────┘      └──────────────┘      └─────────────┘
```

All blockchain operations use **Solana Devnet only** - no real money involved.
