# Blockchain Setup Notes

## Token Details

- **Token Address**: `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq`
- **Token Account**: `BDameA4U5jwjZDjCri994cb3wwQVZXzsRFgP1NCYWyjn`
- **Bank Wallet Pubkey**: `CeJrezfkhgphNCtSSjCVpZVdy1cY467EywuxiAj3hVVY`
- **Token Decimals**: 9
- **Total Supply**: 1,000,000 EVT

## Transaction Signatures

| Action | Signature |
|--------|-----------|
| Token Creation | `FDW5uMe8ZpnEVXZbQrhmw9AujYU4GHYigoZiZVZvivd2DYReyRn5WhJDKpjHSj2iMQW8ueeB1PLzziNXKbFwGXN` |
| Account Creation | `2dSuu1DJMsA2e6U9R8oAgBucgbGdnNJC2yDomANDVJBYN121M76wBKCx75rQaXC66R8wgRPRQ8LeY9hPwNBhaK2U` |
| Minting 1M Tokens | `4GzShTWJfepUJKsntUnPzqUG8sFAXqyU5djGzK6Pedh4cws72uciAri6LJdK3HwtVSFWhtwzHBuuAJrCLaTtSS7K` |

## Bank Wallet Seed Phrase

⚠️ **SAVE SECURELY**: `stick certain guard surround purse feature lounge brown convince metal twenty connect`

**Wallet Location**: `~/bank-wallet.json`

## Setup Commands Reference

### Initial Solana Configuration
```bash
# Configure Solana for Devnet
solana config set --url devnet

# Verify configuration
solana config get

# Configure bank wallet
solana config set --keypair ~/bank-wallet.json

# Get devnet SOL for gas fees
solana airdrop 2
```

### Event Token Creation (COMPLETED)
```bash
# Create the SPL Token
spl-token create-token
# Output: 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq

# Create token account for bank wallet
spl-token create-account 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq
# Output: BDameA4U5jwjZDjCri994cb3wwQVZXzsRFgP1NCYWyjn

# Mint initial supply (1,000,000 tokens)
spl-token mint 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq 1000000

# Verify token supply
spl-token supply 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq
# Output: 1000000

# (Optional) Disable mint authority
spl-token authorize 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq mint --disable

# Check bank wallet token balance
spl-token balance 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq
```

### Token Distribution (Manual/Test)
```bash
# Transfer tokens to user wallet (for testing top-up)
spl-token transfer 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq <USER_WALLET_ADDRESS> 50
```

## Configuration Files Updated

✅ `event-wallet/src/config/constants.ts` - Updated with token address
⏳ `backend/.env` - Needs to be created
⏳ `merchant/.env` - Needs to be created

## Devnet Explorer

View transactions at: https://explorer.solana.com/?cluster=devnet

Search by:
- Wallet address: `CeJrezfkhgphNCtSSjCVpZVdy1cY467EywuxiAj3hVVY`
- Token address: `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq`
- Transaction signatures (above)

## Important Notes

⚠️ **CRITICAL**: The token address `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq` CANNOT be recovered if lost.

✅ **Blockchain setup COMPLETE** (Tasks 1-4)

## Next Steps

1. Create Web3Auth project at https://dashboard.web3auth.io
2. Get Client ID and update `event-wallet/app.json`
3. Create merchant wallet: `solana-keygen new --outfile ~/merchant-wallet.json`
4. Build and test the mobile app
