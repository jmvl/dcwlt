# Manual Setup Guide for Android Wallet POC

Due to security restrictions preventing subdirectory creation, this project requires manual setup following these steps.

## Prerequisites Verification

```bash
# Check Node.js (need v18+)
node --version

# Check npm
npm --version

# Check Solana CLI
solana --version

# Check Android tools
adb devices
```

## Step 1: Create Project Structure

```bash
cd /Users/jm/Codebase/dcwlt
mkdir -p event-wallet backend/src merchant/public logs
```

## Step 2: Blockchain Setup (Tasks 1-4)

```bash
# Configure Solana for Devnet
solana config set --url devnet

# Verify configuration
solana config get

# Create bank wallet (save this securely!)
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase

# Set as default keypair
solana config set --keypair ~/bank-wallet.json

# Get devnet SOL for gas
solana airdrop 2

# Verify balance
solana balance

# *** CRITICAL: SAVE THIS TOKEN ADDRESS ***
spl-token create-token

# Create token account
spl-token create-account <TOKEN_ADDRESS_FROM_ABOVE>

# Mint 1,000,000 tokens
spl-token mint <TOKEN_ADDRESS_FROM_ABOVE> 1000000

# Disable mint authority
spl-token authorize <TOKEN_ADDRESS_FROM_ABOVE> mint --disable

# Verify supply
spl-token supply <TOKEN_ADDRESS_FROM_ABOVE>
```

**IMPORTANT**: Update `blockchain-notes.md` with the token address from `spl-token create-token`.

## Step 3: Create Expo App (Task 5)

```bash
cd /Users/jm/Codebase/dcwlt/event-wallet
npx create-expo-app@latest . --template blank-typescript
```

## Step 4: Install Dependencies (Task 6)

```bash
cd /Users/jm/Codebase/dcwlt/event-wallet

# Solana libraries
npm install @solana/web3.js @solana/spl-token

# Web3Auth
npm install @web3auth/react-native-sdk @web3auth/base

# Camera
npm install expo-camera expo-barcode-scanner

# Polyfills
npm install react-native-get-random-values react-native-buffer @react-native-async-storage/async-storage react-native-url-polyfill

# Additional dependencies
npm install ed25519-hd-key bip39 @types/bip39

# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Dev client
npm install expo-dev-client
```

## Step 5: Create Backend (Task 15)

```bash
cd /Users/jm/Codebase/dcwlt/backend
npm init -y
npm install @solana/web3.js @solana/spl-token express cors dotenv bs58
npm install --save-dev typescript @types/node @types/express @types/cors ts-node
```

## Step 6: Create Merchant (Task 17)

```bash
cd /Users/jm/Codebase/dcwlt/merchant
npm init -y
npm install express solana-pay qrcode dotenv
npm install --save-dev typescript @types/node @types/express @types/qrcode ts-node
```

## Step 7: Update Configuration Files

After running the above commands, create these files:

### event-wallet/src/config/constants.ts
```typescript
// Token address from Step 2
export const TOKEN_ADDRESS = 'YOUR_TOKEN_ADDRESS_HERE';
export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
```

### backend/.env
```
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

### merchant/.env
```
MERCHANT_WALLET=YOUR_MERCHANT_WALLET_ADDRESS
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

## Step 8: Resume Ralph

After completing the above setup, Ralph should be able to continue with implementation tasks starting from Task 7.

## Why Manual Setup?

The Claude Code security policy prevents creating subdirectories in the working directory. This blocks the multi-repo structure required for this project (event-wallet/, backend/, merchant/).

Once the directory structure and dependencies are in place, Ralph can continue with:
- Task 7: Create crypto polyfills file
- Task 8-20: All remaining implementation tasks
