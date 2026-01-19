# Phase 3 Goal-Backward Planning

## Phase Goal

**From ROADMAP.md:** "Mock top-up flow and QR code payment execution"

## Observable Truths

**What must be TRUE for this goal to be achieved?**

### Top-Up Flow Truths
1. User can select a token bundle (e.g., "$20 = 200 EVT")
2. User sees confirmation after selecting bundle
3. Balance updates after mock top-up completes
4. Transaction signature is displayed

### QR Payment Truths
1. User can access QR scanner from dashboard
2. Camera permission is requested on first use
3. QR scanner successfully reads payment QR codes
4. Payment details are shown before confirmation
5. User has 3 seconds to review before confirming
6. Payment completes and updates balance
7. Success/error feedback is shown

## Required Artifacts

### Top-Up Flow Artifacts
- `pwa/app/topup/page.tsx` - Top-up bundle selection page
- `pwa/app/components/TopUpBundle.tsx` - Individual bundle card
- `pwa/convex/topups.ts` - Convex mutation for recording top-ups
- `pwa/app/hooks/useTopUp.ts` - Hook for top-up logic

### QR Scanner Artifacts
- `pwa/app/scan/page.tsx` - QR scanner page
- `pwa/app/components/QRScanner.tsx` - Scanner component with html5-qrcode
- `pwa/src/utils/solanaPay.ts` - URL parser and validator

### Payment Execution Artifacts
- `pwa/app/confirm-payment/page.tsx` - Payment confirmation screen
- `pwa/app/components/PaymentConfirmation.tsx` - Confirmation UI with countdown
- `pwa/src/utils/transactions.ts` - Solana transaction builder
- `pwa/app/hooks/usePayment.ts` - Payment signing and submission hook

## Key Links (Critical Connections)

### Top-Up Flow
- TopUpBundle → Convex mutation (not placeholder)
- Convex mutation → BalanceDisplay subscription
- BalanceDisplay updates without page refresh

### QR Scanner
- QRScanner → html5-qrcode library (real integration)
- html5-qrcode → device camera (not mock)
- Camera permission → browser prompt (not bypassed)

### Payment Execution
- QR scan result → parseSolanaPayURL (real parsing)
- parseSolanaPayURL → PaymentConfirmation (not hardcoded)
- PaymentConfirmation → usePayment hook (not console.log)
- usePayment → Privy signTransaction (real signing)
- signTransaction → Solana Devnet RPC (not local mock)
- RPC response → BalanceDisplay update (real-time)

## Common Failures to Detect

### Stubs and Placeholders
- Top-up button does nothing (no Convex mutation call)
- QR scanner shows "Scan successful" but doesn't read real QR codes
- Payment confirmation has hardcoded values instead of parsed URL
- Transaction signature is a fake string format
- Balance update is immediate (not real-time subscription)

### Missing Wiring
- Top-up component doesn't trigger Convex mutation
- QR scanner doesn't pass result to parser
- Parser result doesn't reach confirmation screen
- Confirmation doesn't call payment hook
- Payment hook doesn't submit to RPC

## Per-Plan Must-Haves

### Plan 03-01: Mock Top-Up Flow

**Truths:**
- User sees predefined token bundles (e.g., "$10 = 100 EVT", "$20 = 200 EVT")
- User can tap bundle to initiate top-up
- Balance updates after top-up completes
- Transaction signature displayed

**Artifacts:**
- `pwa/app/topup/page.tsx` - Bundle selection page, lists 3-4 predefined bundles
- `pwa/app/components/TopUpBundle.tsx` - Bundle card component
- `pwa/convex/topups.ts` - `recordTopUp` mutation that stores amount and signature
- `pwa/convex/wallets.ts` - Modified to include `mockTopUp` mutation for testing

**Key Links:**
- TopUpBundle onClick → recordTopUp mutation (uses Convex useMutation)
- recordTopUp → updates wallets table (not stub)
- BalanceDisplay subscription → reflects new balance (real-time)

### Plan 03-02: QR Scanner with URL Parser

**Truths:**
- QR scanner initializes when user navigates to /scan
- Camera permission prompt shown on first use
- Scanner successfully reads Solana Pay URLs from QR codes
- Invalid QR codes are ignored (no crash)
- Valid URLs redirect to confirmation screen with parsed data

**Artifacts:**
- `pwa/app/scan/page.tsx` - Scanner page
- `pwa/app/components/QRScanner.tsx` - html5-qrcode integration
- `pwa/src/utils/solanaPay.ts` - `parseSolanaPayURL()` function

**Key Links:**
- QRScanner → html5-qrcode Html5Qrcode.start() (real library call)
- html5-qrcode → device camera (not simulated)
- Scan success → parseSolanaPayURL() (called with real result)
- parseSolanaPayURL → router.push('/confirm-payment') (with parsed params)

### Plan 03-03: Payment Execution

**Truths:**
- Payment confirmation shows merchant, amount, token details
- Confirm button disabled for 3 seconds after page load
- After confirmation, transaction is signed with Privy
- Transaction submitted to Solana Devnet RPC
- Success screen shows transaction signature and explorer link
- Balance updates after payment confirms
- Errors show specific failure messages

**Artifacts:**
- `pwa/app/confirm-payment/page.tsx` - Confirmation page
- `pwa/app/components/PaymentConfirmation.tsx` - Details UI with countdown
- `pwa/src/utils/transactions.ts` - `buildSPLTokenTransfer()` function
- `pwa/app/hooks/usePayment.ts` - Signing and submission hook

**Key Links:**
- PaymentConfirmation → URL params from parser (not hardcoded)
- usePayment → buildSPLTokenTransfer() with real params
- buildSPLTokenTransfer → Privy signTransaction() (not mock)
- signTransaction → Solana RPC.submit() (Devnet, not local)
- RPC response → BalanceDisplay update (via Convex subscription)

---

This goal-backward analysis ensures tasks create real implementations, not stubs.
