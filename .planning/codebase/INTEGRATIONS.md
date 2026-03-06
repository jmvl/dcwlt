# External Integrations

**Analysis Date:** 2025-01-16

## APIs & External Services

**Blockchain:**

**Solana Devnet RPC:**
- What it's used for: All blockchain operations (transactions, balance queries, token operations)
- SDK/Client: @solana/web3.js
- Connection URL: https://api.devnet.solana.com (default)
- Configurable via: SOLANA_RPC_URL environment variable
- Used in: `backend/src/server.ts`, `merchant/src/server.ts`, `solana-poc/backend/server.js`, `event-wallet/src/config/constants.ts`

**Solana Block Explorer:**
- What it's used for: Transaction verification and links
- URL: https://explorer.solana.com/?cluster=devnet
- Constants: `SOLANA_DEVNET_EXPLORER` in event-wallet/src/config/constants.ts
- Transaction URLs formatted as: https://explorer.solana.com/tx/{signature}?cluster=devnet

**Authentication:**

**Web3Auth:**
- What it's used for: Gmail OAuth to Solana key derivation
- SDK/Client: @web3auth/react-native-sdk v8.1.0
- Auth: Web3Auth Client ID in app.json
  - Client ID: BF_3EwSny_eyZmyDHMK-FOv1mu3Zrt7gRB5G9TQQtoBYmo_2Hww_Yd6l0xCqKBLadXIM0ZVEKNCwfAxaqvHc648
- Implementation: `event-wallet/src/contexts/Web3AuthContext.tsx`
- Login provider: Google (Gmail OAuth)
- Redirect scheme: eventwallet://auth
- Network: WEB3AUTH_NETWORK.TESTNET
- Current state: TEST_MODE enabled (mocked wallet address: 'TestWallet1234')

**OAuth Browser:**
- What it's used for: Opening browser for Web3Auth OAuth flow
- SDK/Client: @toruslabs/react-native-web-browser v1.0.0
- Methods: openAuthSessionAsync, dismissAuthSession

## Data Storage

**Databases:**
- None (POC uses in-memory storage only)

**In-Memory Storage:**
- solana-poc/backend: Map-based key shard storage (cleared on restart)
- event-wallet: @react-native-async-storage/async-storage for session persistence

**File Storage:**

**Wallet Keypairs:**
- Bank wallet: ~/bank-wallet.json (backend, filesystem)
- Merchant wallet: ~/merchant-wallet.json (merchant, filesystem)
- Loaded via fs.readFileSync()
- Format: JSON array of secret key bytes

**Token Configuration:**
- solana-poc/backend/data/token-config.json
- Stores token mint address and pool token account

**Caching:**
- None implemented

## Authentication & Identity

**Auth Provider:**
- Web3Auth (Torus Labs)
- Implementation approach:
  - Gmail OAuth login via Web3Auth SDK
  - Private key derived from OAuth session
  - Private key converted to Solana Keypair
  - Wallet address derived from keypair using ed25519-hd-key
- Session storage: AsyncStorage on mobile
- Key derivation: `event-wallet/src/utils/solana.ts` - deriveSolanaAddress()

**Test Mode:**
- Currently enabled in Web3AuthContext.tsx (TEST_MODE = true)
- Bypasses Web3Auth initialization
- Returns mock wallet address: 'TestWallet1234'

## Monitoring & Observability

**Error Tracking:**
- None (POC level)

**Logs:**
- Console.log/app.log for development
- No centralized logging
- Error handlers in Express apps (backend, merchant, solana-poc)

**Security Headers (solana-poc):**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains

## CI/CD & Deployment

**Hosting:**
- Not configured (local development only)

**CI Pipeline:**
- None

**Build:**
- Mobile: Expo EAS Build or local build with expo run:android
- Backend: TypeScript compilation to dist/ directory

## Environment Configuration

**Required env vars:**

**backend/.env:**
```
BANK_WALLET_PATH=/Users/jm/bank-wallet.json
TOKEN_ADDRESS=<from spl-token create-token>
PORT=3000
NODE_ENV=development
RATE_LIMIT_TOPUP_MAX=10
RATE_LIMIT_TOPUP_WINDOW_MS=60000
RATE_LIMIT_HEALTH_MAX=60
RATE_LIMIT_STATUS_MAX=60
```

**merchant/.env:**
```
MERCHANT_WALLET=<generate new wallet for merchant>
TOKEN_ADDRESS=<from spl-token create-token>
PORT=3001
NODE_ENV=development
```

**solana-poc/backend/.env:**
```
ENCRYPTION_KEY=<32-byte hex string>
PORT=3002
SOLANA_RPC_URL=https://api.devnet.solana.com (optional)
```

**event-wallet (via app.json):**
- web3authClientId (in app.json under extra.web3authClientId)
- TOKEN_ADDRESS (hardcoded in src/config/constants.ts)

**Secrets location:**
- Filesystem: ~/.wallet/*.json files (bank-wallet.json, merchant-wallet.json)
- Environment: .env files in service directories
- Not committed to git (.env in .gitignore)

## Webhooks & Callbacks

**Incoming:**
- None (no webhook receivers configured)

**Outgoing:**
- None (no external webhooks called)

**Deep Links (Mobile):**
- eventwallet://auth - OAuth callback for Web3Auth
- Handled by React Native Linking API
- Configured in app.json: "scheme": "eventwallet"

## Internal Service Communication

**Backend → Solana Devnet:**
- RPC calls via @solana/web3.js Connection
- POST /api/topup - Transfers tokens from bank wallet
- Uses devnet JSON-RPC endpoint

**Merchant Service:**
- No external dependencies besides Solana address validation
- GET /api/qr/:amount - Generates QR codes locally (no external API)

**Mobile → Backend:**
- POST http://localhost:3000/api/topup - Simulated Visa top-up
- GET http://localhost:3000/health - Health check
- GET http://localhost:3000/api/status - Service status
- Implementation: `event-wallet/src/services/api.ts`

**Mobile → Solana Devnet:**
- Direct RPC calls via @solana/web3.js (planned for QR payments)
- SOLANA_DEVNET_RPC constant in event-wallet/src/config/constants.ts

## Third-Party Libraries

**QR Code Generation:**
- qrcode 1.5.3 - Local QR generation (merchant service)
- No external API calls

**Camera Access:**
- react-native-vision-camera 4.7.3 - Native camera module
- Platform-specific (Android/iOS)

**Navigation:**
- React Navigation - Client-side routing only

---

*Integration audit: 2025-01-16*
