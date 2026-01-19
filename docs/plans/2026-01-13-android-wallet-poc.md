# Android Wallet POC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Android POC app proving "Gmail Login → Wallet → Simulated Visa → QR Payment" flow using Solana Devnet.

**Architecture:**
- React Native app via Expo with custom development client
- Web3Auth for Gmail → wallet key derivation
- Solana Devnet for token transactions (no real money)
- Simulated backend for "Visa top-up" (transfers from bank wallet)
- Merchant web page generates Solana Pay QR codes

**Tech Stack:**
- Expo SDK 50+ with custom dev client
- React Native
- @solana/web3.js, @solana/spl-token
- @web3auth/react-native-sdk
- expo-camera, expo-barcode-scanner
- Node.js backend scripts

---

## Prerequisites & Setup

### Task 1: Verify Prerequisites

**Step 1: Check Node.js version**

Run: `node --version`
Expected: v18+ (if not, install from nodejs.org)

**Step 2: Check/install Solana CLI**

Run: `solana --version`
If missing, install:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

**Step 3: Verify Android Studio**

Run: `adb devices`
Expected: List of devices or empty list (not command not found)

---

## Phase 1: Blockchain Setup (Solana Devnet)

### Task 2: Configure Solana for Devnet

**Step 1: Set Solana config to Devnet**

Run: `solana config set --url devnet`
Expected: `Config File: /path/to/config.yml, RPC URL: https://api.devnet.solana.com`

**Step 2: Verify config**

Run: `solana config get`
Expected: Shows `RPC URL: https://api.devnet.solana.com`

---

### Task 3: Create Bank Wallet

**Step 1: Generate new keypair**

Run: `solana-keygen new --outfile ~/bank-wallet.json --no-passphrase`
Expected: `Generating new keypair... Saved to ~/bank-wallet.json`

**Step 2: Set as default keypair**

Run: `solana config set --keypair ~/bank-wallet.json`
Expected: Config updated

**Step 3: Request airdrop**

Run: `solana airdrop 2`
Expected: `Signature: <signature>`, `2 SOL` confirmed

**Step 4: Verify balance**

Run: `solana balance`
Expected: `2 SOL`

---

### Task 4: Create Event Token

**Step 1: Create SPL Token**

Run: `spl-token create-token`
Expected: `Creating token <TOKEN_ADDRESS>`
**IMPORTANT:** Save the token address! Store it in `desc.md` or a notes file.

**Step 2: Create token account for bank wallet**

Run: `spl-token create-account <TOKEN_ADDRESS>`
Expected: `Creating account <ACCOUNT_ADDRESS>`

**Step 3: Mint initial supply**

Run: `spl-token mint <TOKEN_ADDRESS> 1000000`
Expected: `Minted 1000000 tokens`

**Step 4: Verify mint authority**

Run: `spl-token authorize <TOKEN_ADDRESS> mint --disable`
Expected: Mint authority disabled (prevents more minting)

**Document the token address:**

Create: `/Users/jm/Codebase/dcwlt/blockchain-notes.md`
```markdown
# Blockchain Setup Notes

## Token Details
- **Token Address**: <paste from spl-token create-token output>
- **Token Account**: <paste from spl-token create-account output>
- **Bank Wallet Pubkey**: <run `solana address` and paste>

## Commands Reference
```bash
# Check token supply
spl-token supply <TOKEN_ADDRESS>

# Check bank wallet balance
spl-token balance <TOKEN_ADDRESS>

# Transfer tokens to user (for top-up simulation)
spl-token transfer <TOKEN_ADDRESS> <USER_WALLET_ADDRESS> 50
```
```

---

## Phase 2: Initialize Expo App

### Task 5: Create Expo Project

**Step 1: Create project directory**

Run:
```bash
cd /Users/jm/Codebase/dcwlt
npx create-expo-app@latest event-wallet --template blank-typescript
```
Expected: Project created in `event-wallet/`

**Step 2: Enter project**

Run: `cd event-wallet`

**Step 3: Verify structure**

Run: `ls -la`
Expected: `app.json`, `package.json`, `App.tsx`, `assets/`

---

### Task 6: Install Dependencies

**Step 1: Install Solana libraries**

