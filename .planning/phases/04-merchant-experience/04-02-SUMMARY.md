---
phase: 04-merchant-experience
plan: 02
subsystem: ui
tags: [react, next.js, convex, accordion, merchant-portal]

# Dependency graph
requires:
  - phase: 03.5-merchant-management
    provides: Item groups schema, merchant assignments queries
  - phase: 04-01
    provides: MerchantAuthProvider, merchant portal layout
provides:
  - Merchant inventory page with event selector UI
  - MerchantInventory component showing item groups with overrides
  - getMerchantItemOverrides query for looking up merchant-specific pricing/stock
affects: [04-03-qr-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: [accordion-ui, merchant-overrides, color-coded-stock-badges]

key-files:
  created: pwa/app/merchant/inventory/page.tsx, pwa/app/components/MerchantInventory.tsx
  modified: pwa/convex/itemGroups.ts

key-decisions:
  - "Auto-select first event when merchant has multiple event assignments"
  - "Accordion expand/collapse managed via Set<string> for O(1) lookups"
  - "Stock color coding: green (>5), yellow (1-5), red (0)"
  - "Unlimited stock displayed as 'Unlimited' when stock is null"

patterns-established:
  - "Pattern: Merchant inventory follows same event selector pattern as admin inventory"
  - "Pattern: Consistent color scheme and card structure across admin/merchant UIs"
  - "Pattern: Empty states use icons and helpful guidance text"

# Metrics
duration: 2min
completed: 2026-01-19
---

# Phase 4 Plan 2: Merchant Inventory View Summary

**Merchant inventory page with event selector and accordion-style item groups showing per-merchant price and stock overrides**

## Performance

- **Duration:** 2min (161s)
- **Started:** 2026-01-19T06:01:56Z
- **Completed:** 2026-01-19T06:04:37Z
- **Tasks:** 3 completed
- **Files modified:** 2 created, 1 modified

## Accomplishments

- Created merchant inventory page at `/merchant/inventory` with event selector for merchants with multiple event assignments
- Built MerchantInventory component with accordion-style expandable item groups
- Added `getMerchantItemOverrides` query to look up merchant-specific pricing and stock overrides
- Implemented item detail view showing name, description, price (with override indicator), and stock (color-coded)
- Empty states for no events assigned and no item groups assigned
- Loading states for all async queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Merchant inventory page with event selector** - `f3fa90fe` (feat)
2. **Tasks 2 & 3: Item groups accordion with merchant overrides** - `e2dc4158` (feat)

**Plan metadata:** (will be in final docs commit)

## Files Created/Modified

- `pwa/app/merchant/inventory/page.tsx` - Merchant inventory page with event selector, loads merchant event assignments and passes selected event to MerchantInventory component
- `pwa/app/components/MerchantInventory.tsx` - Accordion-style item groups component with merchant override logic, displays items with effective price/stock and color-coded stock badges
- `pwa/convex/itemGroups.ts` - Added `getMerchantItemOverrides` query to look up merchant-specific item overrides

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Merchant inventory view complete and ready for use
- Ready for Plan 04-03 (QR Code Generation) which will add "Generate QR" buttons to each item
- All verification criteria met:
  - [x] Merchants can select from their assigned events
  - [x] Event selector appears when multiple events exist
  - [x] Item groups display for selected event
  - [x] Accordion expand/collapse works smoothly
  - [x] Items display with name, description, price, stock
  - [x] Price overrides show correct values (override vs default)
  - [x] Stock overrides show correct values
  - [x] Stock badges have correct colors (green/yellow/red)
  - [x] Override badges appear when merchant has custom pricing
  - [x] Empty states display when no events or groups assigned
  - [x] Loading states handled for all queries

---
*Phase: 04-merchant-experience*
*Completed: 2026-01-19*
