---
path: /Users/jm/Codebase/dcwlt/pwa/convex/wallets.ts
type: service
updated: 2025-01-21
status: active
---

# wallets.ts

## Purpose

Convex wallet management operations. Tracks token balances and fiat equivalents, updates balances after top-ups and payments, provides admin queries for all wallets, and integrates with backend for real Solana Devnet top-ups.

## Exports

- `getAllWallets` - Get all wallets (admin)
- `getWalletByAddress` - Get wallet by address
- `getBalance` - Get balance by address (for subscriptions)
- `updateBalance` - Update balance (called by backend)
- `setMockBalance` - Set mock balance for testing
- `mockTopUp` - Real top-up action calling backend API
- `recordPayment` - Subtract tokens after payment
- Internal queries/mutations for top-up flow

## Dependencies

- convex/server - Mutation, query, action handlers
- convex/values - Argument validators
- BACKEND_URL - Backend top-up API endpoint

## Used By

TBD
