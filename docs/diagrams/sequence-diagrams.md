# Sequence Diagrams

This document contains sequence diagrams for all key user flows in the DCWLT application.

## Table of Contents

1. [Gmail Authentication Flow](#1-gmail-authentication-flow)
2. [Simulated Visa Top-Up Flow](#2-simulated-visa-top-up-flow)
3. [QR Payment Flow](#3-qr-payment-flow)
4. [Token Creation Flow](#4-token-creation-flow)

---

## 1. Gmail Authentication Flow

The authentication flow derives a Solana wallet from the user's Gmail account using Web3Auth.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant App as Mobile App
    participant Web3Auth as Web3Auth Service
    participant Gmail as Gmail OAuth
    participant Solana as Solana Devnet

    User->>App: Tap "Continue with Google"
    App->>Web3Auth: Initialize Web3Auth
    Web3Auth-->>App: Initialization success

    App->>Web3Auth: Request login with Gmail
    Web3Auth->>Gmail: Redirect to OAuth consent
    Gmail-->>User: Show consent screen
    User->>Gmail: Authorize application
    Gmail-->>Web3Auth: OAuth authorization code

    Web3Auth->>Web3Auth: Derive private key from OAuth
    Web3Auth-->>App: Return private key (Ed25519)

    App->>App: Convert private key to Keypair
    App->>App: Derive public key (wallet address)
    App->>Solana: Request account info
    Solana-->>App: Return account details

    App-->>User: Display wallet address
    Note over User,Solana: User now has a derived wallet<br/>without managing private keys
```

### Key Points

- **Private Key Security**: Private key is derived by Web3Auth and never exposed to the app
- **Non-Custodial**: User maintains full control of their wallet
- **Recovery**: Lost wallets can be recovered by re-authenticating with Gmail

---

## 2. Simulated Visa Top-Up Flow

The top-up flow simulates a Visa card payment by transferring Event Tokens from the bank wallet.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant App as Mobile App
    participant Backend as Backend API
    participant Bank as Bank Wallet
    participant Solana as Solana Devnet
    participant Stripe as Stripe (Simulated)

    User->>App: Tap "Simulate Top Up"
    App->>App: Validate wallet address

    App->>Stripe: Simulate Visa payment (frontend)
    Note over Stripe: This is NOT a real payment<br/>No actual charge is made
    Stripe-->>App: Payment simulation success

    alt Payment Simulation Successful
        App->>Backend: POST /api/topup<br/>{ walletAddress, amount: 50 }
        Backend->>Backend: Load bank wallet keypair
        Backend->>Bank: Load bank wallet from .env

        Backend->>Solana: Create SPL Token Transfer
        Note over Backend,Solana: Instruction:<br/>Transfer 50 tokens<br/>Bank → User

        Backend->>Solana: Sign with bank keypair
        Backend->>Solana: Send transaction

        Solana->>Solana: Validate & execute transaction
        Solana-->>Backend: Return transaction signature

        Backend-->>App: { success: true, signature, amount }
        App->>Solana: Confirm transaction

        alt Transaction Confirmed
            Solana-->>App: Confirmation received
            App->>App: Update balance state
            App-->>User: Display new balance (+50 tokens)
        else Transaction Failed
            App-->>User: Show error message
        end
    else Payment Simulation Failed
        App-->>User: Show payment error
    end
```

### Key Points

- **No Real Money**: Stripe integration is simulated; no actual charges occur
- **Instant Transfer**: Tokens transfer immediately on Solana Devnet
- **Bank Wallet**: Holds all Event Tokens and dispenses them during top-ups
- **Verification**: Transaction can be verified on Solana Explorer

---

## 3. QR Payment Flow

The payment flow allows users to scan merchant QR codes and pay with Event Tokens.

```mermaid
sequenceDiagram
    autonumber
    participant Merchant as Merchant Device
    participant MerchantAPI as Merchant API
    participant Customer as Customer Device
    participant Solana as Solana Devnet
    participant Explorer as Solana Explorer

    Note over Merchant: Merchant initiates payment
    Merchant->>MerchantAPI: GET /qr?amount=50&merchant=<address>
    MerchantAPI->>MerchantAPI: Generate Solana Pay URL
    Note over MerchantAPI: URL format:<br/>solana:<address>?amount=50<br/>&spl-token=<TOKEN>

    MerchantAPI->>MerchantAPI: Generate QR code from URL
    MerchantAPI-->>Merchant: Return QR code (image)
    Merchant->>Merchant: Display QR to customer

    Note over Customer: Customer scans QR
    Customer->>Customer: Open camera scanner
    Customer->>Customer: Scan QR code
    Customer->>Customer: Parse Solana Pay URL

    Customer->>Customer: Validate URL & amount
    Customer->>Customer: Show payment confirmation

    alt Customer Approves
        Customer->>Customer: Create transfer instruction
        Note over Customer: Transfer 50 tokens<br/>Customer → Merchant

        Customer->>Customer: Sign with Web3Auth keypair
        Customer->>Solana: Send transaction

        Solana->>Solana: Validate & execute transaction
        Solana-->>Customer: Return transaction signature

        Customer->>Explorer: Verify transaction
        Explorer-->>Customer: Confirm transaction details

        alt Payment Successful
            Customer->>Customer: Deduct from balance
            Customer-->>Customer: Display success + new balance
            Merchant-->>Merchant: Show payment confirmation
        else Payment Failed
            Customer-->>Customer: Display error
        end
    else Customer Rejects
        Customer-->>Customer: Cancel payment
    end
```

### Key Points

- **Solana Pay**: Uses the Solana Pay URL standard for QR codes
- **Instant Settlement**: Payment confirmation in seconds
- **Reference Tracking**: Each payment includes a unique reference ID
- **Merchant Verification**: Merchants can verify payments on the blockchain

---

## 4. Token Creation Flow

The one-time setup flow for creating the Event Token on Solana Devnet.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant CLI as Solana CLI
    participant Devnet as Solana Devnet
    participant Explorer as Solana Explorer

    Note over Dev,Explorer: One-time blockchain setup

    Dev->>CLI: solana config set --url devnet
    CLI-->>Dev: Configured for Devnet

    Dev->>CLI: solana-keygen new --outfile ~/bank-wallet.json
    CLI->>CLI: Generate new Ed25519 keypair
    CLI-->>Dev: Bank wallet created

    Dev->>CLI: solana config set --keypair ~/bank-wallet.json
    CLI-->>Dev: Bank wallet set as default

    Dev->>CLI: solana airdrop 2
    CLI->>Devnet: Request 2 SOL for gas fees
    Devnet-->>CLI: 2 SOL airdropped

    Dev->>CLI: spl-token create-token
    CLI->>Devnet: Create new SPL Token mint
    Devnet-->>CLI: Return TOKEN_ADDRESS
    Note over CLI,Devnet: ⚠️ SAVE THIS ADDRESS!<br/>Cannot be recovered if lost

    Dev->>CLI: spl-token create-account <TOKEN_ADDRESS>
    CLI->>Devnet: Create token account for bank wallet
    Devnet-->>CLI: Token account created

    Dev->>CLI: spl-token mint <TOKEN_ADDRESS> 1000000
    CLI->>Devnet: Mint 1,000,000 tokens to bank
    Devnet-->>CLI: Mint successful

    Dev->>Explorer: Verify token creation
    Explorer-->>Dev: Show token details
    Dev->>Dev: Save TOKEN_ADDRESS to constants.ts
    Dev->>Dev: Save TOKEN_ADDRESS to .env files
```

### Key Points

- **One-Time Setup**: Token creation only happens once
- **Token Address**: Must be saved to constants and .env files
- **Bank Wallet**: Holds the entire initial token supply
- **Devnet SOL**: Free SOL is available for gas fees on Devnet

---

## Solana Pay URL Format

All merchant QR codes use the Solana Pay URL format:

```
solana:<MERCHANT_ADDRESS>?amount=<AMOUNT>&spl-token=<TOKEN_ADDRESS>&reference=<REFERENCE>&label=<LABEL>&message=<MESSAGE>
```

### Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `MERCHANT_ADDRESS` | Yes | Merchant's Solana public key | `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` |
| `amount` | Yes | Payment amount | `50` |
| `spl-token` | Yes | Event Token mint address | `YourTokenMintAddress` |
| `reference` | No | Unique transaction reference (UUID) | `550e8400-e29b-41d4-a716-446655440000` |
| `label` | No | Display name for merchant | `Merchant` |
| `message` | No | Payment description | `Payment for goods` |

### Example URL

```
solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=50&spl-token=YourTokenMintAddress&reference=550e8400-e29b-41d4-a716-446655440000&label=Merchant&message=Payment
```

---

## Transaction States

### Top-Up Transaction States

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │───>│ Processing  │───>│  Pending    │───>│ Confirmed   │
│  Received   │    │ (Signing)   │    │ (On-chain)  │    │  (Success)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       v                   v                   v                   v
   Invalid           Signing Failed      Transaction       Balance Updated
   Request           Failed              Failed
```

### Payment Transaction States

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  QR Scanned │───>│ User Review │───>│  Approved   │───>│ Confirmed   │
│             │    │  (Confirm)  │    │ (Signing)   │    │  (Success)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       v                   v                   v                   v
   Invalid             User Declined      Signing Failed      Balance Deducted
   QR Code                                 Failed
```

---

## Error Handling

### Common Error Scenarios

| Error | Cause | Resolution |
|-------|-------|------------|
| Invalid wallet address | Malformed public key | Validate Base58 format |
| Transaction timeout | Network congestion | Retry after 30 seconds |
| Insufficient funds | Bank wallet empty | Airdrop more tokens |
| Invalid signature | Signing error | Re-authenticate with Web3Auth |

---

## Security Considerations

### Web3Auth Security
- Private keys are derived server-side by Web3Auth
- App never receives raw private keys
- Keys are reconstructed in secure memory only

### Blockchain Security
- All transactions are signed locally
- No private keys leave the device
- Transactions are verifiable on Solana Explorer

### API Security (POC Limitations)
- No authentication implemented
- No rate limiting
- No input validation beyond basic checks
- **Production**: Implement API keys, rate limiting, and full validation
