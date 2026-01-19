---
phase: 04-merchant-experience
plan: 04
subsystem: merchant
tags: [convex, transactions, sales-history, nextjs, typescript]

# Dependency graph
requires:
  - phase: 04-merchant-experience
    plan: 04-01
    provides: MerchantAuthProvider, merchant portal layout, design patterns
  - phase: 03.5-merchant-management
    provides: Merchants table, groupItems table, merchant-event assignments
provides:
  - Transactions table in Convex schema with merchantId, itemId, customerWallet, amount, timestamp, signature, status
  - Transaction queries for sales history and statistics (listMerchantTransactions, getMerchantSalesStats)
  - Transaction mutations for recording payments (createTransaction, updateTransactionStatus)
  - Sales history page at /merchant/sales with summary cards and filterable transaction list
  - Seed function for mock transaction data testing
affects: [04-02, future payment phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Transactions table structure: merchantId, itemId, customerWallet, amount, timestamp, signature, status
    - Sales stats query pattern: filter by date range, calculate totals/counts/averages
    - Transaction list query pattern: date filtering, wallet search, join with items table
    - Summary cards UI pattern: 4-card grid with icons, values, and descriptions
    - Date range filter buttons: pill-shaped with active state highlighting
    - Debounced search input: 300ms delay for wallet address filtering
    - Relative time formatting: "2h ago", "Yesterday", "5d ago"
    - Status badge colors: green (confirmed), yellow (pending), red (failed)

key-files:
  created:
    - pwa/convex/transactions.ts
    - pwa/app/merchant/sales/page.tsx
    - pwa/convex/seedTransactions.ts
  modified:
    - pwa/convex/schema.ts

key-decisions:
  - "Status field uses union type with literal values for type safety (pending, confirmed, failed)"
  - "Timestamp stored as Unix milliseconds for easy date range filtering and relative time calculation"
  - "Amount stored as number in EVT tokens (not smallest unit) for merchant-friendly display"
  - "Signature optional in transactions table - pending transactions have no signature until confirmed"
  - "byMerchantByTime index supports efficient date range queries without table scans"
  - "Sales stats only count confirmed transactions - pending and failed excluded"
  - "Relative time formatting for better UX - '2h ago' more readable than timestamp"
  - "Date range filter affects both summary stats and transaction list for consistency"
  - "Search debounce prevents excessive queries while typing wallet addresses"
  - "Mock transaction seeding enables UI testing before real payment flow implemented"

patterns-established:
  - "Transactions table structure: merchantId, itemId, customerWallet, amount, timestamp, signature, status"
  - "Transaction query pattern: filter by merchantId, apply date range, apply wallet search, join with items, sort descending"
  - "Sales stats calculation: filter confirmed transactions, sum amounts, count transactions, calculate average"
  - "Summary cards UI: grid layout with icons, large values, descriptions, following admin dashboard pattern"
  - "Date range filtering: pill buttons with active state, today/week/month/all time options"
  - "Transaction list table: time, item, amount (red for customer perspective), customer wallet, status badge, explorer link"
  - "Empty state: centered icon + message explaining when data will appear"

# Metrics
duration: 15min
completed: 2026-01-19
---

# Phase 4: Plan 4 - Sales History and Transaction List Summary

**Sales history and transaction tracking foundation with Convex transactions table, queries for statistics and filtering, merchant sales page with summary cards and searchable transaction list, and mock data seeding for testing**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-19T05:50:00Z
- **Completed:** 2026-01-19T06:04:52Z
- **Tasks:** 4 tasks completed
- **Files modified:** 4 files

## Accomplishments

- Created transactions table in Convex schema with proper indexes for efficient querying
- Implemented transaction queries (listMerchantTransactions, getMerchantSalesStats) with date range and wallet filtering
- Implemented transaction mutations (createTransaction, updateTransactionStatus) for payment recording
- Built merchant sales history page at /merchant/sales with summary cards showing total sales, transaction count, average, and today's sales
- Added date range filter buttons (Today, Week, Month, All Time) with active state styling
- Added search input for customer wallet address with 300ms debounce
- Created transaction list/table displaying timestamp, item name, amount, customer wallet, status badge, and Solana Explorer link
- Implemented relative time formatting ("2h ago", "Yesterday", "5d ago")
- Created seed function for generating 10-20 mock transactions with varied timestamps and statuses
- Followed admin dashboard design pattern for consistent UI/UX

## Task Commits

Each task was committed atomically:

1. **Task 1: Create transactions table in Convex schema** - `dbb2627e` (feat)
2. **Task 2: Create transaction queries and mutations** - `f73cd981` (feat)
3. **Task 3: Create sales history page** - `881a4e25` (feat)
4. **Task 4: Create seed function for mock data** - `be79e253` (feat)
5. **Fix JSX syntax error** - `ff30ecdd` (fix)

## Files Created/Modified

**Created:**
- `pwa/convex/transactions.ts` - Transaction queries (listMerchantTransactions, getMerchantSalesStats) and mutations (createTransaction, updateTransactionStatus)
- `pwa/app/merchant/sales/page.tsx` - Sales history page with summary cards, date filters, search, and transaction list
- `pwa/convex/seedTransactions.ts` - Seed function for generating mock transaction data

**Modified:**
- `pwa/convex/schema.ts` - Added transactions table with indexes (byMerchant, byMerchantByTime)

## Decisions Made

1. **Union type for transaction status**
   - Used `v.union(v.literal("pending"), v.literal("confirmed"), v.literal("failed"))` for type safety
   - **Rationale:** Prevents invalid status values, enables TypeScript exhaustiveness checking

2. **Timestamp as Unix milliseconds**
   - Stored timestamp as number (milliseconds since epoch)
   - **Rationale:** Easy date range filtering (today, week, month), simple relative time calculation

3. **Amount in EVT tokens (not smallest unit)**
   - Stored amount as number representing EVT tokens
   - **Rationale:** Merchant-friendly display without decimal conversion, matches Phase 3.5 inventory pattern

4. **Optional signature field**
   - Made signature optional for pending transactions
   - **Rationale:** Pending transactions have no Solana signature until confirmed, enables status tracking

5. **Composite index for date range queries**
   - Created `byMerchantByTime` index on (merchantId, timestamp)
   - **Rationale:** Efficient date range filtering without full table scans, supports time-sorted queries

6. **Confirmed-only stats calculations**
   - Sales stats only include confirmed transactions
   - **Rationale:** Pending and failed transactions don't represent actual revenue, prevents misleading metrics

7. **Relative time formatting**
   - Display timestamps as "2h ago", "Yesterday", "5d ago"
   - **Rationale:** More readable than absolute timestamps, matches user expectations for recent activity

8. **Debounced search input**
   - 300ms debounce delay on wallet address search
   - **Rationale:** Prevents excessive Convex queries while typing, improves performance

9. **Mock data seeding for testing**
   - Created seed function generating 10-20 transactions with varied data
   - **Rationale:** Enables UI testing before real payment flow is implemented in Phase 3

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed JSX syntax error in sales page conditional rendering**

- **Found during:** Task 3 (Sales history page creation)
- **Issue:** Used `if/return` statements inside JSX instead of ternary expressions, causing syntax error
- **Fix:** Converted `if (transactions === undefined) { return ... }` to `{transactions === undefined ? ... : transactions.length === 0 ? ... : ...}`
- **Files modified:** pwa/app/merchant/sales/page.tsx
- **Verification:** Page compiles without errors, conditional rendering works correctly
- **Committed in:** ff30ecdd (Task 3 fix commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix necessary for code to compile and run. No scope creep.

## Issues Encountered

**JSX syntax error in conditional rendering**
- Initial implementation used `if/return` statements inside JSX which is invalid syntax
- Fixed by converting to proper ternary conditional expressions
- No impact on functionality - pure syntax correction

## User Setup Required

None - no external service configuration required for this plan.

**Note:** Real transaction recording will require Phase 3 (payments) completion. The seed function provides mock data for testing in the meantime.

## Next Phase Readiness

**Ready:**
- Transactions table schema complete with all required fields and indexes
- Transaction queries functional with date range and wallet filtering
- Sales history page working with summary cards, filters, and transaction list
- Seed function available for generating mock test data
- Convex schema synced successfully
- Build passes without errors

**Blockers:**
- Real transaction recording requires Phase 3 (payments) completion
- Mock signatures are placeholders - real Solana signatures will come from payment flow

**Next steps:**
- Plan 04-02: Merchant inventory management (if exists)
- Or: Phase 4 complete, ready for Phase 5 (next phase)

**Note:** This plan creates the schema and UI foundation with mock data. Real transaction recording requires Phase 3 (payments) completion.

---
*Phase: 04-merchant-experience*
*Completed: 2026-01-19*
