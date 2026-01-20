---
phase: 03-topup-payments
plan: 03
subsystem: payments
tags: [solana, privy, transaction-signing, spl-tokens, convex]

# Dependency graph
requires:
  - phase: 03-topup-payments
    plan: 02
    provides: QR scanner, Solana Pay URL parser
  - phase: 2-auth-wallet-core-ui
    plan: 01
    provides: Privy auth, embedded Solana wallet
  - phase: 2-auth-wallet-core-ui
    plan: 02
    provides: Convex wallets table
provides:
  - Payment confirmation screen with 3-second safety countdown
  - Solana transaction builder for SPL token transfers
  - Payment signing and submission hook via Privy
  - Transaction recording in Convex with status lifecycle (pending → confirmed/failed)
  - Real-time balance updates after successful payment
affects: [03.5-merchant-management, 04-merchant-experience]

# Tech tracking
tech-stack:
  added: [@solana/web3.js, @solana/spl-token]
  patterns:
    - VersionedTransaction for Solana v1 transactions
    - Privy useSignTransaction hook for embedded wallet signing
    - Transaction lifecycle: Convex PENDING → on-chain → CONFIRMED/FAILED
    - Suspense wrapper for useSearchParams SSR safety
    - Amount conversion: display units (EVT) ↔ base units (lamports)

key-files:
  created:
    - pwa/app/confirm-payment/page.tsx
    - pwa/app/components/PaymentConfirmation.tsx
    - pwa/src/utils/transactions.ts
    - pwa/app/hooks/usePayment.ts
  modified:
    - pwa/convex/transactions.ts (createTransaction, updateTransactionStatus mutations)
    - pwa/package.json (@solana/web3.js, @solana/spl-token)

key-decisions:
  - "Used @solana/web3.js directly instead of @solana/kit for transaction building"
  - "VersionedTransaction (v0) for modern Solana transaction format"
  - "Amount in base units for transfer, display units for UI (9 decimals conversion)"
  - "Convex transaction record created as PENDING before sending to Solana (audit trail)"
  - "ATA created idempotently if recipient token account doesn't exist"
  - "Balance query invalidated after payment to trigger real-time update"

patterns-established:
  - "Pattern: Privy useSignTransaction for embedded wallet signing (not usePrivy().signTransaction)"
  - "Pattern: Suspense wrapper for useSearchParams to avoid SSR hydration issues"
  - "Pattern: Transaction lifecycle with PENDING → CONFIRMED/FAILED status updates"
  - "Pattern: parseTokenAmount() converts display format to base units for SPL transfers"

# Metrics
duration: ~60min (estimated, exact duration not recorded)
completed: 2026-01-19
---

# Phase 03-03: Payment Signing and Transaction Submission Summary

**Complete Solana Pay flow with Privy wallet signing, on-chain transaction submission, and Convex transaction recording**

## Performance

- **Duration:** ~60 min (estimated from file modification timestamps)
- **Started:** 2026-01-19
- **Completed:** 2026-01-19
- **Files modified:** 4 created, 2 modified

## Accomplishments

- Full payment execution flow from QR scan to on-chain confirmation
- Payment confirmation screen with 3-second safety countdown
- SPL token transaction builder with ATA creation
- Privy embedded wallet signing integration
- Transaction submission to Solana Devnet with confirmation
- Convex transaction recording with pending → confirmed lifecycle
- Real-time balance updates via query invalidation
- Success/error screens with explorer links

## Task Commits

Implementation was completed but atomic commits were not documented.

## Files Created/Modified

### Created

- `pwa/app/confirm-payment/page.tsx` - Payment confirmation page with URL parameter parsing, success/error states, explorer links
- `pwa/app/components/PaymentConfirmation.tsx` - Payment details UI with 3-second countdown timer, merchant info display
- `pwa/src/utils/transactions.ts` - Solana transaction builder, SPL token transfer instructions, amount conversion utilities
- `pwa/app/hooks/usePayment.ts` - Payment signing and submission hook with Privy integration, Convex transaction recording

### Modified

- `pwa/convex/transactions.ts` - Added createTransaction and updateTransactionStatus mutations for payment lifecycle
- `pwa/package.json` - Added @solana/web3.js and @solana/spl-token dependencies

## Decisions Made

**Decision 95: Used @solana/web3.js directly for transaction building**
- Rationale: @solana/kit was mentioned in plan but @solana/web3.js v2 provides all needed functionality with better documentation
- Implementation: Connection, TransactionMessage, VersionedTransaction from @solana/web3.js; createTransferInstruction from @solana/spl-token
- Trade-off: Slightly more verbose API but better ecosystem support and examples

**Decision 96: VersionedTransaction (v0) for modern Solana format**
- Rationale: Solana v1 transactions (VersionedTransaction) are the current standard, legacy Transaction class deprecated
- Implementation: TransactionMessage.compileToV0Message() → new VersionedTransaction()
- Benefit: Future-proof, compatible with Privy signing, supports all modern instruction formats

