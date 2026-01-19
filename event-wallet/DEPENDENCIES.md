# Dependencies Documentation

## Overview

This document outlines all critical dependencies for the Event Wallet React Native app, their purposes, and compatibility requirements.

## Critical Dependencies

### Web3Auth & Authentication
- **@web3auth/react-native-sdk@^8.1.0**: Core Web3Auth SDK for Gmail OAuth authentication
- **@web3auth/base@^8.12.0**: Base Web3Auth types and interfaces (must match SDK version)
- **@toruslabs/react-native-web-browser@^1.0.0**: Web browser for OAuth flow handling

### Solana Blockchain
- **@solana/web3.js@^1.95.0**: Solana RPC client for blockchain interaction
- **@solana/spl-token@^0.4.0**: SPL token operations for Event Token

### Expo & React Native
- **expo@~51.0.0**: Expo SDK (must be 51.x for React Native 0.74.5 compatibility)
- **expo-dev-client@~4.0.0**: Custom development client (required for crypto libraries)
- **react-native@0.74.5**: React Native framework (exact version required)
- **react@18.2.0**: React library (exact version required)

### Camera & QR Scanning
- **react-native-vision-camera@^4.7.3**: Camera access and QR code scanning
  - Requires camera permission in AndroidManifest.xml
  - Configured in app.json plugins

### Navigation
- **@react-navigation/native@^6.1.0**: Core navigation library
- **@react-navigation/native-stack@^6.9.0**: Stack navigation
- **react-native-screens@~3.31.0**: Native screen optimization
- **react-native-safe-area-context@4.10.5**: Safe area handling
- **react-native-gesture-handler@~2.16.1**: Gesture handling (MUST be ~2.16.1 for Expo 51)

### Crypto Polyfills (CRITICAL)
These must be imported BEFORE any other code in App.tsx:
- **react-native-get-random-values@^1.11.0**: Cryptographically secure random values
- **react-native-buffer@^6.0.3**: Buffer polyfill for Node.js compatibility
- **react-native-url-polyfill@^1.3.0**: URL polyfill for Web3Auth

### Storage
- **@react-native-async-storage/async-storage@1.23.1**: Persistent storage (exact version required)

### Utilities
- **bip39@^3.1.0**: Mnemonic phrase generation/validation
- **ed25519-hd-key@^1.3.0**: Ed25519 key derivation from mnemonics
- **typescript@~5.3.3**: TypeScript compiler

## Version Constraints

### Expo SDK 51 Compatibility
The following versions are EXACTLY pinned for Expo SDK 51 compatibility:
```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.5",
  "react": "18.2.0",
  "@react-native-async-storage/async-storage": "1.23.1",
  "react-native-gesture-handler": "~2.16.1",
  "react-native-screens": "~3.31.0"
}
```

### Web3Auth Version Alignment
```json
{
  "@web3auth/react-native-sdk": "^8.1.0",
  "@web3auth/base": "^8.12.0"
}
```

**IMPORTANT**: @web3auth/base is installed as a peer dependency at version 8.12.4 by @web3auth/react-native-sdk 8.1.0. The package.json specifies ^8.12.0 to ensure compatibility.

## Known Issues & Fixes

### 1. Module Resolution in Metro Bundler

**Problem**: Web3Auth SDK has nested node_modules that cause Metro to fail resolving imports.

**Fix**: metro.config.js includes:
- `extraNodeModules` to force top-level resolution
- `blockList` to exclude nested node_modules
- Additional source extensions (.mjs, .cjs)

### 2. Gesture Handler Import Order

**Problem**: React Navigation crashes if gesture-handler is not imported first.

**Fix**: App.tsx imports gesture-handler before any other imports:
```typescript
import 'react-native-gesture-handler';
```

### 3. Crypto Polyfills Required

**Problem**: React Native lacks Node.js crypto APIs needed by Web3Auth and Solana libraries.

**Fix**: polyfills.ts is imported before all other code:
```typescript
import './polyfills';
```

The polyfill file provides:
- Buffer global
- process.env
- URL polyfill (react-native-url-polyfill/auto)
- crypto.getRandomValues

### 4. Web3Auth WebBrowser Integration

**Problem**: Web3Auth expects a WebBrowser module with specific methods.

