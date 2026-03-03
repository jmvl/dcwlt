---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/usePayment.ts
type: hook
updated: 2025-01-21
status: active
---

# usePayment.ts

## Purpose

Sponsored transaction payment hook implementing gas-free Solana Pay. Builds transaction with backend fee payer, signs transaction message via Privy, creates Convex transaction record, sends to backend for fee payer signature and broadcast, updates transaction status, and invalidates balance cache on success.

## Exports

- `usePayment()` - Hook returning { executePayment, loading, error }
- `PaymentParams` - Payment parameters interface
- `PaymentResult` - Payment result interface

## Dependencies

- @privy-io/react-auth/solana - Privy Solana wallet and signing
- @solana/web3.js - Solana transaction building
- @solana/spl-token - SPL token transfer instructions
- @tanstack/react-query - Query invalidation
- api.transactions - Convex transaction mutations
- [[pwa-app-hooks-useSolanaBalance]] - Balance cache invalidation

## Used By

TBD
