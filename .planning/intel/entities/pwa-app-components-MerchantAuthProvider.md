---
path: /Users/jm/Codebase/dcwlt/pwa/app/components/MerchantAuthProvider.tsx
type: component
updated: 2025-01-21
status: active
---

# MerchantAuthProvider.tsx

## Purpose

Merchant authentication provider that validates merchant account status (approved/pending/rejected) based on Privy user email. Auto-updates merchant wallet address if it differs from Privy wallet, redirects unauthenticated/pending/rejected merchants to appropriate pages, and provides merchant context to child components.

## Exports

- `MerchantAuthProvider` - Merchant authentication provider with status validation
- `useMerchantAuth` - Hook for accessing merchant auth context

## Dependencies

- [[pwa-app-hooks-usePrivyAuth]] - Privy authentication state
- api.merchants - Merchant queries and wallet update mutations
- next/navigation - Router for redirects

## Used By

TBD
