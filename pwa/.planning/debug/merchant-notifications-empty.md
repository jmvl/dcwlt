---
status: fixing
trigger: "Investigate why merchant payment notifications are not working after QR code payment"
created: 2026-01-19T12:00:00Z
updated: 2026-01-19T12:45:00Z
---

## Current Focus

hypothesis: CONFIRMED - Payment flow completes Solana transaction but NEVER writes to Convex transactions table
test: Verified payment flow in usePayment.ts only signs/sends Solana transaction, then invalidates balance query. No Convex mutation called.
expecting: Need to add Convex transaction creation after successful Solana payment
next_action: Test the fix by running the app and completing a QR payment

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

## Resolution

root_cause: Payment flow completes Solana transactions successfully but NEVER writes transaction records to the Convex transactions table. The QR code contains itemId in reference parameter and recipient wallet address, but this data was not being extracted or used to create Convex records. The merchant sales page uses real-time subscriptions to Convex data, so without records being written, nothing displays.

fix:
1. Modified usePayment hook to accept optional merchantId and itemId parameters
2. Added Convex createTransaction mutation call after successful Solana payment
3. Modified confirm-payment page to extract reference (itemId) from URL parameters
4. Added merchant lookup by wallet address in confirm-payment page
5. Pass merchantId and itemId to executePayment function

verification: Need to test by completing a QR code payment and verifying transaction appears on merchant sales page

files_changed:
- app/hooks/usePayment.ts: Added merchantId/itemId params, Convex transaction creation
- app/confirm-payment/page.tsx: Added merchant lookup, reference extraction, pass IDs to payment
