---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/useSolanaBalance.ts
type: hook
updated: 2025-01-21
status: active
---

# useSolanaBalance.ts

## Purpose

React Query hook for fetching SPL token balance from Solana Devnet. Provides automatic caching (30s stale time), background refetch, optimistic updates, and loading/error states. Uses Event Token mint address constant.

## Exports

- `useSolanaBalance(walletAddress)` - Hook returning { data, isLoading, error, refetch }
- `balanceQueryKeys` - Query key factory for manual invalidation

## Dependencies

- @tanstack/react-query - React Query for data fetching
- [[pwa-src-utils-transactions]] - getSPLTokenBalance utility
- 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq - Event Token mint address

## Used By

TBD
