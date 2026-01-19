# SPL Token InvalidAccountData Fix

## Issue
QR payment failed with "Error: InvalidAccountData" from SPL Token program when user tried to pay merchant.

## Root Cause
The `buildSPLTokenTransfer` function in `/Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts` was using `getAssociatedTokenAddress()` to derive the recipient's ATA address, but this function only DERIVES the address - it doesn't check if the ATA actually exists on-chain.

When the recipient (merchant wallet) didn't have an ATA for the EVT token mint, the `createTransferInstruction` would fail with "InvalidAccountData" because it tried to transfer tokens to a non-existent account.

## Solution
Modified `buildSPLTokenTransfer` to:
1. Check if the recipient's ATA exists using `connection.getAccountInfo()`
2. If the ATA doesn't exist, add a `createAssociatedTokenAccountIdempotentInstruction` to the transaction
3. Then execute the transfer instruction (which now will always succeed)

## Changes Made

### File: `/Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts`

**Import added:**
```typescript
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,  // NEW
} from '@solana/spl-token';
```

**Logic added to `buildSPLTokenTransfer` function:**
```typescript
// Build instructions array
const instructions = [];

// Check if recipient's ATA exists, if not, add instruction to create it
const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
if (!recipientAccountInfo) {
  console.log('[buildSPLTokenTransfer] Recipient ATA does not exist, creating it...');
  // Create the ATA if it doesn't exist (idempotent - safe to run even if it exists)
  const createATAInstruction = createAssociatedTokenAccountIdempotentInstruction(
    senderPubkey,           // payer
    recipientTokenAccount,  // ATA address to create
    recipientPubkey,        // owner of the ATA
    tokenMintPubkey         // token mint
  );
  instructions.push(createATAInstruction);
}

// Create the SPL token transfer instruction
const transferInstruction = createTransferInstruction(
  senderTokenAccount,     // source
  recipientTokenAccount,  // destination
  senderPubkey,           // authority (owner of source account)
  amountBigInt            // amount
);
instructions.push(transferInstruction);

// Create a transaction message with the instruction(s)
const messageV0 = new TransactionMessage({
  payerKey: senderPubkey,
  recentBlockhash: blockhash,
  instructions,  // Now contains both ATA creation (if needed) and transfer
}).compileToV0Message();
```

## Why This Works

1. **Idempotent ATA Creation**: Using `createAssociatedTokenAccountIdempotentInstruction` ensures that:
   - If the ATA doesn't exist, it will be created
   - If the ATA already exists, the instruction does nothing (no error)
   - This is safer than checking and creating separately (avoids race conditions)

2. **Single Transaction**: Both ATA creation (if needed) and token transfer happen in a single atomic transaction:
   - All paid for by the sender (user wallet)
   - Either both succeed or both fail
   - No partial state where ATA exists but transfer didn't complete

3. **Sender Pays**: The sender (user) pays for:
   - ATA creation rent exemption if needed (~0.002 SOL devnet)
   - Transaction fee (~0.000005 SOL devnet)
   - This is standard Solana Pay behavior - payer always pays

## Testing
TypeScript compilation verified successfully. Awaiting user testing to confirm:
1. Payment to merchant with no ATA succeeds
2. ATA is created automatically
3. Tokens are transferred correctly
4. Balance updates properly

## References
- Solana SPL Token docs: https://solana-labs.github.io/solana-program-library/token/
- Associated Token Account pattern: https://docs.solana.com/developing/programming-model/calling-between-programs#associated-token-account
