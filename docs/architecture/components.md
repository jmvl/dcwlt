# Component Documentation

Detailed documentation for each component in the DCWLT system.

## Table of Contents

1. [Mobile Application](#1-mobile-application-event-wallet)
2. [Backend API](#2-backend-api-backend)
3. [Merchant API](#3-merchant-api-merchant)
4. [Blockchain Layer](#4-blockchain-layer)
5. [Shared Libraries](#5-shared-libraries)

---

## 1. Mobile Application (`event-wallet/`)

### Overview

React Native Android application that serves as the user-facing crypto wallet.

### Directory Structure

```
event-wallet/
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── metro.config.js             # Metro bundler config
├── react-native.config.js      # React Native config
└── src/
    ├── config/
    │   └── constants.ts        # App-wide constants
    ├── contexts/
    │   └── Web3AuthContext.tsx # Web3Auth state management
    ├── screens/
    │   ├── LoginScreen.tsx     # Gmail login screen
    │   ├── DashboardScreen.tsx # Main dashboard
    │   └── QRScannerScreen.tsx # QR payment scanner
    ├── services/
    │   └── solana.ts           # Solana RPC client
    └── polyfills.ts            # Crypto polyfills
```

### Key Components

#### `Web3AuthContext.tsx`

**Purpose**: Manages Web3Auth authentication and wallet state

**State**:
```typescript
interface Web3AuthState {
  provider: any;           // Web3Auth provider
  privateKey: string;      // Derived private key
  keypair: Keypair;        // Solana keypair
  publicKey: string;       // Wallet address
  balance: number;         // Token balance
  isConnected: boolean;    // Auth status
}
```

**Methods**:
- `login()` - Initiate Gmail OAuth flow
- `logout()` - Clear session
- `getBalance()` - Fetch token balance
- `topUp(amount)` - Request token top-up

**Usage Example**:
```typescript
const { login, publicKey, balance } = useWeb3Auth();

await login();
console.log(`Wallet: ${publicKey}`);
console.log(`Balance: ${balance} tokens`);
```

#### `constants.ts`

**Purpose**: Centralized configuration

**Constants**:
```typescript
// Solana Configuration
export const RPC_URL = 'https://api.devnet.solana.com';
export const TOKEN_ADDRESS = 'YOUR_TOKEN_MINT_ADDRESS';

// API Endpoints
export const BACKEND_URL = 'http://10.0.2.2:3000';  // Android emulator
export const MERCHANT_URL = 'http://10.0.2.2:3001';

// Web3Auth Configuration
export const WEB3AUTH_CLIENT_ID = 'YOUR_CLIENT_ID';
export const WEB3AUTH_NETWORK = 'cyan';  // Testnet
```

#### `LoginScreen.tsx`

**Purpose**: Gmail authentication UI

**Flow**:
1. Display "Continue with Google" button
2. On tap, call `Web3AuthContext.login()`
3. Show loading indicator during OAuth
4. Redirect to Dashboard on success
5. Display error on failure

#### `DashboardScreen.tsx`

**Purpose**: Main wallet interface

**Features**:
- Display wallet address
- Show current token balance
- "Simulate Top Up" button
- "Scan QR" button
- Transaction history (future)

**Top-Up Flow**:
```typescript
const handleTopUp = async () => {
  const response = await fetch(`${BACKEND_URL}/api/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: publicKey,
      amount: 50,
    }),
  });
  const result = await response.json();
  if (result.success) {
    await getBalance();  // Refresh balance
  }
};
```

#### `QRScannerScreen.tsx`

**Purpose**: QR code payment scanner

**Flow**:
1. Request camera permissions
2. Open camera with expo-camera
3. Scan for QR codes
4. Validate Solana Pay URL format
5. Parse payment details
6. Show confirmation dialog
7. Create and sign transaction
8. Submit to Solana

**Solana Pay Parsing**:
```typescript
const parseSolanaPayURL = (url: string) => {
  const parsed = new URL(url);
  return {
    recipient: parsed.pathname,
    amount: parseFloat(parsed.searchParams.get('amount')),
    token: parsed.searchParams.get('spl-token'),
    reference: parsed.searchParams.get('reference'),
  };
};
```

#### `solana.ts`

**Purpose**: Solana RPC interactions

**Functions**:
```typescript
// Get token balance
async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string
): Promise<number>