Run:
```bash
npm install @solana/web3.js @solana/spl-token
```
Expected: Packages installed

**Step 2: Install Web3Auth**

Run:
```bash
npm install @web3auth/react-native-sdk @web3auth/base
```
Expected: Packages installed

**Step 3: Install camera libraries**

Run:
```bash
npm install expo-camera expo-barcode-scanner
```
Expected: Packages installed

**Step 4: Install polyfills**

Run:
```bash
npm install react-native-get-random-values react-native-buffer @react-native-async-storage/async-storage react-native-url-polyfill
```
Expected: Packages installed

---

### Task 7: Create Crypto Polyfills

**Step 1: Create polyfill file**

Create: `event-wallet/polyfills.ts`
```typescript
// Polyfills for React Native crypto operations
import 'react-native-get-random-values';
import { Buffer } from 'react-native-buffer';

// Global polyfills
global.Buffer = Buffer;
global.localStorage = require('@react-native-async-storage/async-storage').default;

// URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Subtle crypto polyfill
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as any;
}
```

**Step 2: Import polyfills in App.tsx**

Modify: `event-wallet/App.tsx`
```typescript
// Add at the very top, before all other imports
import './polyfills';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// ... rest of file
```

**Step 3: Test the app runs**

Run: `npx expo start --no-dev --minify`
Expected: Expo dev tools opens, no polyfill errors

**Step 4: Stop server**

Press: `Ctrl+C`

---

## Phase 3: Web3Auth Integration

### Task 8: Configure App.json for Web3Auth

**Step 1: Update app.json with Android config**

Modify: `event-wallet/app.json`
```json
{
  "expo": {
    "name": "Event Wallet",
    "slug": "event-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.eventwallet.app",
      "permissions": [
        "INTERNET",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@web3auth/react-native-sdk"
    ],
    "scheme": "eventwallet",
    "extra": {
      "web3authClientId": "YOUR_WEB3AUTH_CLIENT_ID_HERE"
    }
  }
}
```

**Step 2: Commit app.json**

Run:
```bash
cd event-wallet
git add app.json
git commit -m "config: add Android permissions and Web3Auth plugin"
```

---

### Task 9: Get Web3Auth Credentials

**Step 1: Go to Web3Auth Dashboard**

Open: https://dashboard.web3auth.io

**Step 2: Create project**

- Click "Create Project"
- Name: "Event Wallet POC"
- Network: "Testnet" (Sapphire Devnet)
- Chain: "Solana"
- Click "Create"

**Step 3: Get Client ID**

- Copy the "Client ID" from project details
- Update `app.json` extra.web3authClientId with this value

**Step 4: Configure Google redirect**

- In Web3Auth Dashboard, go to "Whitelist URL"
- Add: `eventwallet://auth`
- Save

---

### Task 10: Create Web3Auth Service

**Step 1: Create Web3Auth context**

Create: `event-wallet/src/contexts/Web3AuthContext.tsx`
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Auth, Web3AuthOptions } from '@web3auth/react-native-sdk';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { SolanaWallet } from '@web3auth/solana-provider';

interface Web3AuthContextType {
  web3auth: Web3Auth | null;
  privateKey: string | null;
  walletAddress: string | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const clientId = Constants.expoConfig?.extra?.web3authClientId as string;

