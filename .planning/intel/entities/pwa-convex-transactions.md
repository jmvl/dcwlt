---
path: /Users/jm/Codebase/dcwlt/pwa/convex/transactions.ts
type: service
updated: 2025-01-21
status: active
---

# transactions.ts

## Purpose

Convex transaction record management for merchant payments. Creates transaction records (pending/confirmed/failed), lists transactions for merchants and users with filtering, calculates sales statistics, and updates transaction status with wallet balance sync.

## Exports

- `listLiveMerchantTransactions` - Real-time merchant transactions (stable subscription)
- `listMerchantTransactions` - Merchant transactions with optional filtering
- `listUserTransactions` - User's transaction history (last 5 confirmed)
- `getMerchantSalesStats` - Sales statistics by date range
- `createTransaction` - Create new transaction record
- `updateTransactionStatus` - Update status and sync wallet balance

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