// Create token transfer
async function createTransfer(
  from: Keypair,
  to: string,
  amount: number,
  tokenMint: string
): Promise<Transaction>

// Send transaction
async function sendTransaction(
  transaction: Transaction,
  signer: Keypair
): Promise<string>
```

#### `polyfills.ts`

**Purpose**: Node.js crypto polyfills for React Native

**Required Because**:
- React Native lacks Node.js built-ins
- Solana libraries require `crypto`, `stream`, etc.
- Must be imported **first** in `App.tsx`

**Polyfills**:
```typescript
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

polyfillGlobal({
  crypto: require('react-native-quick-crypto'),
  stream: require('readable-stream'),
});
```

### Build Configuration

#### `app.json`

Key configuration for Expo:

```json
{
  "expo": {
    "name": "DCWLT Wallet",
    "slug": "dcwlt-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android"],
    "android": {
      "package": "com.dcwlt.wallet",
      "permissions": [
        "CAMERA",
        "INTERNET"
      ]
    }
  }
}
```

### Dependencies

**Key Packages**:

```json
{
  "@solana/web3.js": "^1.x",
  "@solana/spl-token": "^0.x",
  "@web3auth/react-native-sdk": "^6.x",
  "expo": "^50.x",
  "expo-camera": "^14.x",
  "react-native-get-random-values": "^1.x",
  "react-native-quick-crypto": "^0.x"
}
```

---

## 2. Backend API (`backend/`)

### Overview

Express server that handles token top-up operations.

### Directory Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── topup.ts              # Top-up endpoint
│   ├── services/
│   │   └── tokenService.ts       # Token transfer logic
│   ├── config/
│   │   └── solana.ts             # Solana connection
│   └── index.ts                  # Express app setup
├── .env                          # Environment variables
├── package.json
└── tsconfig.json
```

### Key Components

#### `index.ts`

**Purpose**: Express server entry point

```typescript
import express from 'express';
import cors from 'cors';
import topupRoutes from './routes/topup';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', topupRoutes);

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
```

#### `routes/topup.ts`

**Purpose**: Top-up endpoint handler

```typescript
import { Router } from 'express';
import { handleTopUp } from '../services/tokenService';

const router = Router();

router.post('/topup', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    // Validation
    if (!walletAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and amount are required'
      });
    }

    const result = await handleTopUp(walletAddress, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

#### `services/tokenService.ts`

**Purpose**: SPL token transfer logic

**Key Function**:
```typescript
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAccount } from '@solana/spl-token';

export async function handleTopUp(
  userWallet: string,
  amount: number
): Promise<{ success: boolean; signature?: string; error?: string }> {

  // 1. Load bank wallet
  const bankKeypair = loadBankWallet();

  // 2. Create connection
  const connection = new Connection(process.env.RPC_URL);

  // 3. Get token accounts
  const bankTokenAccount = await getTokenAccount(bankKeypair.publicKey);
  const userTokenAccount = await getOrCreateTokenAccount(userWallet);

  // 4. Create transfer instruction
  const instruction = createTransferInstruction(
    bankTokenAccount.mint,
    bankTokenAccount.address,
    userTokenAccount.address,
    bankKeypair,
    amount * 1e9  // Convert to smallest unit
  );

  // 5. Create and sign transaction
  const transaction = new Transaction().add(instruction);
  transaction.feePayer = bankKeypair.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.sign(bankKeypair);

  // 6. Send transaction
  const signature = await connection.sendTransaction(transaction);

  // 7. Confirm transaction
  await connection.confirmTransaction(signature);

  return {
    success: true,
    signature,
    amount
  };
}
```

#### `config/solana.ts`

**Purpose**: Solana connection configuration

```typescript
import { Connection } from '@solana/web3.js';

