# Technology Stack

**Analysis Date:** 2025-01-16

## Languages

**Primary:**
- TypeScript 5.3.3 - Mobile app (event-wallet), backend services (backend, merchant)
- JavaScript (ES2020) - Solana POC backend (solana-poc/backend)

**Secondary:**
- JSON - Configuration files (package.json, tsconfig.json, app.json)
- Shell scripts - Build automation, setup scripts

## Runtime

**Environment:**
- Node.js v22.12.0
- npm 10.9.0

**Package Manager:**
- npm
- Lockfile: package-lock.json (present in all projects)

## Frameworks

**Core:**

**Mobile (event-wallet):**
- React Native 0.74.5 - Mobile framework
- Expo 51.0.0 - Development tooling and build pipeline
- Expo Dev Client 4.0.0 - Custom development client (cannot use Expo Go)
- React 18.2.0 - UI library

**Backend Services:**
- Express 4.18.2 - HTTP server framework (backend, merchant, solana-poc)

**Navigation (Mobile):**
- React Navigation 6.1.0 - Screen navigation
  - @react-navigation/native
  - @react-navigation/native-stack

**Testing:**
- Jest 30.2.0 - Test runner (backend, merchant)
- Jest 29.7.0 - Test runner (solana-poc)
- ts-jest 29.4.6 - TypeScript preprocessor
- Supertest 7.2.2 - HTTP endpoint testing

**Build/Dev:**
- TypeScript 5.2.2 / 5.3.3 - Type checking and compilation
- ts-node 10.9.1 - TypeScript execution
- Metro Bundler - React Native bundler (via Expo)

## Key Dependencies

**Critical:**

**Blockchain & Solana:**
- @solana/web3.js 1.95.0 - Solana RPC interaction and transaction building
- @solana/spl-token 0.4.0 / 0.4.14 - SPL token operations (transfers, associated token accounts)
  - Used across all services for token operations

**Authentication (Mobile):**
- @web3auth/react-native-sdk 8.1.0 - Gmail OAuth to key derivation
- @web3auth/base 8.12.0 - Web3Auth base interfaces
- @toruslabs/react-native-web-browser 1.0.0 - OAuth browser session handling
  - Converts Gmail OAuth to Solana private key
  - Currently in TEST_MODE (mocked) in event-wallet/src/contexts/Web3AuthContext.tsx

**Camera & QR:**
- react-native-vision-camera 4.7.3 - Camera access and QR scanning
- QR code scanning via useCodeScanner hook
- qrcode 1.5.3 (merchant) - QR code generation for payment URLs

**Crypto Polyfills (Mobile):**
- buffer 6.0.3 - Node.js Buffer polyfill for React Native
- react-native-buffer 6.0.3 - Buffer implementation
- crypto-browserify 3.12.1 - Crypto API polyfill
- stream-browserify 3.0.0 - Stream API polyfill
- react-native-get-random-values 1.11.0 - getRandomValues polyfill
- events 3.3.0 - EventEmitter polyfill
- bip39 3.1.0 - BIP39 mnemonic generation
- ed25519-hd-key 1.3.0 - Ed25519 key derivation

**Infrastructure:**
- cors 2.8.5 - CORS middleware for backend services
- express-rate-limit 8.2.1 - API rate limiting
- dotenv 16.3.1 / 16.4.5 - Environment configuration
- @react-native-async-storage/async-storage 1.23.1 - Persistent key-value storage for mobile

**React Native Core Modules:**
- react-native-safe-area-context 4.10.5 - Safe area handling
- react-native-screens 3.31.0 - Optimized screen navigation
- react-native-gesture-handler 2.16.1 - Touch gestures
- react-native-url-polyfill 1.3.0 - URL polyfill for React Native

## Configuration

**Environment:**
- dotenv (.env files in backend/, merchant/, solana-poc/)
- Key configs required:
  - BANK_WALLET_PATH (backend) - Path to bank wallet keypair JSON
  - TOKEN_ADDRESS (all services) - SPL token mint address
  - MERCHANT_WALLET (merchant) - Merchant wallet address
  - ENCRYPTION_KEY (solana-poc) - 32-byte hex for shard encryption
  - SOLANA_RPC_URL (optional) - Defaults to devnet

**Build:**

**Mobile (event-wallet):**
- app.json - Expo app configuration
  - Android package: com.eventwallet.app
  - iOS bundle: com.eventwallet.app
  - Web3Auth Client ID: BF_3EwSny_eyZmyDHMK-FOv1mu3Zrt7gRB5G9TQQtoBYmo_2Hww_Yd6l0xCqKBLadXIM0ZVEKNCwfAxaqvHc648
  - Custom scheme: eventwallet://
- tsconfig.json - TypeScript config (extends expo/tsconfig.base)
- metro.config.js - Metro bundler configuration

**Backend Services:**
- tsconfig.json - TypeScript compilation
  - Target: ES2020
  - Module: commonjs
  - OutDir: ./dist
  - Strict mode enabled
- jest.config.js - Test configuration

## Platform Requirements

**Development:**

**Mobile (event-wallet):**
- Android Studio with Android SDK
- Android emulator or physical device
- Cannot use Expo Go (requires custom dev client due to crypto libraries)
- Node.js 18+ and npm 9+

**Backend Services:**
- Node.js 18+
- Solana CLI (for blockchain setup)
- File system access for wallet keypair storage

**Production:**
- Mobile: Android APK/IPA built via EAS Build or local build
- Backend: Node.js server (Linux/macOS/Windows)
- Solana Devnet RPC access

---

*Stack analysis: 2025-01-16*
