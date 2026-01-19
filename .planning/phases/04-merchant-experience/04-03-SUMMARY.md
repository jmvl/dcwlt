---
phase: 04-merchant-experience
plan: 03
subsystem: ui
tags: [react, next.js, qrcode, solana-pay, merchant-portal]

# Dependency graph
requires:
  - phase: 04-02
    provides: Merchant inventory view with item rows
  - phase: 02-auth-wallet-core-ui
    provides: TOKEN_MINT_ADDRESS constant
provides:
  - QRCodeGenerator modal component with Solana Pay URL generation
  - QR code generation using qrcode library on HTML5 canvas
  - Download and print functionality for QR codes
affects: []

# Tech tracking
tech-stack:
  added: [qrcode@1.5.4, @types/qrcode@1.5.6]
  patterns: [modal-dialog, solana-pay-urls, canvas-rendering]

key-files:
  created: pwa/app/components/QRCodeGenerator.tsx
  modified: pwa/app/components/MerchantInventory.tsx, pwa/package.json

key-decisions:
  - "Use qrcode library for client-side QR code generation on HTML5 canvas"
  - "Solana Pay URL format: solana:address?amount=X&spl-token=Y&reference=Z"
  - "TOKEN_MINT_ADDRESS defined inline in component (same as useSolanaBalance hook)"
  - "Download PNG converts canvas to blob and creates download link"
  - "Print button opens browser print dialog with @media print CSS"

patterns-established:
  - "Pattern: Modal dialog with backdrop overlay and centered content"
  - "Pattern: Shadcn-style close button (X) in top-right corner"
  - "Pattern: Loading state with spinner during async QR generation"
  - "Pattern: Error state with user-friendly message"

# Metrics
duration: 8min
completed: 2026-01-19
---

# Phase 4 Plan 3: QR Code Generation Summary

**QR code generation functionality for merchants to accept Solana Pay payments**

## Performance

- **Duration:** 8min (481s)
- **Started:** 2026-01-19T06:04:37Z
- **Completed:** 2026-01-19T06:12:38Z
- **Tasks:** 3 completed
- **Files modified:** 1 created, 2 modified

## Accomplishments

- Installed qrcode library (@types/qrcode for TypeScript support)
- Created QRCodeGenerator modal component with Solana Pay URL generation
- Generated QR codes on HTML5 canvas using qrcode.toCanvas()
- Displayed item name, price, and QR code prominently in modal
- Added Download PNG button to save QR code as image file
- Added Print button for printing QR codes
- Integrated QR generator into MerchantInventory component with "Generate QR" button on each item row
- Passed effective price (with merchant overrides) to QR modal
- Used merchant wallet address from MerchantAuthProvider
- Handled loading and error states for QR generation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install QR code generation library** - `41c4f52f` (feat)
   - Install qrcode@1.5.4 and @types/qrcode@1.5.6

2. **Task 2: Create QR code generator component** - `6ae20a72` (feat)
   - Create QRCodeGenerator modal with Solana Pay URL generation
   - Generate QR codes using qrcode library on HTML5 canvas
   - Display item name, price, and QR code prominently
   - Add Download PNG button to save QR code as image
   - Add Print button for printing QR codes

3. **Task 3: Integrate QR generator into inventory view** - `2e82a45e` (feat)
   - Add Generate QR button to each item row in inventory
   - Integrate QRCodeGenerator modal with MerchantInventory component
   - Pass effective price (with merchant overrides) to QR modal
   - Use merchant wallet address from MerchantAuthProvider

**Plan metadata:** (will be in final docs commit)

## Files Created/Modified

- `pwa/app/components/QRCodeGenerator.tsx` - QR code generator modal component with Solana Pay URL generation, download, and print functionality
- `pwa/app/components/MerchantInventory.tsx` - Added Generate QR button to item rows, integrated QRCodeGenerator modal with merchant data
- `pwa/package.json` - Added qrcode and @types/qrcode dependencies

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Key Technical Details

### Solana Pay URL Format
```
solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}&reference=${itemId}
```

- **merchantAddress**: Merchant's Solana wallet address from MerchantAuthProvider
- **amount**: Item price in EVT tokens (supports decimals)
- **spl-token**: Event Token mint address on Solana Devnet (4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq)
- **reference**: Item ID for tracking/reconciliation

### QR Code Generation
- Uses `qrcode.toCanvas()` to render QR code on HTML5 canvas
- Canvas size: 256px for good scan quality
- Error correction level: Default (medium)
- Colors: Black on white for maximum compatibility

### Download PNG
- Converts canvas to blob using `canvas.toBlob()`
- Creates download link with filename: `qr-${item-name}-${price}.png`
- Triggers programmatic click to download
- Revokes object URL to prevent memory leaks

### Print Functionality
- Opens browser print dialog with `window.print()`
- Uses `@media print` CSS to hide non-QR elements
- Shows only QR code when printing

## Next Phase Readiness

- QR code generation complete and ready for use
- Merchants can now generate printable QR codes for each inventory item
- QR codes contain correct merchant address, price, and token mint
- Customers can scan QR codes with Solana Pay-compatible wallets to pay
- All verification criteria met:
  - [x] TypeScript compiles without errors
  - [x] QR code library installed and imports correctly
  - [x] QRCodeGenerator modal renders when isOpen is true
  - [x] Solana Pay URL format is correct
  - [x] QR code generates on canvas element
  - [x] Download PNG button saves image file
  - [x] Print button opens browser print dialog
  - [x] Modal displays item name and price correctly
  - [x] "Generate QR" button in inventory opens modal
  - [x] Each item generates unique QR code with correct price
  - [x] Modal closes on close button, backdrop click, or Escape key
  - [x] Loading state shows during QR generation
  - [x] Error state handles QR generation failures
- Ready for next phase or production testing

---
*Phase: 04-merchant-experience*
*Plan: 04-03*
*Completed: 2026-01-19*
