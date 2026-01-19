# Blockchain POC Refinement Plan

This document outlines the focused improvements needed to stabilize and refine the DCWLT blockchain services for the Proof-of-Concept (POC) stage.

## 1. Technical Audit Summary (Updated)

### Current State

- **Port Conflict**: `merchant` and `solana-poc` both default to port `3001`.
- **UX Friction**: `backend` top-up fails for new users if they haven't manually created a token account (ATA).
- **Security**: Basic XOR sharding is used (appropriate for POC, but needs clear documentation); no rate limiting.
- **Maintenance**: RPC URLs and configuration are hardcoded instead of using environment variables.

### Re-evaluated Goals (POC Scale)

- **Stability**: Resolve service conflicts and ensure "out-of-the-box" success for user actions.
- **Maintainability**: Centralize configuration through `.env`.
- **Security Baseline**: Implement basic protections like rate limiting for public-facing endpoints.

---

## 2. Targeted Improvements

### Priority 1: Critical (Stability & Usability)

_Core fixes required for a functional and smooth POC demonstration._

- [ ] **Port Realignment**:
  - Keep `backend` on `3000`.
  - Keep `merchant` on `3001`.
  - Move `solana-poc` API to `3005` to avoid conflicts during testing.
- [ ] **ATA Auto-Creation (Backend Patch)**:
  - Update the `/api/topup` endpoint in `backend/src/server.ts` to check if a recipient token account exists.
  - If missing, automatically add the `createAssociatedTokenAccount` instruction to the transaction.
- [ ] **Environment Variable Consolidation**:
  - Remove hardcoded `https://api.devnet.solana.com` strings.
  - Extract all constants (Token Mint, RPC URL, Bank Keypair Path) into `.env`.
- [ ] **Implementation of Rate Limiting**:
  - Add `express-rate-limit` to the `/api/topup` endpoint to prevent accidental or intentional Devnet draining.

### Priority 2: Deferred / Optional (Non-Critical Enhancements)

_Items that add value but are not required for the immediate POC success._

- [ ] **Transaction Status Notifications**: (Optional) A simple polling mechanism or status endpoint for the frontend to confirm when a transaction moves from "sent" to "finalized".
- [ ] **Auto-Faucet Monitoring**: (Optional) Internal checks to warn the developer when the Bank Wallet SOL balance is low (currently a manual process).
- [ ] **Encryption for Backend Shards**: (Optional) Adding AES encryption for the shards stored in backend RAM (defense-in-depth).

---

## 3. Immediate Action Items

1. [ ] **Merchant Port Fix**: Ensure `.env` in the `merchant` directory is correctly respected and doesn't conflict with other services.
2. [ ] **Backend ATA Patch**: Implement the account creation logic in the top-up flow (Highest Usability impact).
3. [ ] **Config Cleanup**: Create a unified `README` in the root explaining which service runs on which port and how to configure the shared `.env` variables.

---

## 4. Notes on Revoked Recommendations

Based on recent analysis, the following items have been removed from the plan to maintain POC focus and avoid over-engineering:

- **Unified Gateway**: Services have distinct roles; separation is cleaner for this POC.
- **Shamir's Secret Sharing**: XOR sharding is sufficient to demonstrate the concept.
- **Gasless Transactions**: Already effectively implemented as the Bank Wallet acts as the fee payer for top-ups.
- **Merchant Settlement**: Production-level feature not required for current demonstration.
- **Decomposition of `solana-poc`**: The folder will be preserved as a standalone sharding demonstration.
