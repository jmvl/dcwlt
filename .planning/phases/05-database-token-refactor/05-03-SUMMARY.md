---
phase: 05-database-token-refactor
plan: 03
subsystem: qr-payment
tags: [qr-code, solana-pay, url-format, simplification]
dependency_graph:
  requires: []
  provides: [simplified-qr-format]
  affects: [merchant-portal, user-scanner]
tech_stack:
  added: []
  patterns: [solana-pay-url, optional-parameters]
key_files:
  created: []
  modified:
    - pwa/app/components/QRCodeGenerator.tsx
    - pwa/src/utils/solanaPay.ts
decisions:
  - QR codes no longer include spl-token parameter for database token system
  - Parser already handles optional spl-token gracefully (returns null)
metrics:
  duration: 2 min
  completed_date: 2026-03-03
---

# Phase 05 Plan 03: Simplify QR Code Format Summary

## One-Liner

Simplified Solana Pay QR code URL format by removing the spl-token parameter, since the database token system no longer requires specific token mint address knowledge.

## What Was Done

### Task 1: Simplify QR Code URL Format in QRCodeGenerator

**File:** `pwa/app/components/QRCodeGenerator.tsx`

- Removed the `TOKEN_MINT_ADDRESS` constant (no longer needed)
- Updated `solanaPayUrl` to use simplified format without spl-token parameter
- New format: `solana:<address>?amount=<price>&reference=<itemId>`

**Before:**
```typescript
const TOKEN_MINT_ADDRESS = '4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq';
const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}`;
```

**After:**
```typescript
// Build Solana Pay URL (simplified format without spl-token for database token system)
const solanaPayUrl = `solana:${merchantAddress}?amount=${itemPrice}&reference=${itemId}`;
```

### Task 2: Document Optional spl-token in Parser

**File:** `pwa/src/utils/solanaPay.ts`

- Updated JSDoc comment to document that spl-token is optional
- Clarified that parser handles missing spl-token gracefully (returns null)
- No code changes needed - parser already handles optional parameters correctly

## Deviations from Plan

None - plan executed exactly as written.

## Verification

1. QRCodeGenerator produces URLs without spl-token - Verified via grep (0 matches for spl-token in URL construction)
2. solanaPay.ts parser handles missing spl-token (returns null) - Verified by reading file, type is `splToken: string | null`
3. Both files compile without errors - Build completed successfully

## Commits

| Commit | Description |
|--------|-------------|
| ca39140ca | feat(05-03): simplify QR code URL format - remove spl-token |
| f7605f201 | docs(05-03): document optional spl-token in solanaPay parser |

## Key Decisions

1. **Simplified URL format** - QR codes now use `solana:<address>?amount=<price>&reference=<itemId>` without spl-token
2. **No parser changes needed** - The existing parser already handles missing spl-token gracefully via `searchParams.get('spl-token')` which returns null

## Self-Check: PASSED

- [x] Created files exist: N/A (no new files)
- [x] Modified files exist: pwa/app/components/QRCodeGenerator.tsx, pwa/src/utils/solanaPay.ts
- [x] Commits exist: ca39140ca, f7605f201
