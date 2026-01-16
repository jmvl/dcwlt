# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Multi-Service Architecture with Client-Server Separation

**Key Characteristics:**
- Three independent Node.js services communicating via HTTP REST API
- React Native mobile app with context-based state management
- Server-side blockchain transaction signing (backend holds private keys)
- Client-side wallet key derivation via OAuth (Web3Auth)
- Lazy-loading pattern for crypto libraries to avoid polyfill race conditions

## Layers

**Mobile App (event-wallet/):**
- Purpose: Android wallet application with Gmail login and QR payment scanning
- Location: `event-wallet/src/`
- Contains: UI screens, navigation, Web3Auth context, API services, Solana utilities
- Depends on: Backend service (localhost:3000), Solana Devnet RPC, Web3Auth SDK
- Used by: End users on Android devices

**Backend Service (backend/):**
- Purpose: Simulated Visa top-up by transferring SPL tokens from bank wallet
- Location: `backend/src/server.ts`
- Contains: Express server, Solana transaction signing, rate limiting
- Depends on: Solana Devnet RPC, local filesystem (bank wallet keypair)
- Used by: Mobile app for top-up operations

**Merchant Service (merchant/):**
- Purpose: Generate Solana Pay QR codes for point-of-sale payments
- Location: `merchant/src/server.ts`
- Contains: Express server, QR code generation, Solana Pay URL formatting
- Depends on: qrcode library
- Used by: Merchants to receive payments

## Data Flow

**Authentication Flow (Web3Auth):**

1. User opens app and taps "Continue with Google"
2. Web3Auth SDK handles OAuth flow via browser
3. Web3Auth derives private key from Gmail account (MPC)
4. Private key converted to Solana Keypair in `event-wallet/src/utils/solana.ts`
5. Wallet address displayed on Dashboard screen
6. Session persisted via AsyncStorage

**Top-Up Flow (Simulated Visa):**

1. User taps "Simulate Top Up" in Dashboard screen (`event-wallet/src/screens/DashboardScreen.tsx`)
2. App calls `POST /api/topup` via `event-wallet/src/services/api.ts`
3. Backend loads bank wallet keypair from filesystem (`backend/src/server.ts`)
4. Backend creates SPL token transfer instruction using `@solana/spl-token`
5. Backend signs transaction with bank wallet private key
6. Backend sends transaction to Solana Devnet via RPC
7. Backend returns transaction signature to mobile app
8. App displays success and optionally refreshes balance

**Payment Flow (QR Scan):**

1. Merchant generates QR via `GET /api/qr/:amount` at merchant service
2. QR encodes Solana Pay URL: `solana:<address>?amount=5&spl-token=<TOKEN>`
3. User scans QR with camera in `event-wallet/src/screens/QRScannerScreen.tsx`
4. App parses URL and extracts recipient, amount, and token address
5. App creates transfer instruction from user's Web3Auth wallet
6. App signs and sends transaction to Solana Devnet
7. Balance updates on confirmation

**Balance Query Flow:**

1. Dashboard screen loads (`event-wallet/src/screens/DashboardScreen.tsx`)
2. App lazy-loads `@solana/web3.js` to avoid Buffer issues
3. App queries token accounts via `connection.getParsedTokenAccountsByOwner()`
4. App parses token amount and divides by 1e9 (9 decimals)
5. Balance displayed in UI

**State Management:**
- React Context API for global Web3Auth state (`event-wallet/src/contexts/Web3AuthContext.tsx`)
- Local component state for UI-specific data (loading, balance, toasts)
- No global state management library (Redux, MobX) - Context only

## Key Abstractions

**Web3Auth Context:**
- Purpose: Provides Gmail OAuth → Solana wallet key derivation
- Examples: `event-wallet/src/contexts/Web3AuthContext.tsx`
- Pattern: React Context with lazy-loaded Web3Auth SDK modules
- Critical: Lazy loading required to avoid Buffer polyfill race conditions

**Solana Utilities:**
- Purpose: Helper functions for Solana operations
- Examples: `event-wallet/src/utils/solana.ts`
- Pattern: All functions use dynamic imports to delay `@solana/web3.js` loading
- Functions: `deriveSolanaAddress()`, `getKeypairFromPrivateKey()`, `isValidSolanaAddress()`

