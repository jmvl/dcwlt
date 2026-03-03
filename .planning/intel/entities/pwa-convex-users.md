---
path: /Users/jm/Codebase/dcwlt/pwa/convex/users.ts
type: service
updated: 2025-01-21
status: active
---

# users.ts

## Purpose

Convex user CRUD operations. Creates user records from Privy authentication with associated wallet records, retrieves users by wallet address or email, and updates last active timestamp on repeat visits.

## Exports

- `getOrCreateUser` - Get or create user by wallet address with optional OAuth data
- `getUser` - Query user by wallet address
- `createFromPrivy` - Create user from Privy authentication (called after login)

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
