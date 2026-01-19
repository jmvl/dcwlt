---
status: RESOLVED
trigger: "QR code generator modal shows spinning wheel and never displays QR code"
created: 2026-01-19T10:00:00Z
updated: 2026-01-19T12:50:00Z
resolved: 2026-01-19T12:50:00Z
---

## Current Focus

**RESOLVED** - User confirmed fix works!

## Symptoms

expected: When clicking "Generate QR", a modal should open displaying a QR code for the item
actual: Modal opens with a spinning loader that never disappears; QR code never renders
errors: No visible error messages to user
reproduction: Navigate to merchant inventory page, expand an item group, click "Generate QR" button on any item
started: Unknown when this started

## Evidence

- timestamp: 2026-01-19T10:00:00Z
  checked: QRCodeGenerator.tsx component
  found: The useEffect has a guard clause `if (!isOpen || !canvasRef.current) return;` that exits early without clearing loading state
  implication: If canvasRef.current is null when the effect runs (e.g., during React 18 Strict Mode double-invocation), setIsLoading(true) is set but never cleared to false

- timestamp: 2026-01-19T10:00:00Z
  checked: useEffect dependency array
  found: Dependencies are [isOpen, solanaPayUrl]
  implication: When these change, the effect re-runs, sets loading to true, but if canvas ref isn't ready, it returns early without clearing loading

- timestamp: 2026-01-19T10:00:00Z
  checked: QRCodeGenerator component rendering logic
  found: Canvas element is rendered inside a conditional that checks `!isLoading && !error`
  implication: If loading is stuck at true, canvas is never rendered, creating a chicken-and-egg problem

## Eliminated

## Resolution

root_cause: Chicken-and-egg problem: useEffect requires canvasRef.current to exist before generating QR, but canvas is only rendered when isLoading is false. In React 18 Strict Mode, the effect runs multiple times, and on early runs the canvas ref is null, causing early return without clearing loading state.

fix: Fixed React 18 Strict Mode race condition in QRCodeGenerator component by ensuring loading state is always cleared, even when canvas ref isn't ready.

verification: USER CONFIRMED - QR generator now works correctly

files_changed:
- app/components/QRCodeGenerator.tsx

## Verification Steps Passed

- [x] User can open "Generate QR" modal
- [x] QR code displays correctly (no stuck loading spinner)
- [x] Modal can be closed and reopened successfully
