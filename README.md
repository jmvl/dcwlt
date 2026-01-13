# DCWLT - Event Wallet POC

Proof of Concept Android app demonstrating "Gmail Login → Wallet → Simulated Visa Top-Up → QR Payment" flow using Solana Devnet.

## Overview

This POC demonstrates a complete event-based crypto wallet experience where users can:
- Sign in with Gmail to generate a Solana wallet
- Top up their wallet with simulated Event Tokens (EVT)
- Scan QR codes at merchant terminals to make payments
- View real-time balance updates on Solana Devnet

**Important**: This is a POC running on Solana Devnet only. No real money is involved.

## Architecture

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

## Project Structure

```
dcwlt/
├── event-wallet/          # React Native Android app (Expo)
│   ├── src/
│   │   ├── contexts/      # Web3Auth context provider
│   │   ├── screens/       # Login, Dashboard, QR Scanner
│   │   ├── navigation/    # React Navigation setup
│   │   ├── services/      # API services
│   │   ├── utils/         # Solana utilities
│   │   └── config/        # Constants (token addresses)
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── backend/              # Top-up simulation server (Express)
│   ├── src/
│   │   └── server.ts     # POST /api/topup endpoint
│   ├── .env
│   └── package.json
├── merchant/             # QR code generator (Express)
│   ├── src/
│   │   └── server.ts
│   ├── public/
│   │   └── index.html    # Merchant terminal UI
│   ├── .env
│   └── package.json
├── blockchain-notes.md   # Token addresses and commands reference
├── @fix_plan.md         # Task tracking and status
└── README.md           # This file
```

## Prerequisites

- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **Solana CLI** ([docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools))
- **Android Studio** with emulator or physical device
- **Expo CLI** (`npm install -g expo-cli`)

## Quick Start

### 1. Blockchain Setup (One-Time)

```bash
# Configure Solana for Devnet
solana config set --url devnet

# Create bank wallet (holds all Event Tokens)
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase
solana config set --keypair ~/bank-wallet.json

# Get devnet SOL for gas fees
solana airdrop 2

# Create the Event Token (SAVE THE OUTPUT TOKEN ADDRESS!)
spl-token create-token
spl-token create-account <TOKEN_ADDRESS>
spl-token mint <TOKEN_ADDRESS> 1000000

# Verify token supply
spl-token supply <TOKEN_ADDRESS>
```

**Critical**: The token address from `spl-token create-token` must be saved to:
- `event-wallet/src/config/constants.ts`
- `backend/.env`
- `merchant/.env`

### 2. Backend Service (Top-Up Simulation)

```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:3000
```

**Configure `.env`**:
```bash
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=<your_token_address_from_step_1>
```

### 3. Merchant Service (QR Generator)

```bash
cd merchant
npm install
npm run dev          # Starts on http://localhost:3001
```

**Configure `.env`**:
```bash
# Generate a merchant wallet: solana-keygen new --outfile ~/merchant-wallet.json
MERCHANT_WALLET=<merchant_wallet_address>
TOKEN_ADDRESS=<your_token_address_from_step_1>
```

### 4. Android App

```bash
cd event-wallet
npm install

# Update src/config/constants.ts with your token address
# Update app.json with your Web3Auth Client ID (see below)

# Build and run (requires Android emulator/device)
npx expo run:android
```

**Important**: This app requires a custom development client. Cannot use Expo Go due to crypto libraries.

## Web3Auth Setup

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io)
2. Create a new project:
   - Name: "Event Wallet POC"
   - Network: Testnet (Sapphire Devnet)
   - Chain: Solana
3. Copy the Client ID
4. Update `event-wallet/app.json`:
   ```json
   "extra": {
     "web3authClientId": "your_client_id_here"
   }
   ```
5. Add whitelist URL: `eventwallet://auth`

## Testing the Complete Flow

