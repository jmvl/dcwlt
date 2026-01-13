# Blockchain Setup Notes

## Token Details

- **Token Address**: *TO BE FILLED* (from `spl-token create-token` output)
- **Token Account**: *TO BE FILLED* (from `spl-token create-account` output)
- **Bank Wallet Pubkey**: *TO BE FILLED* (run `solana address` after creating wallet)

## Setup Commands Reference

### Initial Solana Configuration
```bash
# Configure Solana for Devnet
solana config set --url devnet

# Verify configuration
solana config get
```

### Bank Wallet Creation
```bash
# Create bank wallet (holds all Event Tokens)
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase

# Set as default keypair
solana config set --keypair ~/bank-wallet.json

# Get devnet SOL for gas fees
solana airdrop 2

# Verify balance
solana balance

# Get wallet public address
solana address
```

### Event Token Creation
```bash
# Create the SPL Token
spl-token create-token
# SAVE THE OUTPUT TOKEN ADDRESS!

# Create token account for bank wallet
spl-token create-account <TOKEN_ADDRESS>

# Mint initial supply (1,000,000 tokens)
spl-token mint <TOKEN_ADDRESS> 1000000

# Disable mint authority (prevents more minting)
spl-token authorize <TOKEN_ADDRESS> mint --disable

# Verify token supply
spl-token supply <TOKEN_ADDRESS>

# Check bank wallet token balance
spl-token balance <TOKEN_ADDRESS>
```

### Token Distribution (Manual/Test)
```bash
# Transfer tokens to user wallet (for testing top-up)
spl-token transfer <TOKEN_ADDRESS> <USER_WALLET_ADDRESS> 50
```

## Important Notes

⚠️ **CRITICAL**: The token address from `spl-token create-token` CANNOT be recovered if lost. Save it immediately to:
1. This file (blockchain-notes.md)
2. event-wallet/src/config/constants.ts
3. backend/.env
4. merchant/.env

## Devnet Explorer
View transactions at: https://explorer.solana.com/?cluster=devnet

## Wallet Locations
- Bank Wallet: ~/bank-wallet.json
- Merchant Wallet: ~/merchant-wallet.json (to be created)
