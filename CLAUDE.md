# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: ALWAYS CALL `get_context_capsule` FIRST

**This is NON-NEGOTIABLE. Before ANY task, question, or action:**

### The #1 Rule

```
User asks ANYTHING
       │
       ▼
┌─────────────────────────────────────────┐
│  CALL get_context_capsule(query) FIRST  │  ← MANDATORY
└─────────────────────────────────────────┘
       │
       ▼
Then read the pivot files returned
       │
       ▼
Then decide: delegate or proceed
```

### DO NOT:
- ❌ Delegate to Explore agent without calling `get_context_capsule` first
- ❌ Use Grep/Glob/Read to search codebase
- ❌ Ask questions without context from `get_context_capsule`

### DO:
- ✅ Call `get_context_capsule("your question")` immediately
- ✅ Read the pivot files it returns
- ✅ Use `search_symbols` for specific lookups
- ✅ Use `search_memory` for past decisions

### Available MCP Tools

| Tool | Description | When to Use |
|------|-------------|-------------|
| `get_context_capsule` | Most relevant code for task | **ALWAYS FIRST** |
| `get_impact_graph` | What breaks if you change a symbol | Before refactoring |
| `get_skeleton` | Token-efficient file structure | Quick overview |
| `search_symbols` | Search symbols by name/keyword | Specific lookup |
| `save_observation` | Persist insights with symbol links | After decisions |
| `search_memory` | Cross-session memory search | Recall past work |
| `get_recent_observations` | Recent session observations | Current context |
| `index_status` | Check indexing statistics | Debugging |
| `reindex` | Re-index the workspace | After major changes |

### Example: Correct Workflow

```
User: "How does the payment flow work?"

WRONG:
  ❌ Delegate to Explore agent
  ❌ Use Grep/Glob to search files

CORRECT:
  1. Call get_context_capsule("payment flow merchant user QR scan")
  2. Read returned pivot files (usePayment, QRCodeGenerator, etc.)
  3. Summarize findings from the context
  4. Optionally save observation: "Payment uses gas sponsorship..."
```

### Session Memory

After making decisions or discoveries, save them:
```
save_observation({
  content: "Payment flow uses gas sponsorship - backend signs as fee payer so users don't need SOL",
  type: "insight",
  symbol_fqns: ["usePayment::executePayment", "sponsor-transaction::POST"]
})
```


## Project Overview

DCWLT is a **Proof of Concept (POC)** for an Android crypto wallet app demonstrating a complete "Gmail Login → Wallet → Simulated Visa Top-Up → QR Payment" flow using Solana Devnet. This is a multi-service architecture with three separate components.

**Important**: This is a POC only. All development uses Solana Devnet (testnet) with fake money. Never implement mainnet functionality.

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

### Component Structure

The project consists of three independent Node.js projects:

