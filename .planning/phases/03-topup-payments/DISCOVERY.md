# Phase 3 Discovery: Top-Up + Payments

**Discovery Level:** Standard Research (Level 2)
**Date:** 2026-01-17
**Status:** Complete

## Overview

Phase 3 requires implementing mock top-up flow and QR code payment execution. This research identifies the technical choices for QR scanning, Solana transaction building, and URL parsing.

## Key Technical Decisions

### 1. QR Code Scanner Library

**Selected:** `html5-qrcode`

**Why:**
- Pure JavaScript, works in all modern browsers including iOS Safari
- Actively maintained (Benchmark Score: 82.2, High reputation)
- PWA-compatible with HTTPS requirement for camera access
- Two modes: Easy (built-in UI) and Pro (custom UI)
- Properly handles camera permissions flow
- Cross-platform: Works on mobile browsers without React Native dependencies

**Alternatives Considered:**
- `react-qr-scanner` - React Native only, not suitable for web PWA
- `@yudielcurbelo/react-qr-scanner` - React Native specific
- Mobile native libraries - Would require separate mobile app, negates PWA benefits

**Implementation Pattern:**
```javascript
// Pro mode for custom UI integration
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" }, // Back camera on mobile
  { fps: 10, qrbox: { width: 250, height: 250 } },
  (decodedText, decodedResult) => {
    // Handle QR code result
    console.log(`Scanned: ${decodedText}`);
  },
  (errorMessage) => {
    // Ignore parse errors, keep scanning
  }
);
```

**iOS Safari Constraints:**
- Camera access requires HTTPS (already satisfied for PWA)
- Must use `facingMode: "environment"` for back camera
- Permission request must be user-triggered (not on page load)
- Standalone PWA mode has full camera API support

### 2. Solana Web3.js Version

**Selected:** `@solana/kit` + `@solana/web3.js` (v2)

**Why:**
- Latest Solana SDK with modern TypeScript support
- Provides `getTransferInstruction` for SPL token transfers
- Better transaction building patterns with `pipe()` function
- Maintained by Solana Foundation
- Compatible with Privy embedded wallet signing

**Implementation Pattern for SPL Token Transfer:**
```typescript
import { 
  createTransactionMessage, 
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction
} from "@solana/kit";
import { getTransferInstruction } from "@solana-program/token";

const transaction = pipe(
  createTransactionMessage({ version: 0 }),
  m => setTransactionMessageFeePayerSigner(signer, m),
  m => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
  m => appendTransactionMessageInstructions(
    [getTransferInstruction({
      source: userTokenAccount,
      destination: merchantTokenAccount,
      amount: amountInSmallestUnit,
      authority: signer,
    })],
    m,
  ),
);

const signedTransaction = await signTransactionMessageWithSigners(transaction);
const signature = getSignatureFromTransaction(signedTransaction);
```

### 3. Solana Pay URL Format

