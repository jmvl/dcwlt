# Solana Integration & Payment Flow Documentation

> Generated: 2026-02-25
>
> This document explains the complete Solana integration, including payment flow between merchant and user, Privy wallet setup, and balance fetching.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Payment Flow](#payment-flow)
3. [Privy Wallet Setup](#privy-wallet-setup)
4. [Balance Fetching](#balance-fetching)
5. [Key Technical Details](#key-technical-details)
6. [Environment Variables](#environment-variables)

---

## Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              MERCHANT SIDE                                │
│  ┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐  │
│  │ Merchant    │─────>│ QRCodeGenerator  │─────>│ Solana Pay URL      │  │
│  │ Terminal    │      │ (pwa/app/...)    │      │ (QR code)           │  │
│  └─────────────┘      └──────────────────┘      └─────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ QR Code (solana:...)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                USER SIDE                                  │
│  ┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐  │
│  │ Scan Page   │─────>│ Confirm Payment  │─────>│ usePayment Hook     │  │
│  │ (camera)    │      │ Page             │      │ (sign transaction)  │  │
│  └─────────────┘      └──────────────────┘      └─────────────────────┘  │
│                                                          │               │
└──────────────────────────────────────────────────────────│───────────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Gas Sponsor)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ POST /api/sponsor-transaction                                       │ │
│  │ 1. Validate fee payer address                                       │ │
│  │ 2. Check for unauthorized transfers                                 │ │
│  │ 3. Sign with backend keypair (pays gas)                             │ │
│  │ 4. Broadcast to Solana Devnet                                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            SOLANA DEVNET                                  │
│  - SPL Token Transfer (Event Tokens)                                      │
│  - Transaction confirmed on-chain                                         │
│  - Viewable on Solana Explorer                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Provider Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APP LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         RootLayout                                   │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    PrivyAuthProvider                         │    │    │
│  │  │  ┌───────────────────────────────────────────────────────┐  │    │    │
│  │  │  │              ConvexClientProvider                      │  │    │    │
│  │  │  │  ┌─────────────────────────────────────────────────┐  │  │    │    │
│  │  │  │  │                QueryProvider                     │  │  │    │    │
│  │  │  │  │                    {children}                    │  │  │    │    │
│  │  │  │  └─────────────────────────────────────────────────┘  │  │    │    │
│  │  │  └───────────────────────────────────────────────────────┘  │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Payment Flow

### Step-by-Step Flow

#### 1. Merchant Generates QR Code

**File:** `pwa/app/components/QRCodeGenerator.tsx`

The merchant creates a Solana Pay URL:

```
solana:<merchant_wallet>?amount=5.00&spl-token=<TOKEN_MINT>&reference=<item_id>
```

**URL Components:**
- `solana:` - Protocol scheme
- `recipient` - Merchant's wallet address
- `amount` - Price in EVT tokens
- `spl-token` - Event Token mint address (`4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq`)
- `reference` - Item ID for tracking

**Code:**
```typescript
const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}`;
```

#### 2. User Scans QR Code

**File:** `pwa/app/scan/page.tsx`

The scanner reads the QR code and validates it using the Solana Pay utilities:

```typescript
const handleScanSuccess = (decodedText: string) => {
  // Validate that this is a Solana Pay URL
  if (!isValidSolanaPayURL(decodedText)) {
    alert('Not a valid Solana Pay QR code.');
    return;
  }

  // Parse the Solana Pay URL
  const parsed = parseSolanaPayURL(decodedText);
  // Result: { recipient, amount, splToken, reference, label, message }

  // Navigate to confirmation screen
  router.push(`/confirm-payment?recipient=${parsed.recipient}&amount=${parsed.amount}...`);
};
```

#### 3. User Confirms Payment

**File:** `pwa/app/confirm-payment/page.tsx`

User sees payment details and taps "Confirm". The amount is converted from display format to base units:

```typescript
// 5.00 EVT -> 5,000,000,000 base units (9 decimals)
const amountBigInt = parseTokenAmount(amount);
const amountInBaseUnits = amountBigInt.toString();
// Result: "5000000000"
```

#### 4. Transaction Building with Gas Sponsorship

**File:** `pwa/app/hooks/usePayment.ts`

**Key Innovation:** Users don't need SOL for gas fees. The backend pays.

```typescript
// Build transaction with BACKEND as fee payer
const messageV0 = new TransactionMessage({
  payerKey: feePayerPubkey,  // Backend wallet pays gas!
  recentBlockhash: blockhash,
  instructions: [
    // Create recipient ATA if needed
    createATAInstruction,
    // Transfer SPL tokens
    createTransferInstruction(senderATA, recipientATA, senderPubkey, amount)
  ],
}).compileToV0Message();
```

#### 5. User Signs Message

**File:** `pwa/app/hooks/usePayment.ts`

User signs just the message (not full transaction) using their Privy wallet:

```typescript
const { signature: userSignature } = await solanaWallet.signMessage({
  message: messageBytes,
});
transaction.addSignature(senderPubkey, userSignature);
```

#### 6. Backend Signs & Broadcasts

**File:** `pwa/app/api/sponsor-transaction/route.ts`

The partially-signed transaction is sent to the backend:

1. **Validates fee payer** - Ensures backend wallet is the fee payer
2. **Security check** - Blocks unauthorized SOL transfers from fee payer
3. **Signs transaction** - Adds backend's signature
4. **Broadcasts to Solana** - Sends to Devnet RPC
5. **Waits for confirmation** - Polls until confirmed

```typescript
transaction.sign([feePayerKeypair]);
const signature = await connection.sendRawTransaction(serializedTransaction);
```

#### 7. Transaction Recorded in Convex

Transaction status is tracked in Convex database:
- `pending` - Created before sending
- `confirmed` - Updated after success
- `failed` - Updated on error

#### 8. Merchant Gets Notified

**File:** `pwa/app/components/QRCodeGenerator.tsx`

Merchant terminal subscribes to real-time transaction updates:

```typescript
const transactions = useQuery(
  api.transactions.listLiveMerchantTransactions,
  { merchantId }
);

// Auto-detects when payment for this item is confirmed
const isThisItemPaid =
  latestTransaction?.itemId === itemId &&
  latestTransaction?.status === 'confirmed';
```

### Payment Flow Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Merchant         │     │ User             │     │ Backend          │
│ Terminal         │     │ App              │     │ API              │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │ Generate QR            │                        │
         │ (solana:...)           │                        │
         │───────────────────────>│                        │
         │                        │                        │
         │                        │ Scan & Parse           │
         │                        │─────────┐              │
         │                        │         │              │
         │                        │<────────┘              │
         │                        │                        │
         │                        │ Confirm Payment        │
         │                        │─────────┐              │
         │                        │         │              │
         │                        │<────────┘              │
         │                        │                        │
         │                        │ Build Transaction      │
         │                        │ (fee payer = backend)  │
         │                        │─────────┐              │
         │                        │         │              │
         │                        │<────────┘              │
         │                        │                        │
         │                        │ Sign Message           │
         │                        │ (user signature)       │
         │                        │─────────┐              │
         │                        │         │              │
         │                        │<────────┘              │
         │                        │                        │
         │                        │ POST /sponsor-tx       │
         │                        │───────────────────────>│
         │                        │                        │
         │                        │                        │ Validate
         │                        │                        │ Sign (fee payer)
         │                        │                        │ Broadcast
         │                        │                        │
         │                        │ Transaction Signature  │
         │                        │<───────────────────────│
         │                        │                        │
         │ Convex: tx confirmed   │                        │
         │<───────────────────────│                        │
         │                        │                        │
         │ Show Success           │                        │
         │                        │                        │
```

---

## Privy Wallet Setup

### Provider Configuration

**File:** `pwa/app/components/PrivyProvider.tsx`

The `PrivyAuthProvider` wraps the entire app and configures Solana embedded wallets:

```typescript
<PrivyProvider
  appId={appId}  // From NEXT_PUBLIC_PRIVY_APP_ID
  config={{
    // Solana Devnet RPC for wallet operations
    solana: {
      rpcs: {
        'solana:devnet': {
          rpc: createSolanaRpc('https://api.devnet.solana.com'),
          rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
        },
      },
    },
    // Auto-create embedded wallet on first login
    embeddedWallets: {
      solana: {
        createOnLogin: 'users-without-wallets',
      },
    },
    appearance: {
      theme: 'dark',
      accentColor: '#13a4ec',
    },
  }}
>
```

**Key Settings:**
- **`createOnLogin: 'users-without-wallets'`** - Automatically creates a Solana embedded wallet for users who don't have one
- **RPC Configuration** - Connects to Solana Devnet for balance queries and transactions

### Authentication Hook

**File:** `pwa/app/hooks/usePrivyAuth.ts`

This hook wraps Privy's `usePrivy()` and handles user creation in Convex:

```typescript
export function usePrivyAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const createUser = useMutation(api.users.createFromPrivy);

  useEffect(() => {
    // When user authenticates, sync to Convex database
    if (ready && authenticated && user) {
      const solanaWallet = user.linkedAccounts?.find(
        (account) => account.type === 'wallet' && account.chainType === 'solana'
      );

      if (solanaWallet) {
        // Create user record in Convex with wallet address + email
        createUser({
          walletAddress: solanaWallet.address,
          email: emailFromPrivy,
        });
      }
    }
  }, [ready, authenticated]);
}
```

**Flow:**
1. User logs in via Privy (Google, email, etc.)
2. Privy creates embedded Solana wallet automatically
3. Hook detects authentication and creates Convex user record

### Login Button States

**File:** `pwa/app/components/LoginButton.tsx`

**Loading State:**
```tsx
if (!ready) {
  return <div>Initializing wallet...</div>;
}
```

**Authenticated State:**
```tsx
if (authenticated && user) {
  const solanaWallet = user.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  );
  // Display wallet address: "7xKXtg2...osgAsU"
}
```

**Unauthenticated State:**
```tsx
return (
  <button onClick={login}>
    Sign in to Wallet
  </button>
);
```

### Wallet Creation

**File:** `pwa/app/components/CreateEmbeddedWallet.tsx`

For users who logged in but don't have an embedded wallet yet:

```typescript
const handleCreateWallet = async () => {
  // 1. Create the embedded wallet via Privy
  await privy.createWallet();

  // 2. Wait for Privy to update the user object
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Get the new wallet address
  const user = privy.user;
  const solanaWallet = user.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  );

  // 4. Register in Convex database
  await createUser({
    walletAddress: solanaWallet.address,
  });
};
```

### Accessing Wallet in Components

**File:** `pwa/app/dashboard/components/BalanceCard.tsx`

Components access the wallet through the Privy user object:

```typescript
export function BalanceCard() {
  const { user } = usePrivyAuth();

  // Extract Solana wallet from linked accounts
  const solanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet?.address;

  // Use wallet address to fetch balance
  const { data: balance } = useSolanaBalance(walletAddress);
}
```

### Signing Transactions

**File:** `pwa/app/hooks/usePayment.ts`

The wallet is used to sign payment transactions:

```typescript
export function usePayment() {
  const { wallets } = useWallets();  // From @privy-io/react-auth/solana

  const executePayment = async (params) => {
    // Get the embedded wallet
    const solanaWallet = wallets[0];

    // Sign the transaction message
    const { signature } = await solanaWallet.signMessage({
      message: messageBytes,
    });

    // Add signature to transaction
    transaction.addSignature(senderPubkey, signature);
  };
}
```

### Privy User Object Structure

```typescript
interface PrivyUser {
  id: string;
  linkedAccounts: Array<
    | { type: 'email'; email: string }
    | { type: 'google'; email: string }
    | { type: 'wallet'; chainType: 'solana'; address: string; walletClientType: string }
  >;
}
```

### Complete User Flow

```
┌──────────────────┐
│ User visits app  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌─────────────────────┐
│ Clicks "Sign in" │────>│ Privy Login Modal   │
└────────┬─────────┘     │ (Google/Email)      │
         │               └──────────┬──────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐     ┌─────────────────────┐
│ Privy creates    │     │ Embedded wallet     │
│ user account     │────>│ auto-generated      │
└────────┬─────────┘     │ (createOnLogin)     │
         │               └──────────┬──────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐     ┌─────────────────────┐
│ usePrivyAuth     │     │ Wallet stored in    │
│ detects auth     │────>│ Privy's custody     │
└────────┬─────────┘     └──────────┬──────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐     ┌─────────────────────┐
│ Convex user      │     │ User can now sign   │
│ record created   │     │ payment transactions│
└──────────────────┘     └─────────────────────┘
```

---

## Balance Fetching

### React Query Hook

**File:** `pwa/app/hooks/useSolanaBalance.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSPLTokenBalance } from '../../src/utils/transactions';

// Event Token mint address on Solana Devnet
const TOKEN_MINT_ADDRESS = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';

export function useSolanaBalance(walletAddress?: string) {
  return useQuery({
    // Query key uniquely identifies this data
    queryKey: ['solana-balance', TOKEN_MINT_ADDRESS, walletAddress],

    // Fetch function
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      const balance = await getSPLTokenBalance(
        walletAddress,
        TOKEN_MINT_ADDRESS
      );

      return balance;
    },

    // Only run query if wallet address is available
    enabled: !!walletAddress,

    // Data stays fresh for 30 seconds
    staleTime: 30 * 1000,

    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,

    // Retry failed requests once
    retry: 1,
  });
}

// Query key factory for manual invalidation
export const balanceQueryKeys = {
  all: ['solana-balance'] as const,
  detail: (walletAddress: string) =>
    ['solana-balance', TOKEN_MINT_ADDRESS, walletAddress] as const,
};
```

### Underlying Fetch Function

**File:** `pwa/src/utils/transactions.ts`

```typescript
export async function getSPLTokenBalance(
  walletAddress: string,
  tokenMintAddress: string
): Promise<number> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');

  // Convert addresses to PublicKey objects
  const walletPubkey = new PublicKey(walletAddress);
  const mintPubkey = new PublicKey(tokenMintAddress);

  // Derive the associated token account (ATA) address
  // This is where SPL tokens are stored for a wallet
  const tokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    walletPubkey
  );

  try {
    // Fetch the balance from Solana RPC
    const balanceInfo = await connection.getTokenAccountBalance(tokenAccount);

    // Return the human-readable amount (e.g., 50.5 instead of 50500000000)
    if (balanceInfo.value.uiAmount == null) {
      return 0;
    }

    return balanceInfo.value.uiAmount;
  } catch (error: any) {
    // If the token account doesn't exist yet, return 0
    if (error?.message?.includes('could not find account') ||
        error?.message?.includes('Invalid account owner')) {
      return 0;
    }

    throw new Error(`Failed to fetch token balance: ${error?.message}`);
  }
}
```

### Balance Fetching Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           REACT QUERY LAYER                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ useSolanaBalance(walletAddress)                                     │  │
│  │                                                                      │  │
│  │  - enabled: !!walletAddress  (only runs if wallet exists)          │  │
│  │  - staleTime: 30s            (don't refetch for 30s)               │  │
│  │  - gcTime: 5min              (cache for 5 minutes)                 │  │
│  │  - retry: 1                  (retry once on failure)               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          SOLANA RPC LAYER                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ getSPLTokenBalance(wallet, tokenMint)                               │  │
│  │                                                                      │  │
│  │  1. Create Connection to Devnet RPC                                 │  │
│  │  2. Derive Associated Token Account (ATA) address                   │  │
│  │  3. Call connection.getTokenAccountBalance(ATA)                     │  │
│  │  4. Return uiAmount (human-readable with decimals applied)          │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          SOLANA DEVNET                                    │
│                                                                           │
│  Wallet Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU            │
│       │                                                                   │
│       ▼                                                                   │
│  ATA: Hx8...abc (holds Event Tokens for this wallet)                     │
│       │                                                                   │
│       ▼                                                                   │
│  Balance: { amount: "50000000000", uiAmount: 50.0, decimals: 9 }         │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Usage in Components

```typescript
export function BalanceCard() {
  const { user } = usePrivyAuth();

  // Get wallet address from Privy user
  const solanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  );
  const walletAddress = solanaWallet?.address;

  // Fetch balance - automatically cached and refreshed
  const { data: balance, isLoading } = useSolanaBalance(walletAddress);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <p>Balance: {balance ?? 0} EVT</p>
      )}
    </div>
  );
}
```

### Cache Invalidation After Payment

After a successful payment, the cache is invalidated to trigger a refetch:

```typescript
// In usePayment.ts after successful transaction
queryClient.invalidateQueries({
  queryKey: balanceQueryKeys.detail(sender),
});
```

---

## Key Technical Details

| Aspect | Implementation |
|--------|---------------|
| **Token** | SPL Token (Event Token) on Solana Devnet |
| **Token Mint Address** | `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq` |
| **Decimals** | 9 (standard for SPL tokens) |
| **Gas Sponsorship** | Backend signs as fee payer, users don't need SOL |
| **Wallet Provider** | Privy (embedded wallets with email/social login) |
| **QR Format** | Solana Pay URL scheme |
| **Confirmation** | Polling with 30s timeout |
| **Explorer** | `https://explorer.solana.com/tx/{signature}?cluster=devnet` |

### Security Measures

1. **Fee Payer Validation** - Backend only signs if it's the expected fee payer
2. **Transfer Check** - Blocks any SOL transfers FROM the fee payer wallet
3. **Partial Signing** - User signs message, backend signs transaction
4. **Environment Variables** - Private keys never exposed to client

---

## Environment Variables

```bash
# .env.local

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Gas Sponsorship (Backend Wallet)
NEXT_PUBLIC_FEE_PAYER_ADDRESS=backend_wallet_address
FEE_PAYER_PRIVATE_KEY=backend_private_key_base58
```

---

## File Reference

| File | Purpose |
|------|---------|
| `pwa/app/components/PrivyProvider.tsx` | Privy configuration and provider setup |
| `pwa/app/components/LoginButton.tsx` | Login UI component |
| `pwa/app/components/CreateEmbeddedWallet.tsx` | Wallet creation component |
| `pwa/app/hooks/usePrivyAuth.ts` | Authentication hook with Convex sync |
| `pwa/app/hooks/useSolanaBalance.ts` | React Query balance fetching hook |
| `pwa/app/hooks/usePayment.ts` | Payment execution with gas sponsorship |
| `pwa/app/scan/page.tsx` | QR scanner page |
| `pwa/app/confirm-payment/page.tsx` | Payment confirmation page |
| `pwa/app/components/QRCodeGenerator.tsx` | Merchant QR code generator |
| `pwa/app/api/sponsor-transaction/route.ts` | Backend gas sponsorship API |
| `pwa/src/utils/transactions.ts` | Solana transaction utilities |
| `pwa/src/utils/solanaPay.ts` | Solana Pay URL parsing |