**Decision 97: Amount conversion between display and base units**
- Rationale: QR codes encode display amounts (e.g., "5" for 5 EVT) but SPL transfers need base units (5 * 10^9 = 5000000000)
- Implementation: parseTokenAmount() converts display → base units; formatTokenAmount() converts base → display
- File: pwa/src/utils/transactions.ts
- Critical: Fixes payment amount errors where wrong decimal places caused transaction failures

**Decision 98: Convex transaction record created as PENDING before on-chain submission**
- Rationale: Provides audit trail even if Solana transaction fails; prevents lost payment records
- Implementation: createTransaction() called with status="pending" before connection.sendRawTransaction()
- Lifecycle: PENDING → send to Solana → wait for confirmation → update to CONFIRMED or FAILED
- Benefit: All payment attempts recorded, even failed ones, for debugging and reconciliation

**Decision 99: ATA created idempotently for recipient if needed**
- Rationale: Recipient may not have an associated token account (ATA) for the EVT token
- Implementation: createAssociatedTokenAccountIdempotentInstruction() checks and creates ATA if missing
- Benefit: Payments work for first-time recipients without manual ATA creation step
- Safety: Idempotent instruction - safe to run even if ATA already exists

**Decision 100: Balance query invalidated after successful payment**
- Rationale: BalanceDisplay component uses useQuery with stale data; need fresh balance after payment
- Implementation: queryClient.invalidateQueries({ queryKey: balanceQueryKeys.detail(sender) }) after confirmation
- Benefit: Real-time balance update without page refresh, triggered by payment completion

## Deviations from Plan

### Implementation Changes

**1. Used @solana/web3.js instead of @solana/kit**
- **Reason:** @solana/web3.js provides complete functionality for transaction building, RPC, and SPL tokens
- **Impact:** API differences from plan (e.g., Connection class instead of createSolanaRpc())
- **Files affected:** pwa/src/utils/transactions.ts, pwa/app/hooks/usePayment.ts

**2. Suspense wrapper added for useSearchParams SSR safety**
- **Reason:** Next.js 16 requires Suspense boundary for useSearchParams to avoid static generation errors
- **Implementation:** Wrapped ConfirmPaymentContent component in <Suspense>
- **Files affected:** pwa/app/confirm-payment/page.tsx

**3. Added Convex transaction recording (beyond plan scope)**
- **Reason:** Plan mentioned recording payment but didn't specify mutations; added createTransaction/updateTransactionStatus
- **Implementation:** Transaction records in Convex with PENDING → CONFIRMED/FAILED lifecycle
- **Files affected:** pwa/app/hooks/usePayment.ts, pwa/convex/transactions.ts

**4. Added merchant/item lookup from wallet address**
- **Reason:** Needed merchantId and itemId for Convex transaction records
- **Implementation:** Query merchants table by walletAddress using getMerchantByWallet
- **Files affected:** pwa/app/confirm-payment/page.tsx

## Issues Encountered

### Issues Fixed During Implementation

**Issue 1: Amount conversion causing payment failures**
- **Problem:** QR code encoded display amount (e.g., "5") but SPL transfer needed base units (5000000000)
- **Fix:** Added parseTokenAmount() function to convert display → base units using TOKEN_DECIMALS (9)
- **File:** pwa/app/confirm-payment/page.tsx, pwa/src/utils/transactions.ts

**Issue 2: Suspense boundary required for useSearchParams**
- **Problem:** Next.js 16 throws "useSearchParams must be wrapped in Suspense" error
- **Fix:** Created ConfirmPaymentContent inner component, wrapped in <Suspense> boundary
- **File:** pwa/app/confirm-payment/page.tsx

## User Setup Required

**Privy App ID Required:**
- Need to configure NEXT_PUBLIC_PRIVY_APP_ID in .env.local
- Create Privy app at https://dashboard.privy.io/
- Enable Solana chains for embedded wallet

**Solana Devnet:**
- No setup required (using public RPC: https://api.devnet.solana.com)
- For production, update DEVNET_RPC constant to production RPC

## Next Phase Readiness

**Payment flow complete:**
- QR scanning → Payment confirmation → Signing → On-chain submission → Balance update
- Transaction recording in Convex with status lifecycle
- Real-time balance updates via query invalidation

**Ready for Phase 3.5 (Merchant Registration & Management):**
- Payment infrastructure in place
- Convex transactions table ready for merchant sales tracking
- Solana transfer utilities reusable for merchant wallets

**Ready for Phase 4 (Merchant Experience):**
- Payment execution flow complete
- Transaction recording supports sales history
- Real-time balance updates work via Convex subscriptions

**No blockers or concerns.**

---
*Phase: 03-topup-payments*
*Completed: 2026-01-19*