1. **Start Services**:
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd merchant && npm run dev

   # Terminal 3
   cd event-wallet && npx expo run:android
   ```

2. **Open Merchant Terminal**: http://localhost:3001

3. **Test on Android App**:
   - Open Event Wallet app
   - Tap "Continue with Google"
   - Sign in with Gmail
   - Verify wallet address is displayed
   - Tap "Simulate Top Up"
   - Verify balance shows "50.00 EVT"
   - Tap "Scan to Pay"
   - Scan merchant QR code (e.g., Beer = 5 EVT)
   - Confirm payment
   - Verify success message and balance updates to "45.00 EVT"

4. **Verify Transaction**: https://explorer.solana.com/?cluster=devnet

## Tech Stack

### Mobile App (event-wallet/)
- **Framework**: Expo SDK 50+ with custom dev client
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Authentication**: Web3Auth React Native SDK
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **Camera**: expo-camera, expo-barcode-scanner
- **Polyfills**: react-native-get-random-values, react-native-buffer

### Backend Services
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **QR Generation**: qrcode
- **Environment**: dotenv

## Development Commands

### Blockchain
```bash
solana config get                    # Check current config
solana balance                       # Check wallet balance
spl-token supply <TOKEN_ADDRESS>     # Check token supply
spl-token balance <TOKEN_ADDRESS>    # Check token balance
```

### Backend
```bash
npm run dev    # Start development server
npm run build  # Compile TypeScript
npm start      # Production mode
```

### Merchant
```bash
npm run dev    # Start development server
npm run build  # Compile TypeScript
npm start      # Production mode
```

### Mobile App
```bash
npx expo start --no-dev --minify  # Start without Expo Go
npx expo run:android              # Build and run on Android
```

## Configuration Files

### Token Address Management

The Event Token address must be configured in:

1. **event-wallet/src/config/constants.ts**:
   ```typescript
   export const TOKEN_ADDRESS = 'your_token_address_here';
   ```

2. **backend/.env**:
   ```
   TOKEN_ADDRESS=your_token_address_here
   BANK_WALLET_PATH=/Users/jm/bank-wallet.json
   ```

3. **merchant/.env**:
   ```
   TOKEN_ADDRESS=your_token_address_here
   MERCHANT_WALLET=your_merchant_wallet_address
   ```

## POC Success Criteria

The project is complete when:

1. ✅ Android app opens with Gmail login option
2. ✅ Gmail login successfully generates a wallet address
3. ✅ "Simulate Top Up" button adds 50 Event Tokens to balance
4. ✅ Balance displays correctly on dashboard screen
5. ✅ QR scanner successfully reads merchant payment QR codes
6. ✅ Payment completes and updates balance on Solana Devnet
7. ✅ Transaction appears on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Known Limitations

- **Devnet Only**: All operations use Solana Devnet (no real money)
- **No Real Payments**: Top-up is simulated (backend transfer, not Stripe)
- **Android Only**: iOS support not implemented
- **Custom Dev Client**: Cannot use Expo Go
- **Single Token**: Only supports one Event Token
- **No Transaction History**: Balance only, no history view
- **No PIN/Biometrics**: Wallet not protected after login

## Security Notes

- **Bank Wallet**: Keep `~/bank-wallet.json` secure - holds all tokens
- **Token Address**: Cannot be recovered if lost
- **Private Keys**: Derived by Web3Auth, never stored directly
- **Devnet Tokens**: Worthless, for testing only

## Troubleshooting

### "Module not found" errors
```bash
cd event-wallet
npm install
```

### "Web3Auth init error"
- Verify Client ID in `app.json`
- Check whitelist URL includes `eventwallet://auth`

### "Top-up failed"
- Ensure backend is running on localhost:3000
- Verify TOKEN_ADDRESS in constants.ts and .env files
- Check bank wallet has enough SOL for gas

### "Camera not working"
- Verify CAMERA permission in app.json
- Must use custom dev client (not Expo Go)

### "Transaction failed"
- Check Solana Devnet status: https://status.devnet.solana.com/
- Ensure wallet has token account created
- Verify merchant wallet address is correct

## Next Steps for Production

1. Replace simulated top-up with Stripe integration
2. Add real merchant onboarding flow
3. Implement transaction history screen
4. Add PIN/biometric protection for payments
5. Audit smart contracts for mainnet deployment
6. Add comprehensive error handling
7. Implement push notifications for payments
8. Add iOS support
9. Implement backup/recovery phrase
10. Add multi-currency support

## Documentation

- **Implementation Plan**: `docs/plans/2025-01-13-android-wallet-poc.md`
- **Task Status**: `@fix_plan.md`
- **Blockchain Notes**: `blockchain-notes.md`
- **Agent Instructions**: `@AGENT.md`

## License

MIT

## Contributing

This is a POC project. For questions or issues, please refer to the documentation in `docs/plans/`.
