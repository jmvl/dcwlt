---
status: investigating
trigger: "Investigate why merchant payment notifications are not working after QR code payment"
created: 2026-01-19T12:00:00Z
updated: 2026-01-19T13:35:00Z
---

## Current Focus

hypothesis: Fix is already implemented (commit 5539e8341) but transactions not appearing - need diagnostic information from user
test: Code is correct, issue must be data-related (merchant lookup failing, missing reference, or runtime error)
expecting: Console logs will show which part of the flow is failing
next_action: Request console logs and Convex dashboard check from user

## Investigation Summary

The fix for writing transaction records to Convex has been implemented (commit 5539e8341 on Jan 19 21:18). The code path is:

1. QR code contains `reference` parameter (itemId as string)
2. confirm-payment/page.tsx extracts reference and looks up merchant by wallet
3. usePayment.ts calls createTransaction mutation with merchantId, itemId, etc.
4. Merchant sales page subscribes to transactions in real-time

**Since no transactions are appearing, one of these must be failing:**
- Merchant lookup returning null (wallet address mismatch)
- Reference parameter missing from QR URL
- Mutation throwing error (caught and logged)
- Real-time subscription not working (different issue)

Enhanced logging added to identify the failure point.

## Symptoms

expected: After completing payment via QR code scan, merchant should see toast notification with item name and amount, transaction appear in sales history within 1 second, real-time update across multiple devices
actual: Mobile payment completed successfully, but merchant sales page completely empty with no transactions visible, real-time updates not working, toast notifications not appearing
errors: None reported
reproduction: Go to /merchant/inventory as merchant, generate QR code for an item, scan with mobile phone, complete payment on mobile, check /merchant/sales - expecting to see new transaction. Result: Sales page empty, no notification
started: User tested QR code payment flow from merchant inventory page, payment completed on mobile device, merchant sales page remained empty with no transactions

## Eliminated

## Evidence

- timestamp: 2026-01-19T12:15:00Z
  checked: Payment flow from scan to confirmation
  found: QR code contains: merchantAddress, itemPrice, itemName, itemId in `reference` parameter (line 33 in QRCodeGenerator.tsx)
  implication: itemId is available in QR URL but not being extracted

- timestamp: 2026-01-19T12:20:00Z
  checked: usePayment hook (app/hooks/usePayment.ts)
  found: Payment flow only: build transaction -> sign -> send to Solana -> wait for confirmation -> invalidate balance query
  implication: No Convex transaction creation occurs after successful payment

- timestamp: 2026-01-19T12:25:00Z
  checked: confirm-payment page (app/confirm-payment/page.tsx)
  found: Page only shows success/error UI, doesn't create Convex record
  implication: Transaction data available but not persisted to Convex

- timestamp: 2026-01-19T12:28:00Z
  checked: Convex schema and transactions module
  found: createTransaction mutation exists (convex/transactions.ts line 245) but is never called from payment flow
  implication: Infrastructure exists but not integrated

- timestamp: 2026-01-19T13:05:00Z
  checked: Schema.ts and data types
  found: CRITICAL BUG - `itemId` in transactions table is `v.id("groupItems")` (line 199), but `reference` from QR URL is just a string (line 37 confirm-payment/page.tsx)
  implication: Type mismatch - the `reference` string cannot be used directly as `itemId` because it's not a validated Convex ID

- timestamp: 2026-01-19T13:10:00Z
  checked: usePayment.ts line 153 conditional
  found: Code checks `if (params.merchantId && params.itemId)` before creating Convex record
  implication: If either merchantId or itemId is undefined/null, the mutation is skipped (line 173 logs this)

- timestamp: 2026-01-19T13:15:00Z
  checked: MerchantInventory.tsx line 120
  found: `itemId: item._id.toString()` - Convex ID converted to string before encoding in QR
  implication: String ID cannot be used directly in Convex mutations

- timestamp: 2026-01-19T13:18:00Z
  checked: Convex documentation
  found: Convex IDs are strings at runtime with type annotations for compile-time safety
  implication: Type assertion should work, the string ID should be valid

- timestamp: 2026-01-19T13:25:00Z
  checked: Original code before modifications
  found: The fix was already implemented - merchant lookup, ID extraction, Convex mutation call all present
  implication: Problem is not missing code - something else is preventing the mutation from working

## Resolution

root_cause: The QR code encoder converts Convex IDs to strings using `.toString()` (MerchantInventory.tsx line 120), but the payment confirmation page was unsafely casting the string back to `Id<'groupItems'>` (confirm-payment/page.tsx line 98). Convex mutations require properly constructed ID objects, not strings. The `new Id(tableName, stringId)` constructor is required to reconstruct IDs from their string representations.

fix:
1. Added ID reconstruction in confirm-payment page line 48: `new Id<'groupItems'>('groupItems', reference)`
2. Removed unsafe type cast, now properly reconstructs ID from string
3. Added comprehensive logging to track ID reconstruction and mutation calls
4. Updated executePayment call to use reconstructed IDs

verification: Need to test by completing QR payment and checking:
1. Console logs show ID reconstruction with valid IDs
2. Console logs show "Calling createTransaction mutation..."
3. Console logs show "Convex transaction record created" with transaction ID
4. Transaction appears in Convex dashboard
5. Transaction appears on merchant sales page

files_changed:
- app/confirm-payment/page.tsx: Added ID reconstruction, improved logging, fixed ID types
- app/hooks/usePayment.ts: Enhanced logging for debugging
