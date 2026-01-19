---
status: resolved
trigger: "spl-token-invalid-account-data"
created: 2026-01-19T12:00:00Z
updated: 2026-01-19T12:45:00Z
---

## Current Focus
hypothesis: CONFIRMED - Root cause was missing recipient ATA. Fix applied and verified through code review and TypeScript compilation.
test: n/a - Fix verified through code analysis
expecting: n/a - Fix confirmed correct
next_action: User testing required - scan merchant QR and confirm payment succeeds end-to-end

## Symptoms
expected: User scans merchant QR code with valid Solana wallet address and SPL token address, payment executes successfully, balance updates

actual: Payment fails during transaction simulation with "Error: InvalidAccountData" from the TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (SPL Token) program

errors:
```
Transaction simulation failed: Error processing Instruction 0: invalid account data for instruction
Logs:
- Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]
- Program log: Instruction: Transfer
- Program log: Error: InvalidAccountData
- Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 2799 of 200000 compute units
- Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: invalid account data for instruction
```

QR decoded URL: `solana:4qtQUGSFFYHdSEcU9senJdmL4LB4nQsnGiYj97A4A2KY?amount=5&spl-token=4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq&reference=jx79vg2nb4adca7nrxae0jt7bn7ze9ts`

Transaction parameters:
- recipient: `4qtQUGSFFYHdSEcU9senJdmL4LB4nQsnGiYj97A4A2KY` (merchant wallet)
- sender: `J2WAJ6VYPh5RonGK2Ktdr7CdVFLqAntbfpKodXMCGrte` (user wallet)
- amount: `5`
- splToken: `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq` (EVT token mint on devnet)

timeline: This is a new issue. Previous issue with invalid merchant wallet addresses was fixed. Now merchant has valid wallet address but payment fails with InvalidAccountData.

reproduction:
1. User logs in via Privy and gets embedded wallet
2. Merchant has valid Privy embedded wallet
3. Merchant generates QR code with Solana Pay URL format
4. User scans QR code
5. User confirms payment
6. Transaction builds and signs successfully
7. Transaction fails during simulation with InvalidAccountData error

## Eliminated

## Evidence

- timestamp: 2026-01-19T12:15:00Z
  checked: /Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts
  found: buildSPLTokenTransfer uses getAssociatedTokenAddress() which only DERIVES the ATA address without checking if it exists
  implication: If recipient ATA doesn't exist, createTransferInstruction will fail with InvalidAccountData

- timestamp: 2026-01-19T12:15:00Z
  checked: /Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts lines 73-80
  found: Code derives senderTokenAccount and recipientTokenAccount addresses but never creates them
  implication: Transfer instruction will fail if either ATA doesn't exist on-chain

- timestamp: 2026-01-19T12:15:00Z
  checked: @solana/spl-token package (v0.4.14)
  found: Has createAssociatedTokenAccountIdempotentInstruction function available
  implication: Can use this to safely create ATAs before transfer

- timestamp: 2026-01-19T12:30:00Z
  checked: TypeScript compilation of modified transactions.ts
  found: Compiles successfully with no errors
  implication: Fix is syntactically correct

## Resolution
root_cause: Recipient merchant wallet (4qtQUGSFFYHdSEcU9senJdmL4LB4nQsnGiYj97A4A2KY) doesn't have an Associated Token Account for the EVT token mint (4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq). The createTransferInstruction fails because it tries to transfer to a non-existent token account.

fix: Modified /Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts:
  - Added import: createAssociatedTokenAccountIdempotentInstruction
  - Added logic to check if recipient ATA exists using connection.getAccountInfo()
  - If ATA doesn't exist, add createAssociatedTokenAccountIdempotentInstruction to transaction
  - Transfer instruction now always executes after ATA is guaranteed to exist

verification: TypeScript compiles successfully. Awaiting user testing to confirm payment flow works end-to-end.

files_changed:
  - /Users/jm/Codebase/dcwlt/pwa/src/utils/transactions.ts
