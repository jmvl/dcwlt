# DCWLT - High-Level Architecture (HLD)

**Project:** Digital Currency Wallet with Ledger Technology (DCWLT) - PWA Edition  
**Architecture Type:** Hybrid Ledger (On-Chain Settlement + Off-Chain Execution)  
**Target Scale:** 20,000 concurrent users in 15-minute windows  
**Last Updated:** 2026-01-17

---

## Executive Summary

This architecture documents a **Progressive Web Application (PWA)** for high-frequency event payments using a **Hybrid Ledger** approach. The system combines the security of Solana blockchain settlement with the speed of Convex real-time database to handle "thundering herd" scenarios (e.g., stadium halftime rushes).

**Core Innovation:** Separation of **execution** (off-chain in Convex, <200ms) from **settlement** (on-chain in Solana, ~400ms). This enables instant UI feedback while maintaining blockchain security guarantees.

---

## Architecture Diagram

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    DCWLT - High-Level Architecture (HLD)                     ║
║              Digital Currency Wallet with Ledger Technology                ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    PWA Frontend (Next.js 16)                          │  │
│  │                                                                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │  │
│  │  │  Dashboard  │ │  QR Scanner │ │ Payment     │ │  Balance    │     │  │
│  │  │     UI      │ │             │ │  Flow       │ │  Display    │     │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │  │
│  │                                                                       │  │
│  │  • PWA Manifest (Installable)                                         │  │
│  │  • Service Worker (Offline Support)                                   │  │
│  │  • Real-time Subscriptions (Convex WebSocket)                         │  │
│  │  • Shadcn/UI Components                                                │  │
│  └───────────────────────────────────────┬───────────────────────────────┘  │
│                                          │                                  │
└──────────────────────────────────────────┼──────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION LAYER                               │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Privy Embedded Wallet                          │  │
│  │                                                                       │  │
│  │  • Social Login (Google, Apple)                                        │  │
│  │  • Ed25519 Keypair Generation (Shamir's Secret Sharing)               │  │
│  │  • Solana Address Derivation                                           │  │
│  │  • Session Management (JWT)                                            │  │
│  │  • Non-Custodial Key Storage                                           │  │
│  └───────────────────────────────────────┬───────────────────────────────┘  │
│                                          │                                  │
└──────────────────────────────────────────┼──────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS LOGIC LAYER                                │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                              Convex                                     │  │
│  │                   (Stateful Sync Platform)                              │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │   Queries    │  │  Mutations   │  │   Actions    │                 │  │
│  │  │              │  │              │  │              │                 │  │
│  │  │ • getBalance │  │ • recordPay  │  │ • settlePay  │                 │  │
│  │  │ • getHistory │  │ • topUpWallet│  │ • execTopup  │                 │  │
│  │  │ • getQRCode  │  │ • syncWallet │  │ • stripeHook │                 │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │  │
│  │                                                                       │  │
│  │  • Real-time Subscriptions (WebSocket)                                │  │
│  │  • Optimistic Updates (Instant UI)                                    │  │
│  │  • Database (ACID-compliant, Auto-sharding)                            │  │
│  │  • Scheduler (Async Settlement)                                        │  │
│  └───────────────────────────────────────┬───────────────────────────────┘  │
│                                          │                                  │
└──────────────────────────────────────────┼──────────────────────────────────┘
                                           │
                   ┌───────────────────────┼───────────────────────┐
                   │                       │                       │
                   ▼                       ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────┐
│      Stripe             │  │    Solana Pay            │  │    HTTP Endpoints     │
│   (Fiat On-Ramp)        │  │  (Payment Protocol)      │  │    (Webhooks)         │
│                        │  │                          │  │                      │
│  • Checkout Sessions   │  │  • QR URL Format         │  │  • Stripe Webhook     │
│  • Webhooks            │  │  • Transfer Requests     │  │  • Payment Callbacks  │
│  • Card Processing     │  │  • Payment Confirmation  │  │                      │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLOCKCHAIN LAYER                                     │
│                                                                               │
│  ┌────────────────────────────────┐    ┌────────────────────────────────┐    │
│  │       Solana Devnet            │    │         Helius RPC             │    │
│  │     (Settlement Layer)         │    │      (RPC Provider)            │    │
│  │                                │    │                                │    │
│  │  • SPL Token: EVT              │◄───┤  • Dedicated RPC Endpoint      │    │
│  │  • Token Transfers             │    │  • WebSocket Support           │    │
│  │  • ~400ms Block Time           │    │  • ~400ms Confirmation         │    │
│  │  • Immutable Ledger            │    │  • Jito Bundles (Optional)     │    │
│  └────────────────────────────────┘    └────────────────────────────────┘    │
│                                                                               │
│  Token Mint: 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq                     │
│  Treasury: Server-controlled wallet (holds 1M EVT)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Layers

### 1. Client Layer (PWA Frontend)

**Technology:** Next.js 16 (App Router) + PWA Manifest + Service Worker

**Responsibilities:**

- User interface rendering
- PWA installability and offline support
- Client-side state (UI-only: modals, forms)
- Real-time data subscriptions

**Key Components:**

| Component        | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| Dashboard        | Main wallet interface, balance display, action buttons |
| QR Scanner       | Camera-based payment QR code scanning                  |
| Payment Flow     | Confirmation dialogs, payment status                   |
| Balance Display  | Real-time balance updates via Convex subscriptions     |
| Transaction List | Payment history with real-time updates                 |

**Entry Point:** `app/layout.tsx` (root layout with providers)

---

### 2. Authentication Layer (Privy)

**Technology:** Privy Embedded Wallet

**Responsibilities:**

- Identity verification (social login)
- Ed25519 keypair generation
- Solana address derivation
- Private key storage (Shamir's Secret Sharing)
- Session management

**Security Model:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Privy Security Model                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Private Key (3-of-5 Shamir's Secret Sharing)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Share 1: User Device (Encrypted Local Storage)        │   │
│  │  Share 2: Privy Cloud (HSM-Backed)                     │   │
│  │  Share 3: Recovery Method (Email/SMS)                 │   │
│  │  Share 4: Recovery Method (Backup Phrase)             │   │
│  │  Share 5: Social Account (Google/Apple)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│                    Non-Custodial Wallet                         │
│              (User maintains full control)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Integration:**

```typescript
// Client-side: components/providers/PrivyProvider.tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{
    embeddedWallets: { createOnLogin: "users-without-wallets" },
    appearance: { theme: "light", accentColor: "#6366f1" },
  }}
>
  {children}
</PrivyProvider>
```

---

### 3. Business Logic Layer (Convex)

**Technology:** Convex (Stateful sync platform)

**Responsibilities:**

- Business logic execution
- Data persistence and consistency
- Real-time state synchronization
- Blockchain transaction orchestration
- Stripe integration

**Function Types:**

| Type         | Purpose                          | Timing     | Example                          |
| ------------ | -------------------------------- | ---------- | -------------------------------- |
| **Query**    | Read operations, auto-subscribed | Instant    | `getBalance`, `getHistory`       |
| **Mutation** | Write with optimistic update     | Instant UI | `recordPayment`, `topUpWallet`   |
| **Action**   | Server-only, external API calls  | Async      | `settlePayment`, `executeStripe` |

**Database Schema:**

```typescript
// convex/schema.ts
{
  wallets: {
    privyDid: string,              // Privy decentralized ID
    solanaAddress: string,         // Derived Solana address
    createdAt: number,
    lastLogin: number,
  },

  balances: {
    walletAddress: string,
    amount: number,                // Cached balance (off-chain)
    lastUpdated: number,
    pendingTransactions: id[],     // Locking mechanism
  },

  transactions: {
    fromWallet: string,
    toWallet: string,
    amount: number,
    status: "pending" | "confirmed" | "failed",
    signature: string,             // On-chain signature
    createdAt: number,
    settledAt: number,
  },

  topups: {
    walletAddress: string,
    amount: number,
    stripePaymentIntentId: string,
    status: "pending" | "completed",
    signature: string,
    createdAt: number,
  },

  merchants: {
    name: string,
    solanaAddress: string,
    category: "bar" | "merch" | "food",
    isActive: boolean,
  }
}
```

---

### 4. Payment Layer (Stripe)

**Technology:** Stripe Checkout + Convex Stripe Component

**Responsibilities:**

- Fiat payment collection
- Card processing
- PCI compliance
- Webhook delivery

**Top-Up Flow:**

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│   PWA    │───▶│  Convex  │───▶│  Stripe  │───▶│  User    │
│          │    │          │    │          │    │          │    │  (Card)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
            ┌──────────────┐
            │  Solana RPC  │
            │              │
            │ • Transfer   │
            │   Tokens     │
            │ • Update DB  │
            └──────────────┘
```

---

### 5. Blockchain Layer (Solana)

**Technology:** Solana Devnet + SPL Token + Helius RPC

**Responsibilities:**

- Token settlement
- Ledger of truth
- Balance verification
- Transaction finality

**Token Details:**

| Property         | Value                                          |
| ---------------- | ---------------------------------------------- |
| **Token Name**   | Event Token (EVT)                              |
| **Mint Address** | `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq` |
| **Decimals**     | 9                                              |
| **Total Supply** | 1,000,000 EVT                                  |
| **Network**      | Solana Devnet                                  |
| **Explorer**     | https://explorer.solana.com/?cluster=devnet    |

**Security Critical:** Treasury private key NEVER leaves server (Convex actions only)

---

## Data Flows

### Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│   PWA    │───▶│  Privy   │───▶│  Convex  │───▶│Database  │
│          │    │          │    │          │    │          │    │          │
│ Click    │    │ Trigger  │    │ OAuth +  │    │ Create/   │    │ Wallet +  │
│ "Sign In"│    │ Login    │    │ Key Gen  │    │ Sync      │    │ Balance  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              ┌──────────────┐
              │  Show Wallet │
              │   Address    │
              └──────────────┘
```

### Top-Up Flow (Fiat → Crypto)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│   PWA    │───▶│  Stripe  │───▶│  Convex  │───▶│  Solana  │
│          │    │          │    │ Checkout │    │ Webhook  │    │          │
│ Click    │    │ Redirect │    │          │    │ Process  │    │ Transfer  │
│ "Top Up" │    │ to Stripe│    │ Card Pay │    │ Payment   │    │ Tokens   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                               │
                    ┌──────────────────────────────────────────┘
                    ▼
              ┌──────────────┐
              │ Real-time    │
              │ Balance      │
              │ Update       │
              └──────────────┘
```

### Payment Flow (QR Code → Transfer)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Merchant │───▶│   PWA    │───▶│   PWA    │───▶│  Convex  │───▶│  Solana  │
│          │    │ (Gen QR) │    │ (Scanner)│    │          │    │          │
│ Generate │    │          │    │ Parse +  │    │ Optimistic│    │ Transfer  │
│ QR Code  │    │ Display  │    │ Confirm  │    │ Update    │    │ Tokens   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                                         │
     │  ┌─────────────────────────────────────────────────────┘
     │  ▼
     │ Instant UI Success (<200ms)
     │
     └─────────────────────▶
           Background Settlement (~400ms)
```

---

## Hybrid Settlement Pattern

**The Core Innovation:** Separation of execution from settlement

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        HYBRID SETTLEMENT PATTERN                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

    OFF-CHAIN EXECUTION                  ON-CHAIN SETTLEMENT
       (Convex)                              (Solana)

    ████████████████                                                  ████
         Instant                                                    Final
         (<200ms)                                                   (~400ms)

    ┌─────────────┐                                                  ┌─────────────┐
    │    User     │                                                  │    User     │
    │     Pay     │                                                  │   Balance   │
    │    10 EVT   │                                                  │   Updated   │
    └──────┬──────┘                                                  └──────┬──────┘
           │                                                                │
           ▼                                                                ▼
    ┌─────────────┐                                             ┌─────────────┐
    │   Convex    │                                             │   Solana    │
    │  Mutation   │──── (Schedule) ─────────────────────────────▶│  Transfer   │
    │             │                                             │  Confirmed  │
    │  Optimistic │                                             │             │
    │  Update     │                                             │   Signature │
    └──────┬──────┘                                             └──────┬──────┘
           │                                                           │
           ▼                                                           ▼
    ┌─────────────┐                                             ┌─────────────┐
    │     UI      │                                             │   Convex    │
    │  Success!   │◀──── (WebSocket Push) ─────────────────────────│  Update    │
    │             │                                             │   Status    │
    │  Balance:   │                                             │  confirmed  │
    │    -10 EVT  │                                             │             │
    └─────────────┘                                             └─────────────┘


TIMELINE:

    T+0ms     T+50ms    T+200ms   T+400ms   T+500ms
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
    ┌─────────────────────────────────────────────┐
    │ User clicks "Pay"                           │
    └─────────────────────────────────────────────┘
                        ┌─────────────────────────────────────────────┐
                        │ Convex: Record payment, update balance       │
                        └─────────────────────────────────────────────┘
                                            ┌─────────────────────────────────────────────┐
                                            │ UI: Shows success, balance decreased       │
                                            └─────────────────────────────────────────────┘
                                                        ┌─────────────────────────────────────────────┐
                                                        │ Solana: Transaction confirmed              │
                                                        └─────────────────────────────────────────────┘
                                                                    ┌─────────────────────────────────────────────┐
                                                                    │ Convex: Push status update via WebSocket    │
                                                                    └─────────────────────────────────────────────┘
```

**Benefits:**

1. **Instant UX:** User sees success in <200ms
2. **Blockchain Security:** Final settlement on Solana
3. **No Double-Spend:** Convex ACID transactions prevent race conditions
4. **Real-Time Sync:** All clients update automatically via WebSocket
5. **Offline Support:** Service worker queues mutations for retry

---

## Technology Stack

| Layer          | Technology                                    | Purpose                             |
| -------------- | --------------------------------------------- | ----------------------------------- |
| **Frontend**   | Next.js 16, React 19, Tailwind CSS, Shadcn/UI | UI framework, styling               |
| **PWA**        | @ducanh2912/next-pwa, Workbox                 | Installability, offline support     |
| **Auth**       | Privy Embedded Wallet                         | Social login, key management        |
| **Backend**    | Convex                                        | Real-time database, functions, sync |
| **Payments**   | Stripe Checkout                               | Fiat on-ramp                        |
| **Blockchain** | Solana Devnet, Helius RPC                     | Token settlement                    |
| **Language**   | TypeScript                                    | Type safety across stack            |

---

## Security Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           SECURITY LAYERS                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────────────┐
    │                    LAYER 1: Authentication                       │
    │  • OAuth 2.0 (Google, Apple)                                    │
    │  • Privy Shamir's Secret Sharing (3-of-5)                       │
    │  • JWT Session Management                                       │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    LAYER 2: Authorization                       │
    │  • Convex Authentication (user identity)                        │
    │  • Request Validation (Convex schema)                           │
    │  • Protected Mutations (auth required)                          │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    LAYER 3: Input Validation                     │
    │  • Address Format Validation (Solana SDK)                       │
    │  • Amount Range Checks                                         │
    │  • Balance Verification                                         │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    LAYER 4: Rate Limiting                       │
    │  • Per-User Request Limits                                      │
    │  • IP-based Throttling                                          │
    │  • Convex Middleware Enforcement                                │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    LAYER 5: Blockchain Security                 │
    │  • Private Keys: Server-Side Only (Convex Actions)              │
    │  • Treasury Wallet: HSM-Backed (Production)                     │
    │  • Transaction Confirmation Before Finalizing                   │
    │  • On-Chain Audit Trail                                         │
    └─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         DEPLOYMENT ARCHITECTURE                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────────────┐
    │                         CDN / Edge                               │
    │                    (Vercel Edge Network)                         │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Next.js Edge Runtime                          │
    │              (Server Components, PWA Assets)                     │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                       Convex Cloud                               │
    │              (Automatic Scaling, Global Edge)                    │
    │                                                                  │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
    │  │  Queries   │  │ Mutations  │  │  Actions   │                 │
    │  │ (Read)     │  │  (Write)   │  │ (Server)   │                 │
    │  └────────────┘  └────────────┘  └────────────┘                 │
    │                                                                  │
    │  ┌────────────────────────────────────────────────────┐          │
    │  │            Database (Auto-Sharding)              │          │
    │  └────────────────────────────────────────────────────┘          │
    └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                   External Services                              │
    │                                                                  │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
    │  │  Privy   │  │  Stripe  │  │  Helius  │  │ Solana   │       │
    │  │   Auth   │  │ Payments │  │    RPC   │  │ Devnet   │       │
    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
    └─────────────────────────────────────────────────────────────────┘


ENVIRONMENTS:

    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ Development  │     │   Staging    │     │  Production  │
    │              │     │              │     │              │
    │ localhost    │     │ staging.*    │     │ dcwlt.app    │
    │ :3000        │     │              │     │              │
    │              │     │              │     │              │
    │ Convex Dev   │     │ Convex Test  │     │ Convex Prod  │
    │ Stripe Test  │     │ Stripe Test  │     │ Stripe Live  │
    │ Solana Dev   │     │ Solana Dev   │     │ Solana Main  │
    └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Monitoring & Observability

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          KEY METRICS                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER EXPERIENCE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Time to First Paint (TTFP)          Target: <1s                         │
│  • Time to Interactive (TTI)           Target: <2s                         │
│  • Payment Success Rate                Target: >99%                        │
│  • Average Payment Latency             Target: <500ms                      │
│  • PWA Install Rate                    Target: >60%                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM HEALTH                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Convex Query Latency (p95)           Target: <100ms                     │
│  • Convex Mutation Latency (p95)        Target: <200ms                     │
│  • WebSocket Connection Count           Monitor: Active connections        │
│  • Solana Confirmation Time            Target: <500ms                      │
│  • Stripe Webhook Processing           Target: <2s                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS METRICS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Daily Active Users (DAU)             Monitor: Trend                    │
│  • Transactions Per Day                 Monitor: Volume                    │
│  • Average Transaction Value            Monitor: USD/EVT                  │
│  • Top-Up Conversion Rate               Target: >40%                       │
│  • Churn Rate                          Target: <5%/month                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### A. Quick Reference

| File                 | Purpose                      |
| -------------------- | ---------------------------- |
| `app/layout.tsx`     | Root layout, providers       |
| `convex/schema.ts`   | Database schema              |
| `convex/auth/`       | Authentication mutations     |
| `convex/balances/`   | Balance queries/mutations    |
| `convex/payments/`   | Payment recording/settlement |
| `convex/blockchain/` | Solana RPC integration       |
| `convex/stripe/`     | Stripe webhook handling      |

### B. Environment Variables

```bash
# Privy (Authentication)
NEXT_PUBLIC_PRIVY_APP_ID=privy-app-id
PRIVY_APP_SECRET=privy-secret

# Convex (Backend)
NEXT_PUBLIC_CONVEX_URL=https://your-convex-site.convex.cloud

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Solana (Blockchain)
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=...
HELIUS_WSS_URL=wss://devnet.helius-rpc.com/?api-key=...
TREASURY_PRIVATE_KEY='[1,2,3,...]'
TOKEN_MINT_ADDRESS=4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq

# Monitoring (Optional)
DATADOG_API_KEY=...
NEW_RELIC_LICENSE_KEY=...
```

### C. Related Documents

- `.planning/research/ARCHITECTURE.md` - Detailed architecture analysis
- `.planning/codebase/STACK.md` - Technology stack details
- `.planning/codebase/INTEGRATIONS.md` - External service integrations
- `blockchain-notes.md` - Token addresses and setup

---

**Document Version:** 2.0  
**Last Updated:** 2026-01-17  
**Status:** Current Architecture (React Native removed, PWA-only)
