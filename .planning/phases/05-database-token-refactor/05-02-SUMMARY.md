---
phase: 05-database-token-refactor
plan: 02
subsystem: topup
tags: [convex, mutation, database, real-time]

# Dependency graph
requires:
  - phase: 02-auth-wallet-core-ui
    provides: Convex setup, wallet table, usePrivyAuth hook
provides:
  - Database-only top-up flow via Convex mutation
  - incrementBalance mutation for atomic balance updates
affects: [dashboard, payments]

# Tech tracking
tech-stack:
  added: []
  patterns: [Convex mutation for database updates, real-time balance via subscriptions]

key-files:
  created: []
  modified:
    - pwa/app/topup/page.tsx
    - pwa/convex/wallets.ts

key-decisions:
  - "Use incrementBalance mutation instead of setMockBalance for cleaner API"
  - "Remove React Query invalidation - Convex subscriptions handle real-time updates automatically"

patterns-established:
  - "Database-only mutations for top-up operations (no Solana transactions)"

requirements-completed: [DB-TOKEN-04]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 05 Plan 02: Refactor Top-up to Convex Mutation Summary

**Refactored top-up flow to use Convex mutation directly, removing backend API and Solana dependencies for balance updates.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T19:11:57Z
- **Completed:** 2026-03-03T19:14:06Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Removed backend API fetch call from top-up page
- Added `incrementBalance` mutation to wallets.ts for atomic balance increments
- Removed React Query invalidation (Convex handles real-time updates automatically)
- Updated success message to remove Solana Devnet reference
- Removed NEXT_PUBLIC_BACKEND_URL and ExternalLink usage

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor topup page to use Convex mutation directly** - `5303922f8` (feat)
2. **Task 2: Add incrementBalance mutation for top-up** - `5303922f8` (feat)

**Plan metadata:** Pending

_Note: Both tasks committed together as they are interdependent._

## Files Created/Modified

- `pwa/app/topup/page.tsx` - Refactored to use Convex mutation, removed backend API call and React Query
- `pwa/convex/wallets.ts` - Added incrementBalance mutation for atomic balance updates

## Decisions Made

- Used `incrementBalance` mutation instead of `setMockBalance` for cleaner API (passing amount to add, not total)
- Removed React Query invalidation since Convex subscriptions provide real-time balance updates automatically
- Simplified success state to only track amount (no signature or explorerUrl needed for database-only operations)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Top-up now uses Convex mutation directly
- Ready for payment flow refactoring in subsequent plans
- Balance updates are real-time via Convex subscriptions

## Self-Check: PASSED

All files and commits verified:
- pwa/app/topup/page.tsx: FOUND
- pwa/convex/wallets.ts: FOUND
- Commit 5303922f8: FOUND

---
*Phase: 05-database-token-refactor*
*Completed: 2026-03-03*
