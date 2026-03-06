---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/useUserTransactions.ts
type: hook
updated: 2025-01-21
status: active
---

# useUserTransactions.ts

## Purpose

Real-time hook for user's transaction history using Convex live subscriptions. Automatically subscribes to updates in transactions table and returns last 5 confirmed transactions for the user's wallet address, newest first.

## Exports

- `useUserTransactions(walletAddress)` - Hook returning array of transactions with item names

## Dependencies

- convex/react - Convex real-time queries
- api.transactions.listUserTransactions - Transaction query by wallet address

## Used By

TBD