export const connection = new Connection(
  process.env.RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export const TOKEN_MINT = new PublicKey(process.env.TOKEN_ADDRESS);
```

### Environment Variables

**`.env`**:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Solana Configuration
RPC_URL=https://api.devnet.solana.com
TOKEN_ADDRESS=YOUR_TOKEN_MINT_ADDRESS

# Bank Wallet
BANK_WALLET_PATH=/path/to/bank-wallet.json
```

### Dependencies

```json
{
  "express": "^4.x",
  "@solana/web3.js": "^1.x",
  "@solana/spl-token": "^0.x",
  "dotenv": "^16.x",
  "cors": "^2.x"
}
```

---

## 3. Merchant API (`merchant/`)

### Overview

Express server that generates payment QR codes.

### Directory Structure

```
merchant/
├── routes/
│   └── index.ts                  # Home & QR routes
├── services/
│   └── qrService.ts              # QR generation logic
├── views/
│   └── qr.html                   # QR display template
├── public/
│   └── styles.css                # Styling
├── .env                          # Configuration
└── package.json
```

### Key Components

#### `routes/index.ts`

**Purpose**: Route handlers

```typescript
import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/dashboard.html');
});

// Generate QR code
router.get('/qr', async (req, res) => {
  const { amount, merchant } = req.query;

  if (!amount || !merchant) {
    return res.status(400).send('Missing parameters');
  }

  // Generate Solana Pay URL
  const reference = uuidv4();
  const url = `solana:${merchant}?amount=${amount}&spl-token=${process.env.TOKEN_ADDRESS}&reference=${reference}&label=Merchant&message=Payment`;

  // Generate QR code
  const qrDataUrl = await QRCode.toDataURL(url);

  res.render('qr', {
    amount,
    merchant,
    qrDataUrl,
    url
  });
});

export default router;
```

#### `services/qrService.ts`

**Purpose**: QR code generation utilities

```typescript
import QRCode from 'qrcode';

export async function generatePaymentQR(
  merchantAddress: string,
  amount: number,
  tokenMint: string
): Promise<string> {

  const reference = uuidv4();
  const solanaPayURL = new URL(`solana:${merchantAddress}`);

  solanaPayURL.searchParams.set('amount', amount.toString());
  solanaPayURL.searchParams.set('spl-token', tokenMint);
  solanaPayURL.searchParams.set('reference', reference);
  solanaPayURL.searchParams.set('label', 'Merchant');
  solanaPayURL.searchParams.set('message', 'Payment for goods');

  return await QRCode.toDataURL(solanaPayURL.toString());
}

export function parseSolanaPayURL(url: string) {
  const parsed = new URL(url);

  return {
    recipient: parsed.pathname,
    amount: parseFloat(parsed.searchParams.get('amount')),
    splToken: parsed.searchParams.get('spl-token'),
    reference: parsed.searchParams.get('reference'),
    label: parsed.searchParams.get('label'),
    message: parsed.searchParams.get('message'),
  };
}
```

#### `views/qr.html`

**Purpose**: QR code display template

```html
<!DOCTYPE html>
<html>
<head>
  <title>Payment QR Code</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <h1>Scan to Pay</h1>
    <div class="qr-container">
      <img src="{{qrDataUrl}}" alt="Payment QR Code">
    </div>
    <div class="details">
      <p><strong>Amount:</strong> {{amount}} Event Tokens</p>
      <p><strong>Merchant:</strong> {{merchant}}</p>
    </div>
    <p class="url">{{url}}</p>
  </div>
</body>
</html>
```

### Environment Variables

**`.env`**:
```env
# Server Configuration
PORT=3001

# Token Configuration
TOKEN_ADDRESS=YOUR_TOKEN_MINT_ADDRESS

# Merchant Wallet (for receiving payments)
MERCHANT_WALLET=YOUR_MERCHANT_WALLET_ADDRESS
```

### Dependencies

```json
{
  "express": "^4.x",
  "qrcode": "^1.x",
  "uuid": "^9.x",
  "dotenv": "^16.x"
}
```

---

## 4. Blockchain Layer

### Solana Devnet

**RPC Endpoint**: `https://api.devnet.solana.com`

**Explorer**: `https://explorer.solana.com/?cluster=devnet`

### Event Token (SPL Token)

**Type**: SPL Token (Solana Program Library)

**Decimals**: 9 (same as SOL)

**Initial Supply**: 1,000,000 tokens

**Distribution**:
- Bank Wallet: 1,000,000 tokens (100%)
- User Wallets: 0 tokens (initially)

### Bank Wallet

**Purpose**: Holds all Event Tokens for top-up operations

**Location**: `~/bank-wallet.json` (developer's machine)

**Security**: ⚠️ **DO NOT COMMIT** to version control

**Keypair Structure**:
```json
{
  "publicKey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "secretKey": [1, 2, 3, ...]  // 64 bytes
}
```

### Transaction Types

#### Token Top-Up (Backend-Initiated)

```typescript
// Transfer from bank wallet to user wallet
const transferInstruction = createTransferInstruction(
  bankTokenAccount,     // Source
  userTokenAccount,     // Destination
  bankKeypair,          // Authority
  amount * 1e9          // Amount (with decimals)
);
```

#### QR Payment (User-Initiated)

```typescript
// Transfer from user wallet to merchant wallet
const transferInstruction = createTransferInstruction(
  userTokenAccount,     // Source
  merchantTokenAccount, // Destination
  userKeypair,          // Authority
  amount * 1e9          // Amount (with decimals)
);
```

---

## 5. Shared Libraries

### TypeScript Types

**`types.ts`** (shared):

```typescript
export interface Wallet {
  publicKey: string;
  privateKey?: string;
  balance: number;
}

export interface Transaction {
  signature: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TopUpRequest {
  walletAddress: string;
  amount: number;
}

export interface TopUpResponse {
  success: boolean;
  signature?: string;
  amount?: number;
  error?: string;
}

export interface SolanaPayURL {
  recipient: string;
  amount: number;
  splToken: string;
  reference: string;
  label: string;
  message: string;
}
```

### Utility Functions

**`utils.ts`** (shared):

```typescript
// Validate Solana address
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Format balance
export function formatBalance(balance: number, decimals: number = 9): string {
  return (balance / Math.pow(10, decimals)).toFixed(2);
}

// Shorten address for display
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Convert lamports to tokens
export function lamportsToTokens(lamports: number): number {
  return lamports / 1e9;
}

// Convert tokens to lamports
export function tokensToLamports(tokens: number): number {
  return Math.floor(tokens * 1e9);
}
```

---

## Component Interaction Matrix

| Component | Communicates With | Protocol | Purpose |
|-----------|-------------------|----------|---------|
| Mobile App | Web3Auth | SDK | Authentication |
| Mobile App | Backend API | REST | Top-up requests |
| Mobile App | Solana Devnet | RPC | Blockchain operations |
| Mobile App | Merchant API | HTTP | Fetch QR codes |
| Backend API | Solana Devnet | RPC | Token transfers |
| Merchant API | Solana Devnet | Read-only | Verify addresses |

---

## Error Handling by Component

### Mobile App

| Error | Handling |
|-------|----------|
| Web3Auth login fails | Show error, retry option |
| Invalid QR code | Display "Invalid QR" message |
| Transaction fails | Show error from Solana |
| Network error | Retry with exponential backoff |

### Backend API

| Error | HTTP Code | Response |
|-------|-----------|----------|
| Missing parameters | 400 | `{ success: false, error: "..." }` |
| Invalid address | 400 | `{ success: false, error: "Invalid address" }` |
| Transaction failed | 500 | `{ success: false, error: "..." }` |
| Insufficient funds | 500 | `{ success: false, error: "Insufficient funds" }` |

### Merchant API

| Error | HTTP Code | Response |
|-------|-----------|----------|
| Missing parameters | 400 | HTML error page |
| Invalid amount | 400 | HTML error page |
| QR generation fails | 500 | HTML error page |

---

## Testing Strategy

### Mobile App

```typescript
// Example: Web3AuthContext.test.ts
describe('Web3AuthContext', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeb3Auth());
    expect(result.current.isConnected).toBe(false);
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useWeb3Auth());
    await act(() => result.current.login());
    expect(result.current.isConnected).toBe(true);
  });
});
```

### Backend API

```typescript
// Example: topup.test.ts
describe('POST /api/topup', () => {
  it('should transfer tokens successfully', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({ walletAddress: testWallet, amount: 50 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.signature).toBeDefined();
  });
});
```

---

## Performance Characteristics

| Component | Startup Time | Request Handling | Memory Usage |
|-----------|--------------|------------------|--------------|
| Mobile App | 2-3 seconds | Instant (UI) | ~150MB |
| Backend API | <1 second | 2-5 seconds (blockchain) | ~100MB |
| Merchant API | <1 second | <1 second | ~50MB |
