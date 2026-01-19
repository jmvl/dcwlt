# Technical Architecture Document: High-Frequency Event Wallet

**Version:** 1.0
**Target Audience:** Lead Developers, System Architects, DevOps
**Project Scope:** Closed-Loop Payment System for Large Scale Live Events

---

## 1. Executive Summary

This document outlines the technical architecture for a high-concurrency **Progressive Web Application (PWA)** designed to serve as a digital wallet for live events. The system enables attendees to purchase and spend SPL tokens (event currency) seamlessly.

The architecture is specifically engineered to handle **"Thundering Herd"** scenarios—such as halftime at a football match or intermission at a concert—where up to 20,000 users may interact with the system within a compressed 15-minute window. To achieve this, we utilize a **Hybrid Ledger** approach, combining the security of the Solana blockchain with the real-time speed of a distributed database.

## 2. Field of Operation & Constraints

The system is designed for high-density environments with specific constraints:

- **Environments:** Football Stadiums, Music Festivals, Concert Halls.
- **User Base:** 20,000+ concurrent users.
- **Connectivity:** High latency, potentially saturated 4G/5G networks.
- **Throughput Requirement:** Instant (<200ms) UI feedback for transactions; zero-downtime availability.
- **User Journey:** "Scan to Mint" (QR Code) $\rightarrow$ "Tap to Pay" (Bar/Merch).

---

## 3. The Core Architecture: "The Hybrid Ledger"

To prevent network congestion from halting Point of Sale (POS) operations, we separate **Settlement** from **Execution**.

1.  **On-Chain Layer (High Security):** Used for **Top-Ups**. When a user buys tokens with Fiat (Stripe), real SPL tokens are transferred to their Solana wallet. This creates a trustless "source of truth."
2.  **Off-Chain Layer (High Speed):** Used for **Spending**. When a user buys a drink, the transaction is recorded immediately in our real-time database (Convex) and the UI updates instantly. The actual blockchain settlement occurs asynchronously or in batches.

---

## 4. The Technology Stack

### A. Frontend (The User Interface)

- **Framework:** **Next.js 16+ (App Router)**
  - _Reason:_ Server-side rendering for fast initial load; excellent PWA support.
- **Platform:** **PWA (Progressive Web App)**
  - _Library:_ `@ducanh2912/next-pwa`
  - _Reason:_ Bypasses App Store review times; 0-click installation; works on low-bandwidth connections.
- **Styling:** **Tailwind CSS** + **Shadcn/UI**
  - _Reason:_ Lightweight CSS bundles; accessible, pre-built components for rapid iteration.

### B. Authentication & Wallet (Identity)

- **Provider:** **Privy**
  - _SDK:_ `@privy-io/react-auth`, `@privy-io/solana-adapter`
  - _Reason:_ Best-in-class "Embedded Wallet" UX. Supports Social Login (Gmail, Apple) and auto-generates a non-custodial Solana keypair. High reliability under load.

### C. Backend & Real-Time State (The Engine)

- **Platform:** **Convex**
  - _Reason:_ Replaces the traditional API/SQL stack. Handles websocket connections automatically. Pushes state changes (e.g., balance updates) to the client instantly without polling.
- **Logic:** **Convex Actions** (Node.js runtime)
  - _Role:_ Handles third-party API calls (Stripe, Helius) securely.

### D. Blockchain Infrastructure (The Settlement)

- **Network:** **Solana Mainnet**
  - _Token Standard:_ **SPL Token** (via Metaplex SDK).
- **RPC Provider:** **Helius** (Business Tier)
  - _Reason:_ Dedicated nodes to bypass public congestion.
  - _Feature:_ **Jito Bundles**. Used to bribe validators slightly to guarantee transaction inclusion during network spikes.

### E. Payments (The On-Ramp)

- **Provider:** **Stripe**
  - _Features:_ Stripe Checkout / Elements.
  - _Integration:_ Webhooks trigger Convex Actions to execute the "Mint/Transfer" on-chain.

---

## 5. Supported Use Cases & User Flows

### Use Case 1: Frictionless Onboarding

- **Trigger:** User scans a QR code on the back of a stadium seat.
- **Flow:** PWA opens $\rightarrow$ User clicks "Sign in with Google" (Privy) $\rightarrow$ Wallet created silently.
- **Tech:** Privy creates an embedded `Ed25519` keypair.

### Use Case 2: The "Top-Up" (Fiat to Crypto)

- **Trigger:** User selects "$20 Bundle (200 EVT Tokens)."
- **Flow:** Stripe Payment Sheet $\rightarrow$ Success Webhook $\rightarrow$ Backend transfers 200 EVT from Treasury Wallet to User Wallet.
- **Latency:** ~2-5 seconds (dependent on Solana block time).
- **Gas:** Backend acts as the **Fee Payer** (Gasless for user).

### Use Case 3: High-Frequency Spending (The Bar)

- **Trigger:** Bartender presents QR code for "2 Beers (20 EVT)."
- **Flow:** User scans $\rightarrow$ Clicks "Pay" $\rightarrow$ **Optimistic Update**: Balance drops immediately in UI $\rightarrow$ Bartender sees "Green/Paid" signal.
- **Tech:** Convex Mutation records the spend in the internal ledger. The actual blockchain transaction is queued to run asynchronously to ensure the line keeps moving.

---

## 6. Implementation Guidelines for Developers

1.  **Concurrency Handling:** Do not use `useEffect` for fetching balances. Use Convex `useQuery` hooks to subscribe to data. This ensures all 20,000 users have synchronized state without crashing the DB.
2.  **Optimistic UI:** All "Spend" actions must utilize Convex's optimistic updates. The user must see the payment succeed immediately, even if the backend is still processing.
3.  **Offline Strategy:** The PWA `manifest.json` must be configured to cache the user's QR code (Public Key) so they can still receive tokens or be identified even if the cellular network fails completely.
4.  **Security:** Never expose the Treasury Private Key in the frontend code. All Solana signing operations must happen within **Convex Actions** (server-side environment).

---

**End of Document**
_Prepared by IT Architecture Team_
