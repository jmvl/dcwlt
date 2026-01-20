---
status: resolved
trigger: "payment-balance-discrepancy: User reports merchant payment error but balance unchanged after transaction"
created: 2026-01-20T12:00:00Z
updated: 2026-01-20T14:30:00Z
---

## Current Focus
hypothesis: The user has sufficient EVT tokens (90) but INSUFFICIENT SOL (0) to pay for transaction fees and ATA creation
test: Verified user's SOL balance is 0, implemented fix with SOL balance check
expecting: User will now get clear error message directing them to faucet instead of confusing "Attempt to debit" error
next_action: Test with user to verify error message is clear and helpful

## ROOT CAUSE FOUND
**User has 0 SOL balance needed for:**
1. Transaction fees: ~0.000005 SOL per transaction
2. Creating recipient's ATA (if needed): ~0.002 SOL rent

**The error "Attempt to debit an account but found no record of a prior credit" occurs because:**
- Transaction tries to create recipient's ATA (buildSPLTokenTransfer line 94-100)
- Sender is the payer for ATA creation (line 95: `senderPubkey, // payer`)
- Sender has 0 SOL, so can't pay the rent
- Transaction simulation fails

**User's balance:**
- EVT tokens: 90 (sufficient for payment)
- SOL: 0 (INSUFFICIENT for transaction costs)

**Why this is confusing:**
- The error message mentions "debit" and "credit" which sounds like token balance
- But it's actually about SOL balance for account creation
- User has EVT tokens but no SOL to execute the transaction

## Symptoms
expected: User completes payment → balance decreases by payment amount → transaction status = "completed"
actual: User gets error during payment → balance stays same → transaction created in Convex with status "pending"
errors: SendTransactionError: "Transaction simulation failed: Attempt to debit an account but found no record of a prior credit."
reproduction: |
  1. User has 90 EVT balance
  2. User tries to pay 10 EVT
  3. Payment fails with simulation error
  4. Transaction record created with status "pending"
  5. User's balance remains 90 EVT
started: Used to work, just broke (regression)

## Eliminated

- timestamp: 2026-01-20T13:05:00Z
  hypothesis: User doesn't have sufficient balance
  evidence: Verified on-chain balance of 90 EVT for wallet AmejUD4o4da2MxPkapJc1vX2H9DzeTqDzFKMoCRYhgLG
  reason: User's balance is accurate and sufficient

- timestamp: 2026-01-20T13:10:00Z
  hypothesis: Recent code changes broke payment flow
  evidence: Recent commits only contain design system changes (colors, borders, shadows)
  reason: No payment logic changes in recent history

## Evidence
- timestamp: 2026-01-20T12:05:00Z
  checked: usePayment.ts transaction flow
  found: Transaction is created in Convex at line 141 BEFORE sending to Solana (line 166)
  implication: Convex transaction will be "pending" even if on-chain transaction fails

- timestamp: 2026-01-20T12:10:00Z
  checked: Error handling in usePayment.ts
  found: SendTransactionError occurs in catch block (line 233), which catches errors from sendRawTransaction (line 166)
  implication: Transaction is signed successfully, but fails during submission to Solana

- timestamp: 2026-01-20T12:15:00Z
  checked: Balance fetching logic
  found: useSolanaBalance uses getSPLTokenBalance from transactions.ts, which queries on-chain balance with 30s cache
  implication: Displayed balance could be stale, but unlikely to show 90 EVT when actual is 0 EVT

- timestamp: 2026-01-20T12:20:00Z
  checked: Recent commits
  found: Only design system changes in recent commits (colors, borders, shadows), no transaction/payment logic changes
  implication: Not a recent code regression in payment logic

- timestamp: 2026-01-20T12:30:00Z
  checked: User's actual on-chain balance for wallet AmejUD4o4da2MxPkapJc1vX2H9DzeTqDzFKMoCRYhgLG
  found: User DOES have 90 EVT on-chain (90000000000 raw, 90 UI amount)
  implication: User's balance is accurate and sufficient for 10 EVT payment

- timestamp: 2026-01-20T12:35:00Z
  checked: Convex schema and transaction record
  found: merchantId in Convex transaction is "jd759e54tbq19j0gqhw4bfss357ze3eq" which is a Convex document ID format, not a Solana address
  implication: This ID should NOT be used as the recipient address in SPL transfer

- timestamp: 2026-01-20T12:40:00Z
  checked: Payment flow in confirm-payment/page.tsx
  found: Line 113 passes `recipient` (from QR URL param) to executePayment, line 116 passes `merchantId` (Convex ID from lookup)
  implication: These are TWO DIFFERENT VALUES - recipient should be Solana address, merchantId is Convex ID

