# Setup Guide

Complete setup instructions for the DCWLT development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Blockchain Setup](#blockchain-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | >= 18.x | Runtime for all services |
| npm | >= 9.x | Package manager |
| Python | >= 3.8 | Node.js build dependency |
| Java | JDK 11+ | Android build tools |
| Android Studio | Latest | Android development |
| Solana CLI | >= 1.17 | Blockchain operations |

### Operating System

- **macOS**: 11.x (Big Sur) or later
- **Linux**: Ubuntu 20.04 or later
- **Windows**: WSL2 recommended (native Windows not tested)

### Hardware Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

---

## Installation Steps

### 1. Install Node.js

```bash
# macOS (using Homebrew)
brew install node@20

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 9.x.x or higher
```

### 2. Install Solana CLI

```bash
# macOS/Linux
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version  # Should be 1.17.x or higher
```

### 3. Install Android Studio

1. Download Android Studio from [developer.android.com/studio](https://developer.android.com/studio)
2. Install and launch Android Studio
3. Run initial setup wizard
4. Install Android SDK (API level 33 or higher)
5. Create an Android Virtual Device (AVD)

```bash
# Verify installation
adb devices  # Should list connected devices/emulators
```

### 4. Clone Repository

```bash
git clone https://github.com/your-org/dcwlt.git
cd dcwlt
```

### 5. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install merchant dependencies
cd merchant
npm install
cd ..

# Install mobile app dependencies
cd event-wallet
npm install
cd ..
```

---

## Blockchain Setup

### 1. Configure Solana for Devnet

```bash
# Set RPC URL to Devnet
solana config set --url devnet

# Verify configuration
solana config
```

Expected output:
```
Config File: /Users/yourname/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/yourname/.config/solana/id.json
```

### 2. Create Bank Wallet

The bank wallet holds all Event Tokens and dispenses them during top-ups.

```bash
# Create new keypair
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase

# Generate a random keypair without prompt
solana-keygen new --outfile ~/bank-wallet.json --no-bip39-passphrase

# Set as default keypair
solana config set --keypair ~/bank-wallet.json

# Note your public key
solana address
```

⚠️ **IMPORTANT**: Save the public key output. This is your bank wallet address.

### 3. Get Devnet SOL

You need SOL for gas fees. On Devnet, SOL is free.

```bash
# Request 2 SOL airdrop
solana airdrop 2

# Check balance
solana balance
```

If airdrop fails, try again after a few seconds:
```bash
solana airdrop 2
```

### 4. Create Event Token

This creates the SPL Token that will be used for all transactions.

```bash
# Create new SPL Token
spl-token create-token

# ⚠️ SAVE THIS OUTPUT!
# Example output:
# Creating token 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
#
# Save this address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

⚠️ **CRITICAL**: Save the token address from the output. It cannot be recovered.

### 5. Create Token Account for Bank Wallet

```bash
# Replace <TOKEN_ADDRESS> with the address from step 4
spl-token create-account <TOKEN_ADDRESS>
```

### 6. Mint Tokens to Bank Wallet

```bash
# Mint 1,000,000 tokens to bank wallet
spl-token mint <TOKEN_ADDRESS> 1000000

# Verify token supply
spl-token supply <TOKEN_ADDRESS>
```

Expected output:
```
Supply: 1000000
```

### 7. Verify Token Creation

```bash
# Get token account info
spl-token accounts

# View bank token account
spl-token account <BANK_TOKEN_ACCOUNT_ADDRESS>
```

---

## Configuration

### 1. Mobile App Configuration

Edit `event-wallet/src/config/constants.ts`:

```typescript
export const RPC_URL = 'https://api.devnet.solana.com';
export const TOKEN_ADDRESS = 'YOUR_TOKEN_MINT_ADDRESS';  // From step 4 above
export const BACKEND_URL = 'http://10.0.2.2:3000';        // Android emulator localhost
export const MERCHANT_URL = 'http://10.0.2.2:3001';

// Web3Auth Configuration
export const WEB3AUTH_CLIENT_ID = 'YOUR_WEB3AUTH_CLIENT_ID';
export const WEB3AUTH_NETWORK = 'cyan';  // Testnet network
```

**Note**: `10.0.2.2` is the special IP for accessing host machine from Android emulator.

### 2. Backend Configuration

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Solana
RPC_URL=https://api.devnet.solana.com
TOKEN_ADDRESS=YOUR_TOKEN_MINT_ADDRESS

# Bank Wallet
BANK_WALLET_PATH=/Users/yourname/bank-wallet.json

# CORS (allow mobile app)
ALLOWED_ORIGINS=http://localhost:8081
```

### 3. Merchant Configuration

Create `merchant/.env`:

```env
# Server
PORT=3001

# Token
TOKEN_ADDRESS=YOUR_TOKEN_MINT_ADDRESS

# Merchant Wallet (create new one or use existing)
MERCHANT_WALLET=YOUR_MERCHANT_WALLET_ADDRESS
```

### 4. Web3Auth Setup

1. Go to [web3auth.io](https://web3auth.io)
2. Sign up/login
3. Create a new project
4. Select "React Native" as platform
5. Enable "Google" as authentication provider
6. Copy your Client ID to `event-wallet/src/config/constants.ts`

---

## Running the Application

### Development Workflow

Open 3 terminal windows:

#### Terminal 1: Backend API

```bash
cd backend
npm run dev
```

Expected output:
```
Backend API running on port 3000
```

#### Terminal 2: Merchant API

```bash
cd merchant
npm run dev
```

Expected output:
```
Merchant API running on port 3001
```

#### Terminal 3: Mobile App

```bash
cd event-wallet

# Start development server
npm start

# In another terminal, run on Android
npx expo run:android
```

This will:
1. Build the development client
2. Install on emulator/device
3. Launch the app

### Verify Setup

1. **Backend**: Visit `http://localhost:3000` - Should see "Backend API"
2. **Merchant**: Visit `http://localhost:3001` - Should see merchant dashboard
3. **Mobile**: App should launch on emulator with login screen

### Test the Flow

1. **Gmail Login**:
   - Tap "Continue with Google"
   - Complete OAuth flow
   - Verify wallet address is displayed

2. **Simulate Top-Up**:
   - Tap "Simulate Top Up"
   - Wait 3-5 seconds
   - Verify balance increases by 50 tokens

3. **QR Payment**:
   - Generate QR at `http://localhost:3001/qr?amount=50&merchant=<BANK_WALLET>`
   - Scan QR with app
   - Confirm payment
   - Verify balance decreases

---

## Troubleshooting

### Common Issues

#### 1. Solana Airdrop Fails

**Problem**: `Airdrop request failed`

**Solution**:
```bash
# Try again after a few seconds
solana airdrop 2

# Or try a different amount
solana airdrop 1

# Check current balance
solana balance
```

#### 2. Token Address Lost

**Problem**: You didn't save the token address from `spl-token create-token`

**Solution**: Unfortunately, the token address cannot be recovered. You must create a new token:

```bash
spl-token create-token
```

Then update all configuration files with the new address.

#### 3. Mobile App Can't Connect to Backend

**Problem**: `Network request failed`

**Solution**:
- Ensure backend is running on port 3000
- Check `BACKEND_URL` in `event-wallet/src/config/constants.ts`
- Use `10.0.2.2` for Android emulator, `localhost` for physical device

#### 4. Web3Auth Login Fails

**Problem**: Login redirects but doesn't return to app

**Solution**:
- Verify Client ID is correct
- Check that redirect URIs are configured in Web3Auth dashboard
- Ensure network is set to `cyan` (testnet)

#### 5. Build Errors

**Problem**: TypeScript or build errors

**Solution**:
```bash
# Clear cache
cd event-wallet
rm -rf node_modules
npm install

# Rebuild
npx expo run:android
```

#### 6. Emulator Not Detected

**Problem**: `No devices found`

**Solution**:
```bash
# List devices
adb devices

# Start emulator manually
emulator -avd <AVD_NAME>

# Or create new AVD in Android Studio
```

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/your-org/dcwlt/issues)
2. Review logs in each terminal
3. Verify all configuration files
4. Ensure all prerequisites are met

### Useful Commands

```bash
# Check Solana configuration
solana config

# Check wallet balance
solana balance

# Check token accounts
spl-token accounts

# List Android devices
adb devices

# Check Node.js version
node --version

# Check npm version
npm --version

# View logs
# Backend: Check terminal output
# Mobile: Press 'Ctrl+M' in app → Debug → Remote JS Debugging
```

---

## Verification Checklist

Before starting development, verify:

- [ ] Node.js 18+ installed
- [ ] Solana CLI 1.17+ installed
- [ ] Android Studio and SDK installed
- [ ] Bank wallet created (`~/bank-wallet.json`)
- [ ] Event Token created
- [ ] 1,000,000 tokens minted to bank wallet
- [ ] All `.env` files configured
- [ ] Token address in `constants.ts`
- [ ] Web3Auth Client ID configured
- [ ] Backend API running on port 3000
- [ ] Merchant API running on port 3001
- [ ] Mobile app builds and launches

---

## Next Steps

After successful setup:

1. Read [API Documentation](../api/README.md)
2. Review [Sequence Diagrams](../diagrams/sequence-diagrams.md)
3. Understand [Component Architecture](../architecture/components.md)
4. Follow [Implementation Plan](../plans/2025-01-13-android-wallet-poc.md)
