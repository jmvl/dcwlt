---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/useMerchantLiveTransactions.ts
type: hook
updated: 2025-01-21
status: active
---

# useMerchantLiveTransactions.ts

## Purpose

Live transaction subscription hook for merchants with client-side filtering. Maintains stable WebSocket connection by only passing merchantId to query, handles filtering (date range, wallet search) on client, and detects new payments for toast notifications.

## Exports

- `useMerchantLiveTransactions(merchantId, filters)` - Hook returning { transactions, allTransactions, isLoading, isNewPayment }

## Dependencies

- convex/react - Convex real-time queries
- api.transactions.listLiveMerchantTransactions - Stable merchant transaction subscription

## Used By

TBD