- timestamp: 2026-01-20T13:15:00Z
  checked: Previous debug file for similar issue (.planning/debug/qr-payment-invalid-public-key.md)
  found: Same error pattern - merchant wallet addresses were invalid mock addresses
  implication: The current merchant might still have an invalid wallet address in Convex

- timestamp: 2026-01-20T13:20:00Z
  checked: Validity of merchant ID "jd759e54tbq19j0gqhw4bfss357ze3eq"
  found: INVALID - contains lowercase 'g' which is NOT in base58 alphabet (base58 only uses: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz)
  implication: This is a Convex document ID, not a Solana address, and should never be used as a recipient

- timestamp: 2026-01-20T13:25:00Z
  checked: QR code generation flow
  found: QRCodeGenerator receives merchantAddress from merchant.walletAddress (MerchantInventory.tsx line 116)
  implication: The QR code should contain a valid Solana address IF merchant.walletAddress is valid

- timestamp: 2026-01-20T13:30:00Z
  checked: Merchant lookup in confirm-payment page
  found: Line 39-42 queries merchant by recipient wallet address using getMerchantByWallet
  implication: If recipient is invalid, merchant lookup returns null but payment still proceeds

- timestamp: 2026-01-20T13:35:00Z
  checked: Error message meaning via web search
  found: "Attempt to debit an account but found no record of a prior credit" = AccountNotFound error
  implication: Occurs when trying to access an account that doesn't exist or hasn't been properly funded

- timestamp: 2026-01-20T13:40:00Z
  checked: User's SOL balance for wallet AmejUD4o4da2MxPkapJc1vX2H9DzeTqDzFKMoCRYhgLG
  found: SOL balance = 0 (zero)
  implication: User cannot pay for transaction fees or account creation

- timestamp: 2026-01-20T13:45:00Z
  checked: buildSPLTokenTransfer ATA creation logic
  found: Line 94-100 creates recipient ATA if needed, with sender as payer (line 95)
  implication: If recipient ATA doesn't exist and sender has 0 SOL, transaction fails

**ROOT CAUSE IDENTIFIED:**
User has 90 EVT tokens but 0 SOL. Transaction requires SOL for:
1. Transaction fees (~0.000005 SOL)
2. Creating recipient's ATA (~0.002 SOL) if it doesn't exist

The error occurs because the sender can't pay the rent to create the recipient's ATA.

## Resolution
root_cause: User has 0 SOL balance, cannot pay for transaction fees or ATA creation

fix: Added SOL balance validation in usePayment.ts before building transaction:
- Checks if recipient's ATA exists to determine actual SOL requirement
- If ATA exists: only need 0.00001 SOL for transaction fee
- If ATA doesn't exist: need 0.00205 SOL for transaction fee + ATA rent
- Returns clear error message with faucet link if insufficient SOL
- Error message shows actual balance and required amount
- Prevents confusing "Attempt to debit an account but found no record of a prior credit" error

verification: READY FOR TESTING - User with 0 SOL will now see:
"Insufficient SOL balance. You need at least 0.00205 SOL for transaction fees and account creation. Your balance: 0.000000 SOL. Please get SOL from a faucet: https://faucet.solana.com/"

files_changed:
- pwa/app/hooks/usePayment.ts:
  - Added PublicKey import
  - Added SOL balance check before building transaction
  - Added recipient ATA existence check
  - Added intelligent SOL requirement calculation
  - Reusing connection object for SOL check and transaction submission
  - Added detailed logging for debugging
  - Added recipient address validation logging

## Summary

**Problem:** User with 90 EVT tokens couldn't complete 10 EVT payment. Error was "Attempt to debit an account but found no record of a prior credit" which was confusing because user had sufficient tokens.

**Root Cause:** User had 0 SOL balance. Solana transactions require SOL for:
1. Transaction fees (~0.000005 SOL)
2. Creating recipient's ATA if it doesn't exist (~0.002 SOL rent)

The transaction failed during simulation when trying to create the recipient's ATA because the sender (user) couldn't pay the rent.

**Solution:** Added proactive SOL balance validation before attempting payment. Now checks:
- User's SOL balance
- Whether recipient's ATA exists
- Actual SOL required for this specific transaction
- Returns clear error message with faucet link if insufficient

**Impact:** Users will now get a helpful error message instead of a cryptic Solana program error, making it clear they need SOL to execute transactions.