1. **event-wallet/** - React Native Android app (Expo + TypeScript)
2. **backend/** - Express server for top-up simulation
3. **merchant/** - Express server with QR code generator

## Project Status

**Current Phase**: Planning/Setup

The implementation projects do not exist yet. See `docs/plans/2025-01-13-android-wallet-poc.md` for the complete 20-task implementation plan.

## Common Development Commands

### Blockchain Setup (One-Time)

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

**Critical**: The token address from `spl-token create-token` must be saved to `event-wallet/src/config/constants.ts` and all `.env` files. It cannot be recovered.

### Backend Service

```bash
cd backend
npm install
npm run dev          # Start on http://localhost:3000
npm run build        # Compile TypeScript
npm start            # Production mode
```

API endpoint: `POST /api/topup` with body `{ walletAddress, amount }`

### Merchant Service

```bash
cd merchant
npm install
npm run dev          # Start on http://localhost:3001
```

Web interface: http://localhost:3001

### Android App

```bash
cd event-wallet
npm install
npx expo run:android  # Requires Android Studio with emulator/device
```

**Important**: This app requires a **custom development client** due to crypto libraries. Cannot use Expo Go.

## Configuration Files

### Token Address Management

The Event Token address must be configured in:

1. `event-wallet/src/config/constants.ts` - `TOKEN_ADDRESS`
2. `backend/.env` - `TOKEN_ADDRESS`
3. `merchant/.env` - `TOKEN_ADDRESS`

### Environment Variables

**backend/.env**:
```
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=<from spl-token create-token>
```

**merchant/.env**:
```
MERCHANT_WALLET=<generate new wallet for merchant>
TOKEN_ADDRESS=<from spl-token create-token>
```

## Key Architecture Patterns

### Web3Auth Integration

The app uses Web3Auth to derive a Solana wallet from Gmail OAuth:

1. User taps "Continue with Google"
2. Web3Auth handles OAuth flow
3. Returns a private key derived from Gmail account
4. Private key converted to Solana Keypair
5. Wallet address displayed to user

**File**: `event-wallet/src/contexts/Web3AuthContext.tsx`

### Token Transfer Flow

**Top-Up (Simulated Visa)**:
1. User taps "Simulate Top Up" in app
2. App calls `POST /api/topup` with wallet address
3. Backend loads bank wallet keypair
4. Backend creates SPL token transfer instruction
5. Backend signs and sends transaction
6. Returns signature to app

**Payment (QR Scanner)**:
1. Merchant generates QR: `solana:<address>?amount=5&spl-token=<TOKEN>`
2. User scans QR with app camera
3. App parses Solana Pay URL
4. App creates transfer instruction from user's Web3Auth wallet
5. App signs and sends transaction
6. Balance updates on confirmation

### Crypto Polyfills

React Native doesn't have Node.js crypto libraries. The `polyfills.ts` file must be imported before all other code:

```typescript
// Must be first import in App.tsx
import './polyfills';
```

## Implementation Plan

The detailed implementation plan is in `docs/plans/2025-01-13-android-wallet-poc.md` with 20 bite-sized tasks:

- **Phase 1**: Blockchain setup (Tasks 1-4)
- **Phase 2**: Expo app initialization (Tasks 5-7)
- **Phase 3**: Web3Auth integration (Tasks 8-10)
- **Phase 4-5**: UI screens (Tasks 11-13)
- **Phase 6**: QR scanner (Task 14)
- **Phase 7**: Backend top-up (Tasks 15-16)
- **Phase 8**: Merchant QR generator (Task 17)
- **Phase 9**: Build, test, docs (Tasks 18-20)

## POC Success Criteria

The project is complete when:

1. Android app opens with Gmail login option
2. Gmail login successfully generates a wallet address
3. "Simulate Top Up" button adds 50 Event Tokens to balance
4. Balance displays correctly on dashboard screen
5. QR scanner successfully reads merchant payment QR codes
6. Payment completes and updates balance on Solana Devnet
7. Transaction appears on https://explorer.solana.com/?cluster=devnet

## Development Workflow

This project uses Ralph for autonomous development. Key files:

- `PROMPT.md` - Ralph's development instructions
- `@fix_plan.md` - Task prioritization and tracking
- `@AGENT.md` - Build/run instructions and quality standards

Quality standards require 85% test coverage, conventional commits, and documentation updates for all features.

## Testing

- **Backend**: Integration tests for `/api/topup` endpoint
- **Merchant**: Tests for QR code generation
- **Mobile**: Manual testing on Android device/emulator required

No automated mobile tests are planned for this POC.

## Dependencies Summary

### Mobile (event-wallet)
- `@solana/web3.js` - Solana RPC interaction
- `@solana/spl-token` - SPL token operations
- `@web3auth/react-native-sdk` - Gmail OAuth → key derivation
- `expo-camera` - QR code scanning
- `react-native-get-random-values` - Crypto polyfill

### Backend Services
- `express` - HTTP server
- `@solana/web3.js` - Solana transactions
- `dotenv` - Environment configuration
- `qrcode` (merchant only) - QR generation

## Important Constraints

1. **Devnet Only**: Never use Solana mainnet
2. **No Real Money**: All tokens are testnet-only
3. **Simulated Stripe**: Top-up is a backend transfer, not real payment
4. **Custom Dev Client**: Mobile app cannot use Expo Go
5. **Token Address Critical**: If lost, tokens are inaccessible
6. **Android Studio Required**: For building the mobile app