**API Service Layer:**
- Purpose: Abstraction over backend HTTP endpoints
- Examples: `event-wallet/src/services/api.ts`
- Pattern: Async functions returning typed responses, error handling built-in
- Functions: `topUpWallet()`, `checkBackendHealth()`, `getBackendStatus()`

**Navigation Stack:**
- Purpose: Screen routing and authentication flow
- Examples: `event-wallet/src/navigation/AppNavigator.tsx`
- Pattern: Conditional rendering based on `isLoggedIn` state from Web3Auth context
- Routes: Login → Dashboard (after auth), Dashboard → QRScanner

## Entry Points

**Mobile App Entry Point:**
- Location: `event-wallet/App.tsx`
- Triggers: React Native app launch
- Responsibilities: Initialize polyfills, set up provider tree, render navigator
- Critical: Polyfill imports MUST be in order: buffer-polyfill → gesture-handler → polyfills

**Backend Service Entry Point:**
- Location: `backend/src/server.ts`
- Triggers: `npm run dev` or `node dist/server.js`
- Responsibilities: Configure Express, load bank wallet, register routes, start HTTP server
- Default port: 3000

**Merchant Service Entry Point:**
- Location: `merchant/src/server.ts`
- Triggers: `npm run dev` or `node dist/server.js`
- Responsibilities: Configure Express, register QR generation routes, start HTTP server
- Default port: 3001

**Polyfill Entry Points:**
- Location: `event-wallet/src/buffer-polyfill.js` (injected first by Metro)
- Location: `event-wallet/polyfills.ts` (imported second in App.tsx)
- Purpose: Ensure Buffer and crypto globals available before Web3Auth/Solana modules load
- Pattern: require() instead of import for immediate execution

## Error Handling

**Strategy:** Layered error handling with user-friendly fallbacks

**Patterns:**
- **ErrorBoundary:** Global React error boundary in `event-wallet/src/components/ErrorBoundary.tsx` catches component tree crashes
- **Try-Catch in API calls:** All async operations wrapped with specific error messages
- **Alert dialogs:** User-facing errors shown via Alert.alert() with actionable options
- **Toast notifications:** Non-intrusive feedback for operations (success/failure)
- **HTTP error responses:** Backend returns structured JSON errors with status codes
- **Console logging:** Detailed error logging in development mode

**Mobile Error Handling:**
- Network errors trigger retry prompts
- Missing configuration shows setup instructions
- Web3Auth errors guide user to re-authenticate
- Solana RPC errors handled gracefully (timeout, network)

**Backend Error Handling:**
- 400 for malformed requests (missing walletAddress, invalid amount)
- 429 for rate limit exceeded
- 500 for internal errors (wallet not configured, RPC failure)
- Detailed error messages in development mode only

## Cross-Cutting Concerns

**Logging:** Console-based logging with emoji prefixes for readability
- Mobile: `console.log()` with contextual messages
- Backend: Structured logging with emoji indicators (✅, ❌, ⏳)
- Development mode: Full error stack traces exposed

**Validation:** Input validation at multiple layers
- Mobile: Alert dialogs before sensitive operations
- Backend: Request parameter validation (walletAddress, amount)
- Solana: PublicKey validation via SDK

**Authentication:** Web3Auth-based OAuth
- Provider: Google OAuth via Web3Auth SDK
- Key derivation: MPC-based private key generation
- Session persistence: AsyncStorage
- Test mode: Mock wallet for UI testing (TEST_MODE flag)

**Rate Limiting:** Express-rate-limit middleware
- Backend: Strict limits on `/api/topup` (10 per minute default)
- Merchant: 60 QR generations per minute
- Disabled in test mode via `NODE_ENV=test`

**Environment Configuration:** dotenv for all services
- Backend: `.env` with BANK_WALLET_PATH, TOKEN_ADDRESS, SOLANA_RPC_URL
- Merchant: `.env` with MERCHANT_WALLET, TOKEN_ADDRESS
- Mobile: Constants in `event-wallet/src/config/constants.ts`

**Type Safety:** TypeScript throughout
- Strict mode enabled
- Interface definitions for API responses
- Type imports from React Navigation

---

*Architecture analysis: 2026-01-16*