**Fix**: Web3AuthContext.tsx creates a WebBrowser object:
```typescript
const WebBrowser = {
  openAuthSessionAsync,
  dismissAuthSession,
};
```

### 5. SolanaPrivateKeyProvider Implementation

**Problem**: Web3Auth requires a privateKeyProvider that implements IBaseProvider interface.

**Fix**: Custom SolanaPrivateKeyProvider class extends SafeEventEmitter and implements required methods.

## Dependency Installation

### First-time Setup
```bash
npm install
```

### Clean Install (if issues occur)
```bash
npm run clean
npm install
```

### Fix Expo Dependency Mismatches
```bash
npm run deps:fix
```

### Check for Dependency Issues
```bash
npm run deps:check
```

## Native Module Linking

Most native modules are auto-linked by Expo CLI. However, some require manual configuration:

### react-native-vision-camera
- Configured in app.json plugins
- Requires camera permission in AndroidManifest.xml

### react-native-gesture-handler
- Must be imported first in App.tsx
- Configured in metro.config.js extraNodeModules

## Android Build Dependencies

### Gradle Configuration
- Build Tools: 34.0.0
- Compile SDK: 34
- Target SDK: 34
- Min SDK: 23
- NDK: 26.1.10909125

### Key Gradle Files
- `/android/build.gradle`: Project-level configuration
- `/android/app/build.gradle`: App-level configuration
- `/android/settings.gradle`: Module and autolinking configuration
- `/android/gradle.properties`: Build optimization settings

### Native Modules
Native modules are auto-linked by React Native's autolinking system. The following commands can verify linkage:

```bash
# List all native modules
npx react-native config

# Re-run autolinking
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

## Troubleshooting

### Build Errors

**Error**: "Unable to resolve module 'react-native-url-polyfill'"
```bash
npm run clean
npm install
npm start -- --clear-cache
```

**Error**: "Web3Auth initialization failed"
- Check that @web3auth/base version matches SDK
- Verify WebBrowser is properly configured in Web3AuthContext
- Ensure redirect URL scheme matches app.json

**Error**: "Cannot read property 'bind' of undefined"
- This occurs in SolanaPrivateKeyProvider constructor
- Fixed by not binding methods in constructor (SafeEventEmitter handles this)

### Runtime Errors

**Error**: "Buffer is not defined"
- Ensure polyfills.ts is imported first in App.tsx
- Check that react-native-buffer is installed

**Error**: "crypto.getRandomValues is not a function"
- Verify react-native-get-random-values is imported in polyfills.ts
- Check that crypto polyfill is properly set up

### Metro Bundler Issues

**Error**: Module resolution fails for Web3Auth packages
- Clear Metro cache: `npm start -- --clear-cache`
- Verify metro.config.js has blockList configured
- Check extraNodeModules paths are correct

**Error**: "Unable to resolve module @toruslabs/openlogin-jrpc"
- This is installed as a nested dependency of @web3auth/base
- Verify npm install completed successfully
- Try: `rm -rf node_modules && npm install`

## Verification Steps

After installing dependencies, verify the setup:

1. **Check package versions**:
```bash
npm list @web3auth/react-native-sdk @web3auth/base @solana/web3.js
```

2. **Verify Expo compatibility**:
```bash
npm run deps:check
```

3. **Test Metro bundler**:
```bash
npm start
```
- Open http://localhost:8081 to verify Metro is running
- Check console for any module resolution errors

4. **Verify native modules** (Android):
```bash
npm run android
```
- First build will take longer as Gradle downloads dependencies
- Check for "FAILED" messages in build output

## Version History

### Current (2025-01-14)
- Updated @web3auth/base from ^8.1.0 to ^8.12.0 (matches installed 8.12.4)
- Pinned react-native-gesture-handler to ~2.16.1 for Expo 51 compatibility
- Pinned @react-native-async-storage/async-storage to 1.23.1 for Expo 51 compatibility
- Enhanced metro.config.js with blockList and extraNodeModules
- Added utility scripts for dependency management

## References

- Expo SDK 51 Release Notes: https://blog.expo.dev/expo-sdk-51
- Web3Auth React Native Docs: https://web3auth.io/docs/sdk/native-sdk/react-native
- React Native 0.74 Upgrade Guide: https://react-native.dev/blog/2024/05/16/release-0.74
