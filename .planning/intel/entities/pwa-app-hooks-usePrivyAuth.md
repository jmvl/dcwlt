---
path: /Users/jm/Codebase/dcwlt/pwa/app/hooks/usePrivyAuth.ts
type: hook
updated: 2025-01-21
status: active
---

# usePrivyAuth.ts

## Purpose

Privy authentication hook that wraps Privy's usePrivy hook. Automatically creates/updates Convex user records when authenticated, extracts email from linked accounts, stores user type for session tracking, and provides logout with session cleanup.

## Exports

- `usePrivyAuth()` - Hook returning { ready, authenticated, user, userEmail, login, logout }

## Dependencies

- @privy-io/react-auth - Privy authentication SDK
- api.users.createFromPrivy - Convex user record creation
- [[pwa-app-utils-logout]] - User type storage utilities

## Used By

TBD
