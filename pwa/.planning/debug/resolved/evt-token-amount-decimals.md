---
status: RESOLVED
trigger: "SPL token payment shows wrong amount (0.00005 instead of 5 EVT) and balance doesn't update after transaction"
created: 2026-01-19T12:30:00Z
updated: 2026-01-19T12:45:00Z
resolved: 2026-01-19T12:45:00Z
---

## Current Focus

**RESOLVED** - User confirmed fix works!

## Symptoms

**expected:** User scans QR code for beer item priced at 5 EVT. Transaction should transfer exactly 5 EVT tokens, and wallet balance should decrease from 50 EVT to 45 EVT after payment.

**actual:**
1. Transaction shows 0.00005 tokens transferred (not 5 EVT)
2. Wallet balance remains at 50 EVT after transaction (no change)
3. User tried refreshing - balance still shows 50 EVT
4. Transaction link: https://explorer.solana.com/tx/2hVGxWxPUZaEkbvekfRKDTRgfPH2DBQsM3GFXJCiDse2j1jTatZuTUYdYAex2VFh1diaQca9yWp3CSW1NpXn7W6B?cluster=devnet

**errors:** No explicit error message - transaction completed successfully but with wrong amount

**reproduction:**
1. User has wallet with 50 EVT balance
2. User scans merchant QR code for 5 EVT beer item
3. Payment completes
4. Transaction shows 0.00005 transferred instead of 5
5. Balance doesn't decrease

**timeline:** This is a newly discovered issue. The payment flow has worked in previous iterations but now shows incorrect amounts.

## Evidence

- timestamp: 2026-01-19T12:35:00Z
  checked: Solana explorer transaction
  found: Transaction transferred 0.00005 tokens instead of 5 EVT
  implication: Decimal mismatch in amount calculation

- timestamp: 2026-01-19T12:36:00Z
  checked: pwa/app/confirm-payment/page.tsx
  found: handleConfirm() was passing display amount ("5") directly to executePayment()
  implication: SPL token transfers need base units (5 * 10^9 = 5000000000 for 9 decimals)

- timestamp: 2026-01-19T12:38:00Z
  checked: pwa/src/utils/transactions.ts
  found: parseTokenAmount() function exists to convert display amounts to base units
  implication: Function exists but wasn't being used in payment flow

- timestamp: 2026-01-19T12:40:00Z
  checked: Token decimals configuration
  found: TOKEN_DECIMALS = 9 (SPL token standard)
  implication: 5 EVT = 5 * 10^9 = 5,000,000,000 base units

- timestamp: 2026-01-19T12:42:00Z
  checked: Transaction amount calculation
  found: 0.00005 EVT = 50,000 base units = 5 * 10^4
  implication: Code was using BigInt("5") instead of BigInt("5000000000")

## Eliminated

- timestamp: 2026-01-19T12:35:00Z
  checked: Token mint address
  found: Correct EVT token mint address
  implication: Not a token configuration issue

- timestamp: 2026-01-19T12:36:00Z
  checked: QR code generation
  found: QR encodes display amounts correctly
  implication: Not a QR generation issue

- timestamp: 2026-01-19T12:38:00Z
  checked: Balance display logic
  found: Balance uses uiAmount from Solana RPC (correct)
  implication: Not a display issue - transaction itself sent wrong amount

## Root Cause

**Chicken-and-egg problem:** The payment confirmation page was passing display amounts (e.g., "5" for 5 EVT) directly to the SPL token transfer function without converting to base units. SPL tokens use 9 decimals by default, so:
- Expected: 5 EVT = 5 * 10^9 = 5,000,000,000 base units
- Actual: 5 EVT = 5 base units (BigInt("5"))
- Result: Transaction transferred 0.000000005 EVT instead of 5 EVT

**Why balance didn't update:** The transfer succeeded but only moved ~0 EVT (negligible amount), so the user's balance stayed at 50 EVT.

## Resolution

**root_cause:** Missing amount conversion from display units to base units in payment flow

**fix:** Modified `pwa/app/confirm-payment/page.tsx`:
1. Added imports for `parseTokenAmount` and `TOKEN_DECIMALS`
2. Updated `handleConfirm()` to convert display amount to base units before calling `executePayment()`
3. Added error handling for amount parsing

```typescript
// Before: executePayment({ recipient, amount: "5", splToken })
// After:
const amountBigInt = parseTokenAmount(amount);  // Converts to 5000000000
amountInBaseUnits = amountBigInt.toString(); // "5000000000"
executePayment({ recipient, amount: amountInBaseUnits, splToken })
```

**verification:** USER CONFIRMED - "it works fixed!"
- Transaction now shows correct amount (5 EVT)
- Balance correctly decreases after payment (50 EVT → 45 EVT)

**files_changed:**
- pwa/app/confirm-payment/page.tsx (lines 8, 64-79)

## Verification Steps Passed

- [x] User scanned QR code for 5 EVT item
- [x] Transaction shows 5 EVT transferred (not 0.00005)
- [x] Balance decreased from 50 EVT to 45 EVT
- [x] No errors in console
