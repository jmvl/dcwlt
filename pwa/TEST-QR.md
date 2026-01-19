# Test Solana Pay QR Codes

## For Testing the Payment Flow

Since this is a POC on Devnet, you have a few options:

### Option 1: Use Native SOL (Simplest)

No SPL token needed - just send SOL:

```
solana:7UX2i7SucgLMQcfZ75s3DxQnZn8uBQHcNPvGJFyFMaE?amount=1000&label=Test+Merchant&message=Test+payment
```

**Amount:** 0.000001 SOL (1000 lamports)

---

### Option 2: Use Devnet USDC Token

USDC on Solana Devnet:
- Mint: `Gh9ZwEmdLX8cJDLzR6nW9CCXhwbxxR3MRW8gESbhLs6q`

```
solana:7UX2i7SucgLMQcfZ75s3DxQnZn8uBQHcNPvGJFyFMaE?amount=1000000&spl-token=Gh9ZwEmdLX8cJDLzR6nW9CCXhwbxxR3MRW8gESbhLs6q&label=Test+Merchant&message=Test+payment
```

**Amount:** 0.001 USDC (1,000,000 micro-USDC, 6 decimals)

---

### How to Generate QR Code

1. Go to: https://solana-pay.com/api/qr
2. Or use: https://www.qrcode-monkey.com/
3. Paste one of the URLs above
4. Download the QR code image
5. Display on another device/screen

---

### Test Wallet Addresses

**Merchant (Recipient):** `7UX2i7SucgLMQcfZ75s3DxQnZn8uBQHcNPvGJFyFMaE`

This is a random Devnet address - no actual funds needed for testing the UI flow.

---

## What to Test

1. **Scan the QR** - The scan page should recognize it as a Solana Pay URL
2. **Confirmation Screen** - Should show:
   - Merchant: "Test Merchant"
   - Amount: 0.001 USDC (or 0.000001 SOL)
   - Recipient address (truncated)
3. **3-Second Countdown** - Confirm button should be disabled
4. **Tap Confirm** - Should trigger Privy signing
5. **Result:**
   - If you have a Privy wallet with SOL: Transaction submits
   - If no funds: You'll see "Insufficient funds" error
   - Either way, the flow should work end-to-end
