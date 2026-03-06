---
phase: 03-topup-payments
plan: 01
subsystem: payments
tags: [convex, mock-topup, token-bundles, react-hooks]

# Dependency graph
requires:
  - phase: 2-auth-wallet-core-ui
    provides: Convex wallets table, Privy auth integration, BalanceDisplay component
provides:
  - Mock top-up flow with predefined token bundles (50/100/200/500 EVT)
  - Convex mutations for recording and executing mock top-ups
  - TopUpBundle component with loading and success states
  - Real-time balance updates after top-up via Convex subscriptions
affects: [03-02-qr-payments, 04-merchant-terminal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SSR-safe Convex mutation loading (dynamic require)
    - React state management for purchase flow (loading, success, error)
    - Mock transaction signature generation pattern

key-files:
  created:
    - pwa/app/topup/page.tsx
    - pwa/app/components/TopUpBundle.tsx
    - pwa/convex/topups.ts
  modified:
    - pwa/convex/wallets.ts
    - pwa/convex/_generated/api.js
    - pwa/convex/_generated/api.d.ts
    - pwa/app/dashboard/page.tsx
    - pwa/app/scan/page.tsx

key-decisions:
  - "Used 2-second delay in mockTopUp to simulate network request"
  - "Generated mock transaction signatures with timestamp and random string"
  - "Separate success screen with transaction signature display"
  - "TopUpBundle maintains its own loading and purchased state"

patterns-established:
  - "Purchase flow pattern: Bundle selection → Loading → Success/error state"
  - "Convex mutation pattern: Dynamic require for SSR safety"
  - "Navigation pattern: Success screen with 'View Dashboard' button"

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 03-01: Mock Top-Up Flow Summary

**Mock top-up with predefined token bundles ($5-$50) using Convex mutations for simulated balance updates**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-01-17T12:09:39Z
- **Completed:** 2026-01-17T12:13:55Z
- **Tasks:** 5
- **Files modified:** 8

## Accomplishments

- Complete mock top-up flow from bundle selection to balance update
- Real-time balance updates via Convex subscriptions
- Transaction signature display on success screen
- TopUpBundle reusable component with proper state management
- Navigation integration between dashboard and top-up pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create top-up bundle selection page** - `32f765b7` (feat)
2. **Task 2: Create TopUpBundle component** - `1e4b05d5` (feat)
3. **Task 3: Create Convex top-up mutations** - `c97547c0` (feat)
4. **Task 4: Integrate top-up flow with UI** - `1bfd8f28` (feat)
5. **Task 5: Add top-up navigation link to dashboard** - `de700b5e` (feat)

**Bug fix:** `8b9926dd` (fix)

## Files Created/Modified

### Created

- `pwa/app/topup/page.tsx` - Top-up bundle selection page with authentication check, 4 bundle options, success/error states
- `pwa/app/components/TopUpBundle.tsx` - Reusable bundle card component with loading spinner and success state
- `pwa/convex/topups.ts` - Convex mutation for recording top-up transactions (stub for future use)
- `pwa/convex/_generated/api.d.ts` - TypeScript definitions including topups module

### Modified

- `pwa/convex/wallets.ts` - Added mockTopUp mutation with 2-second delay, mock signature generation, balance update logic
- `pwa/convex/_generated/api.js` - Updated stub API to include mockTopUp and recordTopUp string identifiers
- `pwa/app/dashboard/page.tsx` - Added "Top Up" button with Plus icon linking to /topup route
- `pwa/app/scan/page.tsx` - Fixed router.push TypeScript error (unrelated bug fix)

## Decisions Made

- **2-second mock delay**: Simulates network request time for realistic UX
- **Mock signature format**: `mock_${timestamp}_${random}` provides unique transaction IDs
- **Separate success screen**: Dedicated view with transaction signature and "View Dashboard" button
- **Bundle state management**: TopUpBundle component maintains its own loading/purchased state for clean separation of concerns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed router.push TypeScript error in scan page**

- **Found during:** Build verification after Task 5
- **Issue:** Existing scan page used old Next.js router API (`router.push({ pathname, query })`) which is invalid in Next.js 16 with `next/navigation`
- **Fix:** Changed to URL string syntax with URLSearchParams: `router.push(\`/confirm-payment?\${params.toString()}\`)`
- **Files modified:** `pwa/app/scan/page.tsx`
- **Verification:** Build completed successfully, no TypeScript errors
- **Committed in:** `8b9926dd`

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Bug fix was necessary for build to pass. No scope creep. Scan page fix was unrelated to top-up work but blocked verification.

## Issues Encountered

- **Build blocked by unrelated TypeScript error**: The scan page had an invalid router.push call that prevented build completion. Fixed by updating to Next.js 16 URL string syntax.

## User Setup Required

None - no external service configuration required. This is a mock flow using Convex mutations only.

## Next Phase Readiness

### Ready for Next Phase

- Mock top-up flow fully functional with real-time balance updates
- TopUpBundle component can be reused for actual Stripe integration in future
- Convex mutation patterns established for payment operations
- Navigation flow between dashboard and top-up working

### Blockers/Concerns

- **None**: Top-up flow is complete and functional
- **Future work**: Real Stripe integration will replace mock mutations (not in scope for this POC)

### Verification

Build succeeds at:
```bash
cd pwa && npm run build
```

Test flow:
1. Navigate to `/dashboard`
2. Click "Top Up" button
3. Select a bundle (e.g., 50 EVT for $5)
4. Wait 2 seconds for mock processing
5. See success screen with transaction signature
6. Click "View Dashboard" to see updated balance

---
*Phase: 03-topup-payments*
*Plan: 01*
*Completed: 2026-01-17*