      const options: Web3AuthOptions = {
        clientId,
        network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: '0x3', // Devnet
          rpcTarget: 'https://api.devnet.solana.com',
          displayName: 'Solana Devnet',
          blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
          ticker: 'SOL',
          tickerName: 'Solana',
        },
      };

      const web3AuthInstance = new Web3Auth(options);
      await web3AuthInstance.init();
      setWeb3auth(web3AuthInstance);

      if (web3AuthInstance.connected) {
        await getUserInfo(web3AuthInstance);
      }
    } catch (error) {
      console.error('Web3Auth init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (web3AuthInstance: Web3Auth) => {
    try {
      const key = await web3AuthInstance.privKey;
      setPrivateKey(key);

      // Derive Solana address from private key
      if (key) {
        // We'll implement this in the next task
        const address = await deriveSolanaAddress(key);
        setWalletAddress(address);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const login = async () => {
    if (!web3auth) return;

    try {
      await web3auth.login();
      await getUserInfo(web3auth);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!web3auth) return;

    try {
      await web3auth.logout();
      setPrivateKey(null);
      setWalletAddress(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3auth,
        privateKey,
        walletAddress,
        isLoggedIn,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthProvider');
  }
  return context;
}
```

**Step 2: Create utility for Solana key derivation**

Create: `event-wallet/src/utils/solana.ts`
```typescript
import { Keypair, PublicKey } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

// Derive Solana address from private key
export async function deriveSolanaAddress(privateKey: string): Promise<string> {
  try {
    // Convert hex private key to keypair
    const keypair = Keypair.fromSecretKey(
      Buffer.from(privateKey, 'hex')
    );
    return keypair.publicKey.toBase58();
  } catch (error) {
    console.error('Error deriving address:', error);
    throw error;
  }
}

// Get keypair from private key
export function getKeypairFromPrivateKey(privateKey: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(privateKey, 'hex')
  );
}
```

**Step 3: Add missing dependencies**

Run:
```bash
cd event-wallet
npm install ed25519-hd-key bip39 @types/bip39
```

**Step 4: Update polyfills.ts to import Constants**

Modify: `event-wallet/polyfills.ts`
```typescript
// Add this import
import * as Constants from 'expo-constants';

// Polyfills for React Native crypto operations
// ... rest of file
```

**Step 5: Commit Web3Auth context**

Run:
```bash
git add src/
git commit -m "feat: add Web3Auth context and Solana utilities"
```

---

## Phase 4: UI - Login Screen

### Task 11: Create Login Screen Component

**Step 1: Create login component**

Create: `event-wallet/src/screens/LoginScreen.tsx`
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWeb3Auth } from '../contexts/Web3AuthContext';

export function LoginScreen() {
  const { login, isLoading } = useWeb3Auth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9945FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Wallet</Text>
      <Text style={styles.subtitle}>Pay with crypto at events</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Powered by Solana & Web3Auth</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9945FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    position: 'absolute',
    bottom: 30,
  },
});
```

**Step 2: Commit login screen**

Run:
```bash
git add src/screens/
git commit -m "feat: add login screen component"
```

---

## Phase 5: UI - Wallet Dashboard

### Task 12: Create Wallet Dashboard

**Step 1: Create dashboard component**

Create: `event-wallet/src/screens/DashboardScreen.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_ADDRESS } from '../config/constants';

interface TokenBalance {
  amount: number;
  decimals: number;
}

export function DashboardScreen() {
  const { walletAddress, logout } = useWeb3Auth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const fetchBalance = async () => {
    try {
      const connection = new Connection('https://api.devnet.solana.com');
      const tokenMint = new PublicKey(TOKEN_ADDRESS);

      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(walletAddress!),
        { mint: tokenMint }
      );

      if (tokenAccounts.value.length > 0) {
        const accountData = tokenAccounts.value[0].account.data.parsed;
        const balanceAmount = accountData.info.tokenAmount.amount;
        setBalance(parseFloat(balanceAmount) / 1e9); // Assuming 9 decimals
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTopUp = async () => {
    // This will call the backend API (created in Task 15)
    try {
      alert('Top-up simulation: 50 tokens will be sent to your wallet');
      // In real implementation, call backend API here
      setTimeout(() => {
        setBalance(prev => prev + 50);
      }, 2000);
    } catch (error) {
      console.error('Top-up failed:', error);
      alert('Top-up failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Event Tokens Balance</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#9945FF" />
        ) : (
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} EVT</Text>
        )}
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <Text style={styles.addressText} numberOfLines={1}>
          {walletAddress}
        </Text>
      </View>

      <TouchableOpacity style={styles.topUpButton} onPress={handleSimulateTopUp}>
        <Text style={styles.topUpButtonText}>Simulate Top Up</Text>
        <Text style={styles.topUpButtonSubtext}>Get 50 Event Tokens</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {/* Navigate to QR scanner */}}
      >
        <Text style={styles.scanButtonText}>Scan to Pay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    color: '#9945FF',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#9945FF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  topUpButton: {
    backgroundColor: '#14F195',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  topUpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topUpButtonSubtext: {
    color: '#000',
    fontSize: 12,
    marginTop: 5,
  },
  scanButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9945FF',
  },
  scanButtonText: {
    color: '#9945FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

**Step 2: Create constants file**

Create: `event-wallet/src/config/constants.ts`
```typescript
// Token address from Task 4 - UPDATE THIS WITH YOUR TOKEN ADDRESS
export const TOKEN_ADDRESS = 'YOUR_TOKEN_ADDRESS_FROM_STEP_4';

export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const SOLANA_DEVNET_EXPLORER = 'https://explorer.solana.com/?cluster=devnet';
```

**Step 3: Commit dashboard**

Run:
```bash
git add src/
git commit -m "feat: add wallet dashboard with balance display"
```

---

### Task 13: Create Navigation Structure

**Step 1: Install navigation dependencies**

Run:
```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

**Step 2: Create navigation structure**

Create: `event-wallet/src/navigation/AppNavigator.tsx`
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { isLoggedIn, isLoading } = useWeb3Auth();

  if (isLoading) {
    // Return loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Step 3: Update App.tsx**

Modify: `event-wallet/App.tsx`
```typescript
import './polyfills';
import { StatusBar } from 'expo-status-bar';
import { Web3AuthProvider } from './src/contexts/Web3AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Web3AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </Web3AuthProvider>
  );
}
```

**Step 4: Commit navigation**

Run:
```bash
git add src/ App.tsx
git commit -m "feat: add navigation structure with auth flow"
```

---

## Phase 6: QR Scanner

### Task 14: Create QR Scanner Component

**Step 1: Create QR scanner screen**

Create: `event-wallet/src/screens/QRScannerScreen.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraViewProps } from 'expo-camera';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { TOKEN_ADDRESS, SOLANA_DEVNET_RPC } from '../config/constants';

export function QRScannerScreen({ navigation }: any) {
  const [scanned, setScanned] = useState(false);
  const { privateKey } = useWeb3Auth();

  useEffect(() => {
    setScanned(false);
  }, []);

  const handleBarCodeScanned: CameraViewProps['onBarcodeScanned'] = async ({ data }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Parse Solana Pay URL: solana:<address>?amount=X&spl-token=<token>
      const url = new URL(data);

      if (url.protocol !== 'solana:') {
        Alert.alert('Error', 'Invalid payment URL');
        return;
      }

      const merchantAddress = url.pathname;
      const amount = url.searchParams.get('amount');
      const splToken = url.searchParams.get('spl-token');

      if (!amount || !merchantAddress) {
        Alert.alert('Error', 'Invalid payment data');
        return;
      }

      // Confirm payment
      Alert.alert(
        'Confirm Payment',
        `Pay ${amount} Event Tokens?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' },
          {
            text: 'Pay',
            onPress: () => processPayment(merchantAddress, parseFloat(amount))
          }
        ]
      );
    } catch (error) {
      console.error('Error scanning QR:', error);
      Alert.alert('Error', 'Failed to process QR code');
      setScanned(false);
    }
  };

  const processPayment = async (merchantAddress: string, amount: number) => {
    try {
      if (!privateKey) {
        throw new Error('Not logged in');
      }

      const connection = new Connection(SOLANA_DEVNET_RPC);
      const fromWallet = getKeypairFromPrivateKey(privateKey);
      const toWallet = new PublicKey(merchantAddress);
      const tokenMint = new PublicKey(TOKEN_ADDRESS);

      // Get associated token accounts
      const fromATA = await getAssociatedTokenAddress(tokenMint, fromWallet.publicKey);
      const toATA = await getAssociatedTokenAddress(tokenMint, toWallet);

      // Create transfer instruction
      const instruction = createTransferInstruction(
        fromATA,
        toATA,
        fromWallet.publicKey,
        amount * 1e9 // Convert to smallest unit
      );

      // Create and sign transaction
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = fromWallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await connection.sendTransaction(transaction, [fromWallet]);

      Alert.alert(
        'Payment Successful!',
        `Sent ${amount} EVT\nSignature: ${signature}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', error.message);
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea} />
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles instructionText}>Align QR code within frame</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Helper function (move to utils/solana.ts in production)
function getKeypairFromPrivateKey(privateKey: string) {
  const { Keypair } = require('@solana/web3.js');
  return Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 2: Update Dashboard to navigate to scanner**

Modify: `event-wallet/src/screens/DashboardScreen.tsx`
```typescript
// Add navigation prop
import { useNavigation } from '@react-navigation/native';

// Inside component
const navigation = useNavigation();

// Update scanButton onPress
<TouchableOpacity
  style={styles.scanButton}
  onPress={() => navigation.navigate('QRScanner' as never)}
>
```

**Step 3: Commit QR scanner**

Run:
```bash
git add src/
git commit -m "feat: add QR code scanner for payments"
```

---

## Phase 7: Backend Top-Up Simulation

### Task 15: Create Backend for Top-Up

**Step 1: Create backend directory**

Run:
```bash
cd /Users/jm/Codebase/dcwlt
mkdir -p backend/src
cd backend
npm init -y
```

**Step 2: Install backend dependencies**

Run:
```bash
npm install @solana/web3.js @solana/spl-token express cors dotenv bs58
npm install --save-dev typescript @types/node @types/express @types/cors ts-node
```

**Step 3: Create tsconfig.json**

Create: `/Users/jm/Codebase/dcwlt/backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

**Step 4: Create environment file**

Create: `/Users/jm/Codebase/dcwlt/backend/.env`
```bash
# Bank wallet keypair path
BANK_WALLET_PATH=/Users/jm/bank-wallet.json

# Token address from Task 4
TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

**Step 5: Create top-up endpoint**

Create: `/Users/jm/Codebase/dcwlt/backend/src/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import fs from 'fs';
import bs58 from 'bs58';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load bank wallet
const bankWalletKeypair = loadBankWallet();

function loadBankWallet(): Keypair {
  const secretKey = JSON.parse(
    fs.readFileSync(process.env.BANK_WALLET_PATH!, 'utf8')
  );
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

// Top-up endpoint
app.post('/api/topup', async (req, res) => {
  try {
    const { walletAddress, amount = 50 } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    const connection = new Connection('https://api.devnet.solana.com');
    const tokenMint = new PublicKey(process.env.TOKEN_ADDRESS!);
    const toWallet = new PublicKey(walletAddress);

    // Get associated token accounts
    const fromATA = await getAssociatedTokenAddress(
      tokenMint,
      bankWalletKeypair.publicKey
    );
    const toATA = await getAssociatedTokenAddress(tokenMint, toWallet);

    // Create transfer instruction
    const instruction = createTransferInstruction(
      fromATA,
      toATA,
      bankWalletKeypair.publicKey,
      amount * 1e9 // Convert to smallest unit (assuming 9 decimals)
    );

    // Create and sign transaction
    const { Transaction, SystemProgram } = require('@solana/web3.js');
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = bankWalletKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign and send
    const signature = await connection.sendTransaction(transaction, [bankWalletKeypair]);

    res.json({
      success: true,
      signature,
      amount,
      message: `Sent ${amount} Event Tokens`
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

**Step 6: Update package.json with scripts**

Modify: `/Users/jm/Codebase/dcwlt/backend/package.json`
```json
{
  "name": "event-wallet-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  },
  "dependencies": {
    "@solana/spl-token": "^0.3.9",
    "@solana/web3.js": "^1.87.6",
    "bs58": "^5.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.15",
    "@types/express": "^4.17.20",
    "@types/node": "^20.9.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```

**Step 7: Create backend README**

Create: `/Users/jm/Codebase/dcwlt/backend/README.md`
```markdown
# Event Wallet Backend

Simple backend for simulating Visa top-up by transferring tokens from bank wallet.

## Setup

1. Copy `.env` and update values:
   - `BANK_WALLET_PATH`: Path to bank wallet JSON
   - `TOKEN_ADDRESS`: Your Event Token address

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run:
   ```bash
   npm run dev
   ```

## API

### POST /api/topup

Transfer Event Tokens to user wallet.

**Request:**
```json
{
  "walletAddress": "user_wallet_publickey",
  "amount": 50
}
```

**Response:**
```json
{
  "success": true,
  "signature": "transaction_signature",
  "amount": 50,
  "message": "Sent 50 Event Tokens"
}
```
```

**Step 8: Commit backend**

Run:
```bash
cd /Users/jm/Codebase/dcwlt/backend
git add .
git commit -m "feat: add backend top-up endpoint"
```

---

### Task 16: Integrate Top-Up with App

**Step 1: Create API service**

Create: `event-wallet/src/services/api.ts`
```typescript
const API_BASE = 'http://localhost:3000'; // Update with your backend URL

export interface TopUpResponse {
  success: boolean;
  signature?: string;
  amount?: number;
  message?: string;
  error?: string;
}

export async function topUpWallet(
  walletAddress: string,
  amount: number = 50
): Promise<TopUpResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, amount }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Top-up API error:', error);
    return {
      success: false,
      error: 'Failed to connect to backend',
    };
  }
}
```

**Step 2: Update Dashboard to use real API**

Modify: `event-wallet/src/screens/DashboardScreen.tsx`
```typescript
import { topUpWallet } from '../services/api';

// Replace handleSimulateTopUp with:
const handleSimulateTopUp = async () => {
  if (!walletAddress) {
    alert('Wallet not connected');
    return;
  }

  try {
    const result = await topUpWallet(walletAddress, 50);

    if (result.success) {
      alert(`Top-up successful!\nSent ${result.amount} Event Tokens`);
      // Refresh balance
      setTimeout(() => fetchBalance(), 3000);
    } else {
      alert(`Top-up failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Top-up error:', error);
    alert('Top-up failed');
  }
};
```

**Step 3: Commit API integration**

Run:
```bash
cd event-wallet
git add src/
git commit -m "feat: integrate backend top-up API"
```

---

## Phase 8: Merchant Web Page

### Task 17: Create Merchant QR Generator

**Step 1: Create merchant directory**

Run:
```bash
cd /Users/jm/Codebase/dcwlt
mkdir -p merchant
cd merchant
npm init -y
```

**Step 2: Install dependencies**

Run:
```bash
npm install express solana-pay qrcode dotenv
npm install --save-dev typescript @types/node @types/express @types/qrcode ts-node
```

**Step 3: Create tsconfig.json**

Create: `/Users/jm/Codebase/dcwlt/merchant/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**Step 4: Create merchant server**

Create: `/Users/jm/Codebase/dcwlt/merchant/src/server.ts`
```typescript
import express from 'express';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Merchant wallet address (create one and save here)
const MERCHANT_WALLET = process.env.MERCHANT_WALLET || 'YOUR_MERCHANT_WALLET_ADDRESS';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || 'YOUR_TOKEN_ADDRESS';

// Generate Solana Pay URL
function generateSolanaPayURL(recipient: string, amount: number, splToken: string): string {
  const url = new URL('solana:' + recipient);
  url.searchParams.set('amount', amount.toString());
  url.searchParams.set('spl-token', splToken);
  return url.toString();
}

// API to generate QR code
app.get('/api/qr/:amount', async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const solanaPayURL = generateSolanaPayURL(MERCHANT_WALLET, amount, TOKEN_ADDRESS);

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(solanaPayURL, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    res.json({
      qrCode: qrDataUrl,
      url: solanaPayURL,
      amount,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Merchant server running on http://localhost:${PORT}`);
});
```

**Step 5: Create HTML page**

Create: `/Users/jm/Codebase/dcwlt/merchant/public/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Wallet - Merchant Terminal</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .product-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
    }

    .product-button {
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .product-button:hover {
      border-color: #9945FF;
      background: #f8f5ff;
      transform: translateY(-2px);
    }

    .product-button.active {
      border-color: #9945FF;
      background: #9945FF;
      color: white;
    }

    .product-name {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .product-price {
      font-size: 18px;
      color: #9945FF;
    }

    .product-button.active .product-price {
      color: white;
    }

    .qr-container {
      text-align: center;
      display: none;
    }

    .qr-container.show {
      display: block;
    }

    .qr-image {
      margin: 20px auto;
      border-radius: 10px;
      border: 3px solid #9945FF;
    }

    .amount-display {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .status {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }

    .reset-button {
      width: 100%;
      padding: 15px;
      background: #f0f0f0;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 20px;
    }

    .reset-button:hover {
      background: #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎪 Event Terminal</h1>
    <p class="subtitle">Select item to generate payment QR</p>

    <div class="product-buttons">
      <div class="product-button" data-amount="5">
        <div class="product-name">🍺 Beer</div>
        <div class="product-price">5 EVT</div>
      </div>
      <div class="product-button" data-amount="3">
        <div class="product-name">🍕 Pizza Slice</div>
        <div class="product-price">3 EVT</div>
      </div>
      <div class="product-button" data-amount="10">
        <div class="product-name">🍔 Burger</div>
        <div class="product-price">10 EVT</div>
      </div>
      <div class="product-button" data-amount="20">
        <div class="product-name">🎟️ Event Ticket</div>
        <div class="product-price">20 EVT</div>
      </div>
    </div>

    <div class="qr-container" id="qrContainer">
      <div class="amount-display" id="amountDisplay">0 EVT</div>
      <img id="qrImage" class="qr-image" width="250" height="250">
      <p class="status">Scan with Event Wallet app</p>
    </div>

    <button class="reset-button" id="resetButton" style="display: none;">New Transaction</button>
  </div>

  <script>
    const buttons = document.querySelectorAll('.product-button');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');
    const amountDisplay = document.getElementById('amountDisplay');
    const resetButton = document.getElementById('resetButton');

    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const amount = button.dataset.amount;
        const productName = button.querySelector('.product-name').textContent;

        // Update UI
        buttons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        try {
          const response = await fetch(`/api/qr/${amount}`);
          const data = await response.json();

          if (data.qrCode) {
            qrImage.src = data.qrCode;
            amountDisplay.textContent = `${amount} EVT - ${productName}`;
            qrContainer.classList.add('show');
            resetButton.style.display = 'block';

            // Hide product buttons
            document.querySelector('.product-buttons').style.display = 'none';
          }
        } catch (error) {
          console.error('Error generating QR:', error);
          alert('Failed to generate QR code');
        }
      });
    });

    resetButton.addEventListener('click', () => {
      qrContainer.classList.remove('show');
      resetButton.style.display = 'none';
      document.querySelector('.product-buttons').style.display = 'grid';
      buttons.forEach(b => b.classList.remove('active'));
    });
  </script>
</body>
</html>
```

**Step 6: Create .env file**

Create: `/Users/jm/Codebase/dcwlt/merchant/.env`
```bash
# Generate a new wallet: solana-keygen new --outfile ~/merchant-wallet.json
# Then get address: solana-keygen pubkey ~/merchant-wallet.json
MERCHANT_WALLET=YOUR_MERCHANT_WALLET_ADDRESS

TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
```

**Step 7: Update package.json**

Modify: `/Users/jm/Codebase/dcwlt/merchant/package.json`
```json
{
  "name": "event-wallet-merchant",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "qrcode": "^1.5.3",
    "solana-pay": "^0.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.9.0",
    "@types/qrcode": "^1.5.5",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```

**Step 8: Commit merchant**

Run:
```bash
cd /Users/jm/Codebase/dcwlt/merchant
git add .
git commit -m "feat: add merchant QR generator web page"
```

---

## Phase 9: Build & Test

### Task 18: Build Development Client

**Step 1: Ensure Android device/emulator ready**

Run: `adb devices`
Expected: List of devices

**Step 2: Configure EAS for custom dev client**

Run:
```bash
cd event-wallet
npx expo install expo-dev-client
```

**Step 3: Build and run on Android**

Run:
```bash
npx expo run:android
```

Expected:
- Gradle build starts
- App installs on device
- App launches

---

### Task 19: Test Complete Flow

**Step 1: Start backend servers**

Terminal 1 (Backend):
```bash
cd /Users/jm/Codebase/dcwlt/backend
npm run dev
```

Terminal 2 (Merchant):
```bash
cd /Users/jm/Codebase/dcwlt/merchant
npm run dev
```

**Step 2: Open merchant page**

Browser: `http://localhost:3001`

**Step 3: Test on Android App**

1. Open Event Wallet app
2. Click "Continue with Google"
3. Sign in with your Gmail
4. Verify wallet address is displayed
5. Click "Simulate Top Up"
6. Wait 3 seconds
7. Verify balance shows "50.00 EVT"
8. Click "Scan to Pay"
9. Point camera at merchant QR code (for 5 EVT beer)
10. Confirm payment
11. Verify success message
12. Go back to dashboard
13. Verify balance shows "45.00 EVT"

**Step 4: Verify transaction on explorer**

Browser: `https://explorer.solana.com/?cluster=devnet`
Search: Your wallet address
Expected: See token transfer transaction

---

### Task 20: Final Documentation

**Step 1: Create project README**

Create: `/Users/jm/Codebase/dcwlt/README.md`
```markdown
# Event Wallet POC

Proof of Concept for Gmail → Wallet → QR Payment flow using Solana Devnet.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Gmail     │─────>│   Web3Auth   │─────>│ Solana      │
│   (Login)   │      │   (Key Gen)  │      │ Wallet      │
└─────────────┘      └──────────────┘      └─────────────┘
                                                      │
                                                      v
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Merchant   │<─────│    QR Pay    │<─────│   Balance   │
│  Terminal   │      │   (Scanner)  │      │  (Display)  │
└─────────────┘      └──────────────┘      └─────────────┘
```

## Project Structure

- `event-wallet/` - React Native Android app
- `backend/` - Top-up simulation server
- `merchant/` - QR code generator web page
- `blockchain-notes.md` - Token addresses and commands

## Quick Start

### 1. Setup Blockchain

```bash
# Configure Solana
solana config set --url devnet

# Create bank wallet
solana-keygen new --outfile ~/bank-wallet.json --no-passphrase
solana airdrop 2

# Create token (save address!)
spl-token create-token
spl-token create-account <TOKEN_ADDRESS>
spl-token mint <TOKEN_ADDRESS> 1000000
```

### 2. Run Backend

```bash
cd backend
npm install
cp .env.example .env  # Add your token address
npm run dev
```

### 3. Run Merchant Terminal

```bash
cd merchant
npm install
cp .env.example .env  # Add merchant wallet + token address
npm run dev
# Open http://localhost:3001
```

### 4. Run Android App

```bash
cd event-wallet
npm install
# Update src/config/constants.ts with token address
npx expo run:android
```

## Testing the Flow

1. Open app → Sign in with Gmail
2. Wallet address auto-generated
3. Click "Simulate Top Up" → Get 50 tokens
4. Click "Scan to Pay" → Scan merchant QR
5. Confirm payment → Tokens transferred

## Success Criteria

✅ Gmail login generates wallet
✅ Top-up adds tokens to balance
✅ QR scanner initiates payment
✅ Payment completes on blockchain
✅ Balance updates correctly

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript
- **Auth**: Web3Auth (Google OAuth)
- **Blockchain**: Solana Devnet, SPL Token
- **Backend**: Node.js, Express
- **Merchant**: Express, QRCode.js

## Next Steps for Production

1. Replace simulated top-up with Stripe
2. Add real merchant onboarding
3. Implement transaction history
4. Add PIN/biometric protection
5. Audit smart contracts for mainnet
6. Add proper error handling
7. Implement push notifications

## License

MIT
```

**Step 2: Commit final README**

Run:
```bash
cd /Users/jm/Codebase/dcwlt
git add README.md
git commit -m "docs: add comprehensive project README"
```

---

## Summary

This plan implements a complete POC flow:

1. **Blockchain Setup**: Create Event Token on Solana Devnet
2. **Mobile App**: Expo-based Android app with Web3Auth
3. **Authentication**: Gmail login → Wallet key generation
4. **Top-Up**: Simulated Visa payment (bank wallet transfer)
5. **Payments**: QR scanner → Solana Pay transaction
6. **Merchant**: Web page generating payment QR codes

**Estimated Tasks**: 20
**Estimated Time**: 4-6 hours for completion
**Prerequisites**: Node.js, Solana CLI, Android Studio

---

**IMPORTANT NOTES BEFORE STARTING:**

1. **Save all addresses** during Task 4 (token creation) - they cannot be recovered
2. Update `src/config/constants.ts` with your actual token address
3. Keep bank wallet JSON secure - it holds all tokens
4. Test on devnet only - no real money involved

**Files Created/Modified:**
- `event-wallet/` (new project)
- `backend/` (new project)
- `merchant/` (new project)
- `blockchain-notes.md` (configuration reference)
- `README.md` (project documentation)
