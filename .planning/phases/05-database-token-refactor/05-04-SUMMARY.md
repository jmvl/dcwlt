---
phase: 05-database-token-refactor
plan: 04
subsystem: authentication
tags: [privy, solana, wallet, auth, configuration]
dependency_graph:
  requires: []
  provides: [auth-only-privy]
  affects: [PrivyProvider, user-authentication]
tech_stack:
  added: []
  patterns: [ssr-safe-provider, social-auth-only]
key_files:
  created: []
  modified:
    - pwa/app/components/PrivyProvider.tsx
decisions:
  - Privy configured for social authentication only, no blockchain wallet creation
  - Removed Solana RPC configuration as embedded wallets no longer created
  - Existing wallet addresses in database remain valid as user identifiers
metrics:
  duration: 109s
  completed_date: 2026-03-03
  task_count: 1
  file_count: 1
---

# Phase 05 Plan 04: Disable Privy Solana Wallet Creation Summary

## One-liner

Updated Privy configuration to disable embedded Solana wallet creation, making Privy auth-only while preserving social authentication.

## What Changed

### Files Modified

| File | Change |
|------|--------|
| `pwa/app/components/PrivyProvider.tsx` | Removed Solana RPC config, set `createOnLogin: 'off'` |

### Key Changes

1. **Removed Solana imports**: Removed `createSolanaRpc` and `createSolanaRpcSubscriptions` from `@solana/kit`
2. **Removed solanaConfig useMemo**: No longer needed since no Solana RPC is required
3. **Removed solana RPC configuration**: The entire `solana: { rpcs: solanaConfig }` section removed from PrivyProvider config
4. **Disabled wallet creation**: Changed `embeddedWallets.solana.createOnLogin` from `'users-without-wallets'` to `'off'`

## Verification Results

| Check | Status |
|-------|--------|
| `createOnLogin: 'off'` present | PASSED |
| `@solana/kit` import removed | PASSED |
| TypeScript compilation | PASSED (no new errors) |

## Deviations from Plan

None - plan executed exactly as written.

## Auth Gates

None encountered.

## Decisions Made

1. **Privy auth-only**: Privy now serves only as social authentication provider (Google/Apple OAuth), not as blockchain wallet provider
2. **Database wallet identifiers**: Existing wallet addresses in the database remain valid as user identifiers for the token system
3. **Clean removal**: All Solana-related configuration cleanly removed without affecting social auth flow
