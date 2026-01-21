# Debug Session: QR Payment - Invalid Public Key Error

**Started:** 2025-01-19
**Issue:** QR code payment fails with "Invalid public key input" error

## Symptoms

### Expected Behavior
User scans merchant QR code → payment executes successfully → balance updates

### Actual Behavior
User scans merchant QR code → payment fails with "Invalid public key input" error

### Error Details
```
Error: Invalid public key input
PublicKey publickey.ts:65
buildSPLTokenTransfer transactions.ts:68
```

**Invalid recipient address:**
```
recipient: "111111111111111111111111111111111111113tdMZ5"
```

This address is **64 characters long** - invalid for Solana (should be 32-44 chars in base58).

## Investigation

### Files Examined

1. **`pwa/src/utils/transactions.ts:68`** - Where error occurs
   - `new PublicKey(recipient)` throws on invalid address format

2. **`pwa/app/components/QRCodeGenerator.tsx`** - Generates Solana Pay URL
   - Uses `merchantAddress` prop from parent component
   - URL format: `solana:${merchantAddress}?amount=${price}&spl-token=${TOKEN}`

3. **`pwa/app/components/MerchantInventory.tsx`** - Passes merchant address
   - Gets `merchant.walletAddress` from `useMerchantAuth()` hook
   - Passes to QRCodeGenerator as `merchantAddress` prop

4. **`pwa/convex/merchants.ts`** - Wallet address generation
   - Uses `generateMockWalletAddress(email)` function
   - Creates deterministic mock address using simple hash + base58 encode

### Root Cause Analysis

The recipient address `111111111111111111111111111111111111113tdMZ5` appears to be a **corrupted or incorrectly generated mock wallet address**.

The `encodeBase58()` function in `merchants.ts` has a flaw:
- It pads with "1" characters to reach 44 chars
- For small hash values, this results in many leading "1"s
- The function doesn't generate valid Solana public keys, just base58-like strings

**The real issue:** The mock wallet generation produces strings that LOOK like Solana addresses (44 chars, base58 alphabet) but are NOT valid 32-byte ed25519 public keys that Solana's `PublicKey` constructor expects.

### Evidence

1. Solana's `PublicKey` constructor validates that the input decodes to exactly 32 bytes
2. The mock address generator produces deterministic but cryptographically invalid addresses
3. The error occurs specifically when trying to create `new PublicKey(recipient)` where recipient is the merchant's mock wallet address

## Hypothesis

**Primary Hypothesis:** The mock wallet address generation in `merchants.ts` produces invalid Solana public keys. While the base58 encoding is syntactically correct (uses proper alphabet, 44 chars), the underlying byte representation doesn't correspond to a valid 32-byte ed25519 public key.

## Next Steps

1. **Option A - Fix Mock Generation:** Update `generateMockWalletAddress()` to use `@solana/web3.js` Keypair generation for actual valid addresses
2. **Option B - Use Real Privy:** Replace mock system with actual Privy embedded wallet creation (as intended by the architecture)
3. **Option C - Use Test Addresses:** Hardcode valid devnet test addresses for merchants during development

## Resolution: IMPLEMENTED (Option B)

### Implementation Summary

Implemented real Privy embedded wallet creation for merchants. The fix includes:

#### 1. Updated Convex Mutation (`pwa/convex/merchants.ts`)
- **`registerMerchant`** mutation now accepts `walletAddress` parameter
- Removed mock wallet generation functions (`generateMockWalletAddress`, `simpleHash`, `encodeBase58`)
- Added validation for wallet address format (32-44 characters for Solana)
- **NEW: `updateMerchantWalletAddress`** mutation to fix existing merchants with invalid addresses

#### 2. Updated Merchant Registration (`pwa/app/merchant/register/page.tsx`)
- Now requires Privy authentication BEFORE registration
- Redirects to login if not authenticated
- Extracts real embedded wallet address from authenticated Privy user
- Displays wallet address and email (read-only, from Privy)
- Submits registration with real wallet address

#### 3. Added Auto-Update Logic (`pwa/app/components/MerchantAuthProvider.tsx`)
- Automatically updates merchant's wallet address on login if it differs from Privy wallet
- Fixes existing merchants with invalid mock addresses
- Uses `updateMerchantWalletAddress` mutation

### How It Works Now

**New Merchant Registration:**
1. User visits `/merchant/register`
2. Redirected to login if not authenticated
3. After Privy login, user gets real embedded Solana wallet
4. Wallet address is displayed (read-only)
5. Registration submitted with real wallet address
6. Admin approves merchant
7. Merchant can log in and receive payments with valid wallet address

**Existing Merchants (with invalid addresses):**
1. Merchant logs in via Privy
2. `MerchantAuthProvider` detects wallet address mismatch
3. Automatically calls `updateMerchantWalletAddress` mutation
4. Merchant's record is updated with real Privy wallet address
5. QR codes now work with valid wallet address

### Files Modified

1. `pwa/convex/merchants.ts` - Updated registerMerchant mutation, removed mock functions, added updateMerchantWalletAddress
2. `pwa/app/merchant/register/page.tsx` - Now requires Privy auth, uses real wallet address
3. `pwa/app/components/MerchantAuthProvider.tsx` - Added auto-update logic for wallet addresses

### Testing Steps

1. **Register a new merchant:**
   - Go to `/merchant/register`
   - Login via Privy
   - Fill out business name
   - Submit
   - Verify wallet address is a valid Solana address (44 chars, base58)

2. **Fix existing merchant:**
   - Login as existing merchant
   - Check console for "Updating wallet address from X to Y"
   - Verify QR codes now work

3. **Test payment flow:**
   - Generate QR code as merchant
   - Scan QR as user
   - Confirm payment executes successfully

## Status: READY FOR TESTING

The fix has been implemented. Merchants will now have valid Solana wallet addresses from their Privy embedded wallets, resolving the "Invalid public key input" error.
