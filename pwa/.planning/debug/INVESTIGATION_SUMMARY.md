# Merchant Payment Notifications - Investigation Summary

## Status: In Progress

## What Was Fixed

The payment flow has been updated to write transaction records to Convex after successful Solana payments:

### Files Changed
1. **pwa/app/hooks/usePayment.ts** (lines 152-184)
   - Added Convex `createTransaction` mutation call after Solana confirmation
   - Writes merchantId, itemId, customerWallet, amount, and signature to Convex
   - Added extensive logging for debugging

2. **pwa/app/confirm-payment/page.tsx** (lines 39-61)
   - Extracts `itemId` from URL `reference` parameter
   - Looks up merchant by wallet address
   - Passes both IDs to payment execution

## What to Check Next

### 1. Console Logs During Payment

When you complete a payment, open browser console (F12) and look for these log messages:

**Expected Logs:**
```
[ConfirmPayment] Payment parameters: {
  recipient: "...",
  amount: "...",
  reference: "...",
  merchantId: "...",
  itemId: "...",
  merchantFound: true,
  merchantData: {...}
}

[usePayment] Creating Convex transaction record...
[usePayment] IDs: { merchantId: "...", itemId: "...", ... }
[usePayment] Calling createTransaction mutation...
[usePayment] Convex transaction record created: ...
```

**Problem Indicators:**
- `merchantFound: false` - Merchant lookup failed
- `hasMerchantId: false` - No merchant ID passed
- `hasItemId: false` - No item ID in URL
- Error logs after "Calling createTransaction mutation..."

### 2. Convex Dashboard

Check if transactions are being created at all:
1. Open Convex dashboard: `npx convex dashboard`
2. Go to "transactions" table
3. Check if any new records appear after payment

### 3. Common Issues

**Issue: Merchant lookup returns null**
- Cause: Merchant wallet address in QR doesn't match any merchant in Convex
- Fix: Verify merchant exists and wallet address is correct

**Issue: Missing reference parameter**
- Cause: QR code doesn't include itemId
- Fix: Regenerate QR code from merchant inventory page

**Issue: Mutation throws error**
- Cause: Invalid data, permissions issue, or schema violation
- Fix: Check console error message for details

## Next Steps

Please test the payment flow again and share:
1. All console log messages (F12 -> Console tab)
2. Whether any transactions appear in Convex dashboard
3. Exact steps you're taking to reproduce

This will help identify the exact failure point.
