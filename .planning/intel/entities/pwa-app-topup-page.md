---
path: /Users/jm/Codebase/dcwlt/pwa/app/topup/page.tsx
type: component
updated: 2025-01-21
status: active
---

# topup/page.tsx

## Purpose

Token top-up page allowing users to purchase Event Token bundles. Calls backend API to transfer tokens from bank wallet to user's wallet, displays success/failure states, and invalidates balance cache after successful top-up.

## Exports

- `TopUpPage` - Top-up page with bundle selection and payment processing

## Dependencies

- [[pwa-app-hooks-usePrivyAuth]] - Privy authentication and wallet access
- [[pwa-app-components-TopUpBundle]] - Individual top-up bundle card component
- [[pwa-app-hooks-useSolanaBalance]] - Balance query hook for cache invalidation
- backend /api/topup endpoint - Token transfer service

## Used By

TBD
