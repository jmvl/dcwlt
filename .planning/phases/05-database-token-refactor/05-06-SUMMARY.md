---
phase: 05-database-token-refactor
plan: 06
subsystem: payments
tags: [feature-flag, convex, usePayment, dual-mode]

# Dependency graph
requires:
  - phase: 05-database-token-refactor
    provides: Feature flag config (USE_DATABASE_TOKENS), transferBalance mutation in wallets.ts
provides:
  - Feature-flagged usePayment hook supporting both database and Solana modes
  - Instant database-mode payments via Convex mutation
  - Preserved Solana-mode fallback with gas sponsorship
affects:
  - payment-flow, confirm-payment, merchant-payments

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Feature flag branching pattern (USE_DATABASE_TOKENS)
    - Dual-mode payment hook (database vs blockchain)
    - Helper function extraction (executeDatabasePayment, executeSolanaPayment)

key-files:
  created: []
  modified:
    - pwa/app/hooks/usePayment.ts

key-decisions:
  - "Maintained backward compatibility - hook accepts no parameters, gets identifiers from Privy context internally"
  - "Extracted helper functions for cleaner code - executeDatabasePayment and executeSolanaPayment"
  - "Feature flag controls entire payment flow - no hybrid/gradual mode"

patterns-established:
  - Pattern 1: Feature-flagged payment - USE_DATABASE_TOKENS determines database vs Solana mode at runtime
  - Pattern 2: Dual identifiers - privyId for database mode, walletAddress for Solana mode

requirements-completed:
  - DB-TOKEN-02
  - DB-TOKEN-03

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 05: Database Token Refactor Plan 06: Feature-Flag Payment Hook Summary

**usePayment hook refactored to support both database and Solana modes via USE_DATABASE_TOKENS feature flag**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T20:31:12Z
- **Completed:** 2026-03-03T20:33:56Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added USE_DATABASE_TOKENS feature flag import to usePayment hook
- Created executeDatabasePayment helper for instant Convex-based transfers
- Renamed existing Solana logic to executeSolanaPayment helper
- Hook now branches based on feature flag with no breaking changes to API

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor usePayment hook with feature flag branching** - `9c2b710b2` (feat)

**Plan metadata:** To be added after STATE.md update

## Files Created/Modified
- `pwa/app/hooks/usePayment.ts` - Feature-flagged payment hook with dual-mode support (database vs Solana)

## Decisions Made
- Maintained backward compatibility - hook accepts no parameters, gets identifiers (walletAddress, privyId) from Privy context internally rather than requiring caller to pass them
- Extracted helper functions (executeDatabasePayment, executeSolanaPayment) for cleaner code organization and maintainability
- Feature flag controls entire payment flow - no hybrid/gradual mode, either full database or full Solana

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Payment hook ready for database token mode
- Can proceed to Plan 07 (update confirm-payment page to pass privyId)
- Can proceed to Plan 08 (simplify QR code format)

## Self-Check: PASSED
- [x] usePayment.ts exists
- [x] USE_DATABASE_TOKENS feature flag present
- [x] Commit 9c2b710b2 exists

---
*Phase: 05-database-token-refactor*
*Completed: 2026-03-03*