**Specification from [Solana Pay Specification](https://docs.solanapay.com/spec):**

```
solana:<recipient>?amount=<amount>&spl-token=<spl-token>&reference=<reference>&label=<label>&message=<message>
```

**Required Parameters:**
- `solana:` - URL scheme
- `<recipient>` - Base58-encoded wallet address

**Optional Parameters:**
- `amount` - Payment amount in smallest unit (lamports for SOL, token decimals for SPL)
- `spl-token` - SPL token mint address (defaults to SOL if omitted)
- `reference` - Unique reference for payment tracking
- `label` - Merchant name/identifier
- `message` - Payment description/note

**URL Parsing Pattern:**
```typescript
function parseSolanaPayURL(url: string) {
  // Remove "solana:" prefix
  const withoutScheme = url.replace(/^solana:/, '');
  
  // Split into address and query params
  const [address, queryString] = withoutScheme.split('?');
  
  // Parse query parameters
  const params = new URLSearchParams(queryString);
  
  return {
    recipient: address,
    amount: params.get('amount'),
    splToken: params.get('spl-token'),
    reference: params.get('reference'),
    label: params.get('label'),
    message: params.get('message'),
  };
}
```

**Example URL:**
```
solana:7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi?amount=5000000&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=Coffee+Shop&message=Latte
```

**Amount Handling:**
- SOL: Amount in lamports (1 SOL = 1,000,000,000 lamports)
- SPL Token: Amount in smallest unit based on token decimals
- Event Token: 9 decimals, so 1 EVT = 100000000 (9 zeros)

### 4. Privy Wallet Integration

**Existing Pattern from Phase 2:**
- Privy embedded wallet auto-creates Solana keypair on login
- Private key stored in device secure enclave
- Wallet address available via `usePrivyAuth()` hook

**Signing Transactions with Privy:**
```typescript
import { usePrivy } from '@privy-io/react-auth';

const { signTransaction } = usePrivy();

// Sign the Solana transaction
const signature = await signTransaction(transaction);
```

**Note:** Privy handles key management and signing, app only needs to:
1. Build the transaction with correct instructions
2. Pass to `signTransaction()`
3. Submit to network via RPC

## Architecture Patterns

### Mock Top-Up Flow

**No Stripe Integration Yet (Phase 3):**
- User selects predefined bundle (e.g., "$20 = 200 EVT")
- Convex mutation records "pending top-up" state
- Simulate backend approval with 2-second delay
- Use mock Solana transaction (local signing, no RPC submission)
- Update Convex balance
- Display transaction signature (mock format)

**Future Phase 3.x:** Add real Stripe webhook handling

### Payment Flow

**Step-by-Step:**
1. User taps "Scan QR" button
2. Request camera permissions (user-triggered)
3. Initialize `html5-qrcode` scanner
4. On successful scan:
   - Parse Solana Pay URL
   - Validate amount and token address
   - Show confirmation screen with details
   - 3-second countdown before "Confirm" button enables
5. User confirms:
   - Build SPL token transfer instruction
   - Sign with Privy wallet
   - Submit to Solana Devnet RPC
   - Show success/error feedback
6. Update Convex balance via subscription

**Error Handling:**
- Camera permission denied → Show instructions to enable in settings
- Invalid URL format → "Not a valid payment QR code"
- Insufficient balance → "Insufficient funds for this payment"
- Transaction failed → Display specific error from RPC
- Network timeout → Retry option

## Dependencies to Install

```bash
cd pwa
npm install html5-qrcode
npm install @solana/kit @solana/web3.js @solana/program
```

**Note:** `@solana/web3.js` may already be installed from previous phases. Verify in `package.json`.

## Common Pitfalls

### QR Scanner
1. **Calling camera on page load** → Always user-triggered
2. **Not stopping scanner** → Must call `html5QrCode.stop()` after successful scan
3. **HTTPS requirement** → Camera API blocked on HTTP, must use HTTPS or localhost
4. **iOS Safari quirks** → Use `facingMode: "environment"` for back camera

### Solana Transactions
1. **Wrong amount decimals** → Event Token has 9 decimals, multiply correctly
2. **Missing token account** → Use ATA (Associated Token Account) patterns
3. **Blockhash expiry** → Always fetch fresh blockhash before building transaction
4. **Private key exposure** → Never handle raw keys, use Privy signing only

### URL Parsing
1. **Base58 decoding errors** → Validate address format before parsing
2. **Missing amount validation** → Amount can be 0, must check
3. **Token address mismatch** → Verify SPL token address matches expected Event Token

## Testing Strategy

### Mock Top-Up
- Select each bundle, verify balance update
- Check transaction signature format
- Verify Convex subscription updates UI
- Test error states (network failure)

### QR Scanning
- Test on real mobile device (camera not available in desktop browser)
- Test with valid Solana Pay URL
- Test with invalid QR code (should ignore)
- Verify camera permission prompt
- Test in iOS Safari standalone PWA mode

### Payment Execution
- Scan merchant QR, verify confirmation screen
- Check 3-second countdown works
- Confirm transaction submits to Devnet
- Verify signature link to Solana Explorer
- Test insufficient balance scenario

## Verification Checklist

Before Phase 3 is complete:
- [ ] Top-up bundles display correctly
- [ ] Mock top-up updates balance in Convex
- [ ] QR scanner initializes on mobile device
- [ ] Solana Pay URL parses correctly
- [ ] Payment confirmation shows all details
- [ ] Transaction signs and submits to Devnet
- [ ] Success/error feedback displays appropriately
- [ ] Balance updates after successful payment
- [ ] Transaction signature links to explorer

## References

- [Solana Pay Specification](https://docs.solanapay.com/spec)
- [html5-qrcode Documentation](https://scanapp.org/html5-qrcode-docs/docs/intro)
- [QuickNode Solana Pay Guide](https://www.quicknode.com/guides/solana-development/solana-pay/getting-started-with-solana-pay)
- [Solana Token Documentation](https://solana.com/docs/tokens)
- [Privy Documentation](https://docs.privy.io)

---

**Discovery Complete:** Ready for task breakdown and plan creation.

**Next Steps:**
1. Break Phase 3 into tasks based on this discovery
2. Build dependency graph
3. Group into parallelizable plans
4. Write PLAN.md files
