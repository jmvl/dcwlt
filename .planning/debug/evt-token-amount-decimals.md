---
status: verifying
trigger: "SPL token payment shows wrong amount (0.00005 instead of 5 EVT) and balance doesn't update after transaction"
created: 2026-01-19T00:00:00Z
updated: 2026-01-19T00:00:00Z
---

## Current Focus

hypothesis: FIX APPLIED - Amount conversion added to payment flow
test: Need user to test with actual QR code scan to verify:
1. Transaction shows correct amount (5 EVT not 0.00005)
2. Balance decreases correctly after payment
expecting: Payment transfers 5 EVT and balance updates from 50 to 45 EVT
next_action: Wait for user verification

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: User scans QR code for beer item priced at 5 EVT. Transaction should transfer exactly 5 EVT tokens, and wallet balance should decrease from 50 EVT to 45 EVT after payment.

actual:
1. Transaction shows 0.00005 tokens transferred (not 5 EVT)
2. Wallet balance remains at 50 EVT after transaction (no change)
3. User tried refreshing - balance still shows 50 EVT
4. Transaction link: https://explorer.solana.com/tx/2hVGxWxPUZaEkbvekfRKDTRgfPH2DBQsM3GFXJCiDse2j1jTatZuTUYdYAex2VFh1diaQca9yWp3CSW1NpXn7W6B?cluster=devnet

errors: No explicit error message - transaction completed successfully but with wrong amount

reproduction:
1. User has wallet with 50 EVT balance
2. User scans merchant QR code for 5 EVT beer item
3. Payment completes
4. Transaction shows 0.00005 transferred instead of 5
5. Balance doesn't decrease

timeline: This is a newly discovered issue. The payment flow has worked in previous iterations but now shows incorrect amounts.

token_info: User doesn't know token decimals. Need to check how EVT token was created and configured.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/app/components/QRCodeGenerator.tsx
  found: Line 32 generates Solana Pay URL with raw amount: `solana:${merchantAddress}?amount=${itemPrice}&spl-token=${TOKEN_MINT_ADDRESS}`
  implication: Amount is encoded as "5" (not converted to base units)

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/app/scan/page.tsx
  found: Lines 19-28 parse QR URL and pass amount directly to confirm page without conversion
  implication: Amount "5" is passed through unchanged

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/app/confirm-payment/page.tsx
  found: Lines 64-68 execute payment with raw amount from URL params (no conversion)
  implication: Amount "5" goes directly to transaction builder

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/app/hooks/usePayment.ts
  found: Lines 82-85 pass amount directly to buildSPLTokenTransfer without conversion
  implication: Amount "5" reaches transaction builder as string

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/src/utils/transactions.ts
  found: Line 24 defines TOKEN_DECIMALS = 9, Line 84 converts amount string directly to BigInt: `const amountBigInt = BigInt(amount)`
  implication: "5" becomes BigInt(5) = 5 base units, should be 5 * 10^9 = 5000000000

- timestamp: 2026-01-19T00:00:00Z
  checked: pwa/src/utils/transactions.ts
  found: Lines 143-147 have parseTokenAmount function that correctly converts display amount to base units, but it's NOT being used in payment flow
  implication: Helper function exists but is not being called

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: Payment flow passed display amount (e.g., "5") directly to SPL token transfer without converting to base units. QR code encodes display amount, but transaction builder expected base units. Result: BigInt(5) instead of BigInt(5000000000), causing 0.000000005 EVT transfers instead of 5 EVT.

fix:
1. Added import of parseTokenAmount and TOKEN_DECIMALS to confirm-payment/page.tsx
2. Modified handleConfirm to convert display amount to base units using parseTokenAmount() before calling executePayment()
3. Updated PaymentConfirmation component to expect display format amounts (not base units)
4. Updated formatAmount() in PaymentConfirmation to handle display format directly

verification: pending - needs testing with actual QR code scan
files_changed:
- pwa/app/confirm-payment/page.tsx (added amount conversion)
- pwa/app/components/PaymentConfirmation.tsx (updated to handle display amounts)
