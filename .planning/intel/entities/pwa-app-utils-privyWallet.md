---
path: /Users/jm/Codebase/dcwlt/pwa/app/utils/privyWallet.ts
type: util
updated: 2025-01-21
status: active
---

# privyWallet.ts

## Purpose

Privy wallet detection utility for checking if user has Solana embedded wallet. Finds Solana wallet in linked accounts, checks if it's embedded (Privy-managed vs external), and extracts wallet details (address, client type, connector type).

## Exports

- `useSolanaWallet()` - Hook returning { solanaWallet, isEmbedded, walletDetails }

## Dependencies

- @privy-io/react-auth - Privy user data access

## Used By

TBD
