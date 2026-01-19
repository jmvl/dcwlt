# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
dcwlt/
├── backend/                    # Backend service for top-up simulation
│   ├── src/                    # TypeScript source code
│   ├── dist/                   # Compiled JavaScript (generated)
│   ├── tests/                  # Integration tests
│   └── package.json            # Dependencies and scripts
├── event-wallet/               # React Native Android app
│   ├── src/                    # Application source code
│   ├── android/                # Native Android project
│   ├── ios/                    # Native iOS project (not used)
│   ├── node_modules/           # Dependencies (generated)
│   ├── App.tsx                 # Application entry point
│   ├── package.json            # Dependencies and scripts
│   ├── app.json                # Expo configuration
│   ├── metro.config.js         # Metro bundler configuration
│   └── polyfills.ts            # Crypto polyfills
├── merchant/                   # Merchant QR generator service
│   ├── src/                    # TypeScript source code
│   ├── public/                 # Static assets
│   ├── dist/                   # Compiled JavaScript (generated)
│   └── package.json            # Dependencies and scripts
├── docs/                       # Documentation
├── .planning/                  # Planning and codebase analysis
└── README.md                   # Project overview
```

## Directory Purposes

**backend/:**
- Purpose: Express server that simulates Visa top-up by transferring SPL tokens from bank wallet
- Contains: Single-file server implementation, integration tests, TypeScript config
- Key files: `backend/src/server.ts`, `backend/package.json`, `backend/.env.example`

**event-wallet/:**
- Purpose: React Native mobile app for Android with Web3Auth Gmail login and QR payment scanning
- Contains: UI screens, navigation, Web3Auth context, Solana utilities, polyfills
- Key files: `event-wallet/App.tsx`, `event-wallet/src/contexts/Web3AuthContext.tsx`, `event-wallet/src/screens/`

**merchant/:**
- Purpose: Express server that generates Solana Pay QR codes for merchant payments
- Contains: Single-file server implementation, public assets
- Key files: `merchant/src/server.ts`, `merchant/package.json`, `merchant/public/`

**docs/:**
- Purpose: Project documentation including API docs, architecture diagrams, guides
- Contains: API documentation, architecture diagrams, implementation guides

**.planning/:**
- Purpose: Development planning and codebase analysis documents
- Contains: Task plans, codebase analysis (this file)

## Key File Locations

**Entry Points:**
- `event-wallet/App.tsx`: Mobile app entry point - initializes polyfills and provider tree
- `backend/src/server.ts`: Backend service entry point - Express server with top-up endpoint
- `merchant/src/server.ts`: Merchant service entry point - Express server with QR generation

**Configuration:**
- `event-wallet/src/config/constants.ts`: Mobile app constants (TOKEN_ADDRESS, RPC URLs)
- `event-wallet/app.json`: Expo app configuration (name, scheme, plugins)
- `event-wallet/metro.config.js`: Metro bundler configuration for React Native
- `backend/.env`: Backend environment variables (BANK_WALLET_PATH, TOKEN_ADDRESS)
- `merchant/.env`: Merchant environment variables (MERCHANT_WALLET, TOKEN_ADDRESS)

**Core Logic:**
- `event-wallet/src/contexts/Web3AuthContext.tsx`: Web3Auth integration and wallet state management
- `event-wallet/src/services/api.ts`: Backend API client for top-up operations
- `event-wallet/src/utils/solana.ts`: Solana utility functions (address derivation, validation)
- `backend/src/server.ts`: Top-up business logic and SPL token transfers
- `merchant/src/server.ts`: QR code generation and Solana Pay URL formatting

**Testing:**
- `backend/tests/`: Backend integration tests for `/api/topup` endpoint
- Test files follow `*.test.ts` or `*.spec.ts` naming convention
- Configured with Jest using `jest.config.js` in each service directory

## Naming Conventions

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `DashboardScreen.tsx`, `ErrorBoundary.tsx`)
- Utilities: camelCase with `.ts` extension (e.g., `solana.ts`, `api.ts`)
- Contexts: PascalCase with `Context.tsx` suffix (e.g., `Web3AuthContext.tsx`)
- Screens: PascalCase with `Screen.tsx` suffix (e.g., `LoginScreen.tsx`, `QRScannerScreen.tsx`)
- Navigation: PascalCase with `Navigator.tsx` suffix (e.g., `AppNavigator.tsx`)

**Directories:**
- Lowercase names (e.g., `src/`, `contexts/`, `screens/`, `utils/`, `services/`)
- Plural for collections (e.g., `screens/`, `components/`, `utils/`)
- Singular for single-purpose (e.g., `config/`, `navigation/`)

**Variables/Functions:**
- camelCase for variables and functions (e.g., `walletAddress`, `handleSimulateTopUp`)
- PascalCase for React components (e.g., `DashboardScreen`, `ErrorBoundary`)
- UPPER_CASE for constants (e.g., `TOKEN_ADDRESS`, `SOLANA_DEVNET_RPC`)

**Types/Interfaces:**
- PascalCase for interface names (e.g., `Web3AuthContextType`, `TopUpResponse`)
- Descriptive names with `Type` or `Response` suffixes where appropriate

## Where to Add New Code

**New Feature (Mobile):**
- Primary code: `event-wallet/src/screens/[FeatureName]Screen.tsx`
- Tests: Manual testing required (no automated mobile tests planned)
- Utilities: `event-wallet/src/utils/[featureName].ts` if shared logic needed

**New Feature (Backend):**
- Implementation: Add route handler in `backend/src/server.ts`
- Tests: `backend/tests/[featureName].test.ts`
- Types: Define inline TypeScript interfaces in `server.ts`

**New Component (Mobile):**
- Implementation: `event-wallet/src/components/[ComponentName].tsx`
- Export: Add to barrel exports if creating shared component library

**New Screen (Mobile):**
- Implementation: `event-wallet/src/screens/[ScreenName]Screen.tsx`
- Navigation: Add route to `event-wallet/src/navigation/AppNavigator.tsx`
- Navigation type: Update `RootStackParamList` interface

**Utilities:**
- Shared helpers: `event-wallet/src/utils/[utilityName].ts`
- Crypto-related utilities: Add to `event-wallet/src/utils/solana.ts` or create new file in `utils/`
- API-related utilities: Add to `event-wallet/src/services/api.ts` or create new service file

## Special Directories

**event-wallet/node_modules/:**
- Purpose: JavaScript dependencies for mobile app
- Generated: Yes
- Committed: No (in .gitignore)

**event-wallet/android/:**
- Purpose: Native Android project generated by Expo prebuild
- Generated: Yes (by `npx expo prebuild`)
- Committed: Yes (required for builds)
- Contains: Gradle configs, native modules, AndroidManifest.xml

**event-wallet/ios/:**
- Purpose: Native iOS project (not used for this POC)
- Generated: Yes (by `npx expo prebuild`)
- Committed: Yes
- Status: Not actively maintained (Android-only POC)

**backend/dist/ & merchant/dist/:**
- Purpose: Compiled JavaScript from TypeScript
- Generated: Yes (by `npm run build` or `tsc`)
- Committed: No (in .gitignore)
- Production: Used instead of `src/` when running compiled code

**docs/:**
- Purpose: Project documentation
- Generated: No (manual)
- Committed: Yes
- Contains: Architecture diagrams, API docs, implementation guides

**.planning/:**
- Purpose: Development planning and codebase analysis
- Generated: Partially (automated analysis documents)
- Committed: Yes
- Contains: Task plans, codebase analysis documents

**logs/:**
- Purpose: Runtime logs (may be generated by services)
- Generated: Yes
- Committed: No (in .gitignore)

## Configuration File Locations

**Expo Configuration:**
- `event-wallet/app.json`: Expo app config (name, scheme, plugins, android package)

**TypeScript Configuration:**
- `event-wallet/tsconfig.json`: Mobile app TypeScript config
- `backend/tsconfig.json`: Backend service TypeScript config
- `merchant/tsconfig.json`: Merchant service TypeScript config

**Metro Bundler Configuration:**
- `event-wallet/metro.config.js`: Metro config for React Native bundling

**Babel Configuration:**
- `event-wallet/babel.config.js`: Babel config for React Native (may exist)

**Environment Configuration:**
- `backend/.env`: Backend environment variables (not in repo - use `.env.example`)
- `merchant/.env`: Merchant environment variables (not in repo - use `.env.example`)
- `event-wallet/src/config/constants.ts`: Mobile constants (committed to repo)

**Git Configuration:**
- `.gitignore`: Root gitignore (excludes node_modules, dist, .env, logs)
- `event-wallet/.gitignore`: Mobile-specific gitignore

---

*Structure analysis: 2026-01-16*
