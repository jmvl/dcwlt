# Event Wallet - Blockchain Credentials

⚠️ **KEEP THIS FILE SECURE** - Contains wallet credentials and seed phrases!

---

## Bank Wallet (Holds All Event Tokens)

| Field | Value |
|-------|-------|
| **Public Key** | `CeJrezfkhgphNCtSSjCVpZVdy1cY467EywuxiAj3hVVY` |
| **Keypair Path** | `~/bank-wallet.json` |
| **Balance** | 1,000,000 EVT (Event Tokens) |

### Seed Phrase
```
stick certain guard surround purse feature lounge brown convince metal twenty connect
```

⚠️ **CRITICAL**: This seed phrase is the ONLY way to recover this wallet. Save it securely!

---

## Merchant Wallet (Receives Payments)

| Field | Value |
|-------|-------|
| **Public Key** | `9LNhH3HhZpZCmWnioEiuu8F5ytKw1xpUzbSdY7vcdSeY` |
| **Keypair Path** | `~/merchant-wallet.json` |

### Seed Phrase
```
beef vendor rude invite lamp enhance install domain episode accuse arctic sick
```

⚠️ **CRITICAL**: This seed phrase is the ONLY way to recover this wallet. Save it securely!

---

## Event Token

| Field | Value |
|-------|-------|
| **Token Address** | `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq` |
| **Token Account** | `BDameA4U5jwjZDjCri994cb3wwQVZXzsRFgP1NCYWyjn` |
| **Decimals** | 9 |
| **Total Supply** | 1,000,000 EVT |
| **Network** | Solana Devnet |

### Token Creation Transactions

| Action | Signature |
|--------|-----------|
| Token Creation | `FDW5uMe8ZpnEVXZbQrhmw9AujYU4GHYigoZiZVZvivd2DYReyRn5WhJDKpjHSj2iMQW8ueeB1PLzziNXKbFwGXN` |
| Account Creation | `2dSuu1DJMsA2e6U9R8oAgBucgbGdnNJC2yDomANDVJBYN121M76wBKCx75rQaXC66R8wgRPRQ8LeY9hPwNBhaK2U` |
| Minting 1M Tokens | `4GzShTWJfepUJKsntUnPzqUG8sFAXqyU5djGzK6Pedh4cws72uciAri6LJdK3HwtVSFWhtwzHBuuAJrCLaTtSS7K` |

---

## Web3Auth Configuration

| Field | Value |
|-------|-------|
| **Client ID** | `BF_3EwSny_eyZmyDHMK-FOv1mu3Zrt7gRB5G9TQQtoBYmo_2Hww_Yd6l0xCqKBLadXIM0ZVEKNCwfAxaqvHc648` |
| **Network** | Sapphire Devnet (Testnet) |
| **Config File** | `event-wallet/app.json` |
| **Dashboard** | https://dashboard.web3auth.io |

---

## Configuration Files Updated

✅ `event-wallet/src/config/constants.ts` - Token address configured
✅ `event-wallet/app.json` - Web3Auth Client ID configured
✅ `backend/.env` - Bank wallet and token address configured
✅ `merchant/.env` - Merchant wallet and token address configured
✅ `blockchain-notes.md` - Complete setup documentation

---

## Network Details

| Field | Value |
|-------|-------|
| **Network** | Solana Devnet (Testnet) |
| **RPC URL** | `https://api.devnet.solana.com` |
| **Explorer** | `https://explorer.solana.com/?cluster=devnet` |

---

## Quick Commands

### Check Balances
```bash
# Bank wallet SOL balance
solana balance

# Bank wallet token balance
spl-token balance 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq

# Token supply
spl-token supply 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq
```

### Transfer Tokens (Manual)
```bash
# Transfer 50 EVT to a user wallet
spl-token transfer 4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq <USER_WALLET_ADDRESS> 50
```

### Switch Wallets
```bash
# Use bank wallet
solana config set --keypair ~/bank-wallet.json

# Use merchant wallet
solana config set --keypair ~/merchant-wallet.json
```

---

## Next Steps

1. ✅ Blockchain setup COMPLETE (Tasks 1-4)
2. ✅ Web3Auth configured (Task 9)
3. ⏳ Build Android development client (Task 18)
4. ⏳ Test complete flow (Task 19)

---

## Security Notes

⚠️ **IMPORTANT**:
- These wallets use **Devnet only** (testnet, not real money)
- Never use these wallets on Solana Mainnet
- Never share seed phrases with anyone
- Keep backup copies of these files in a secure location
- The token address cannot be recovered if lost

---

*Generated: 2026-01-13*
*Network: Solana Devnet*
