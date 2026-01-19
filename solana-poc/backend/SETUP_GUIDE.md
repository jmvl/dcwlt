# EVENT Token Setup Guide

This guide explains how to initialize the EVENT token system for the Solana POC backend.

## Overview

The `setup-token.js` script automates the creation and configuration of the EVENT token on Solana Devnet:

1. **Creates a pool wallet** - Generates a new Solana keypair to hold tokens
2. **Requests SOL airdrop** - Gets test SOL for gas fees (2 SOL)
3. **Creates EVENT token mint** - Deploys a new SPL token on Devnet
4. **Creates token account** - Sets up a token account for the pool
5. **Mints tokens** - Creates 1,000,000 EVENT tokens for the pool
6. **Saves configuration** - Stores all addresses in `data/token-config.json`

## Prerequisites

1. **Node.js dependencies installed**:
   ```bash
   cd /Users/jm/Codebase/dcwlt/solana-poc/backend
   npm install
   ```

2. **Solana Devnet access** - The script connects to `https://api.devnet.solana.com`

## Usage

### Quick Start

```bash
cd /Users/jm/Codebase/dcwlt/solana-poc/backend
npm run setup:token
```

Or run directly:
```bash
node setup-token.js
```

## Airdrop Rate Limiting

The Solana Devnet faucet has a **daily request limit** per IP address. If you hit the limit:

### Option 1: Web Faucet

1. Visit https://faucet.solana.com
2. Enter the wallet address shown in the error message
3. Request airdrop from the web interface
4. Wait 10-30 seconds for SOL to arrive
5. Re-run: `npm run setup:token`

### Option 2: Solana CLI

If you have the Solana CLI installed:

```bash
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

Then re-run the setup script.

### Option 3: Wait

The daily limit resets at 00:00 UTC. You can wait and try again tomorrow.

## Output Files

The script creates two files in the `data/` directory:

### `pool-wallet.json`
Contains the private key for the pool wallet (mode 0600, owner-only).

**IMPORTANT**: This file controls all EVENT tokens. Keep it secure!

### `token-config.json`
```json
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com",
  "token": {
    "name": "EVENT",
    "symbol": "EVENT",
    "decimals": 9,
    "supply": 1000000,
    "mintAddress": "...",
    "totalSupplyRaw": "1000000000000000"
  },
  "pool": {
    "address": "...",
    "tokenAccount": "..."
  },
  "createdAt": "2025-01-15T..."
}
```

## Token Details

- **Name**: EVENT
- **Symbol**: EVENT
- **Decimals**: 9 (standard SPL token)
- **Total Supply**: 1,000,000 EVENT tokens
- **Network**: Solana Devnet (testnet only)

## Verification

After successful setup, verify the token on Solana Explorer:

```
https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet
```

Replace `<MINT_ADDRESS>` with the `mintAddress` from `token-config.json`.

## Integration

The backend server (`server.js`) uses `token-config.json` to:

1. Load the pool wallet for signing transactions
2. Get the token mint address for transfers
3. Validate transaction parameters

## Troubleshooting

### "429 Too Many Requests"
- Airdrop rate limit reached
- Use web faucet or Solana CLI as described above
- Wait until next day if needed

### "Insufficient SOL for gas fees"
- The pool wallet has less than 0.5 SOL
- Request another airdrop
- Or transfer SOL from another Devnet wallet

### "Token account already exists"
- The script detected an existing token configuration
- Check `data/token-config.json` to see current setup
- Delete `data/` directory to start fresh (CAUTION: loses existing tokens!)

### "Connection timeout"
- Devnet RPC may be slow or unavailable
- Wait and try again
- Check https://status.solana.com for network status

## Security Notes

1. **Devnet Only**: This script is for testnet only. Never use on mainnet.
2. **Wallet Security**: `pool-wallet.json` contains a private key. File permissions are set to 0600.
3. **No Real Value**: EVENT tokens have no monetary value on Devnet.
4. **Git Exclusion**: The `data/` directory should be in `.gitignore` to prevent committing private keys.

## Next Steps

After successful token setup:

1. **Start the backend server**:
   ```bash
   npm run dev
   ```

2. **Test token operations**:
   ```bash
   curl -X POST http://localhost:3000/api/topup \
     -H "Content-Type: application/json" \
     -d '{"walletAddress": "<YOUR_WALLET>", "amount": 50}'
   ```

3. **Monitor transactions** on Solana Explorer

## Support

For issues or questions:
- Check the main project README
- Review Solana Devnet documentation: https://docs.solana.com/cluster/devnet
- View SPL Token documentation: https://spl.solana.com/token
