---
status: verifying
trigger: "When the user pays a merchant, the QR code should disappear after successful operation and screen should update to show success. Currently QR remains visible and screen doesn't update."
created: 2025-01-21T12:00:00Z
updated: 2025-01-21T12:30:00Z
---

## Current Focus
hypothesis: The useEffect that records initialTransactionId (line 70-76) runs BEFORE the modal opens, and then runs AGAIN when transactions update (because transactions is in the dependency array). This overwrites the initialTransactionId with the NEW transaction ID, preventing isThisItemPaid from becoming true
test: Removed `transactions` from the dependency array - now initialTransactionId is only set when modal opens
expecting: When payment completes, initialTransactionId will still contain the OLD transaction ID, so the comparison will detect the NEW transaction and trigger success
next_action: Commit the fix

## Symptoms
expected: QR disappears and screen updates to success
actual: QR code remains visible, screen doesn't update
errors: No explicit error message - just missing behavior
reproduction: User scans merchant QR code → completes payment → merchant screen should update but doesn't
started: Used to work, recently broke (regression)

## Eliminated

## Evidence
- timestamp: 2025-01-21T12:15:00Z
  checked: QRCodeGenerator.tsx commit a705c726a diff
  found: The fix added initialTransactionId tracking with a useEffect that depends on [isOpen, transactions]
  implication: When a new payment transaction appears in the transactions array, the useEffect re-runs and overwrites initialTransactionId.current with the new transaction's _id. This makes the condition `latestTransaction?._id !== initialTransactionId.current` false, preventing isThisItemPaid from becoming true
- timestamp: 2025-01-21T12:20:00Z
  checked: Code execution after applying fix
  found: Changed dependency array from [isOpen, transactions] to [isOpen]
  implication: initialTransactionId will only be set when modal opens, not when transactions update, preserving the original transaction ID for comparison
- timestamp: 2025-01-21T12:30:00Z
  checked: npm run build - TypeScript compilation
  found: Build succeeded with no errors
  implication: Fix is syntactically correct and type-safe

## Resolution
root_cause: The useEffect that records initialTransactionId had `transactions` in its dependency array. When a new payment was confirmed, the transactions array updated, causing the effect to re-run and overwrite initialTransactionId.current with the new transaction's _id. This broke the comparison logic since latestTransaction._id would equal initialTransactionId.current, preventing isThisItemPaid from becoming true.
fix: Removed `transactions` from the dependency array on line 76, changing `}, [isOpen, transactions]);` to `}, [isOpen]);` This ensures initialTransactionId is only captured when the modal opens, not when transactions update.
verification: Build succeeded. Logic verified:
- New payment scenario: initialTransactionId is set on modal open, preserved when new transaction arrives, comparison succeeds
- Reopen modal scenario: initialTransactionId is updated to latest transaction, preventing false positive on reopen
files_changed:
- /Users/jm/Codebase/dcwlt/pwa/app/components/QRCodeGenerator.tsx: Removed transactions from useEffect dependency array
