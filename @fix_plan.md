# Ralph Fix Plan - Android Wallet POC

## Phase 1: Blockchain Setup (Solana Devnet)
- [ ] Task 1: Verify prerequisites (Node.js, Solana CLI, Android Studio)
- [ ] Task 2: Configure Solana for Devnet
- [ ] Task 3: Create bank wallet and get devnet SOL
- [ ] Task 4: Create Event Token (save token address to blockchain-notes.md)

## Phase 2: Expo App Initialization
- [x] Task 5: Create Expo project with TypeScript
- [x] Task 6: Install dependencies (Solana, Web3Auth, camera, polyfills)
- [x] Task 7: Create crypto polyfills file

## Phase 3: Web3Auth Integration
- [x] Task 8: Configure app.json for Web3Auth (Android permissions, plugin)
- [ ] Task 9: Get Web3Auth credentials (create project, get Client ID)
- [x] Task 10: Create Web3Auth context and Solana utilities

## Phase 4: UI - Login Screen
- [x] Task 11: Create LoginScreen component with Google login button

## Phase 5: UI - Wallet Dashboard
- [x] Task 12: Create DashboardScreen with balance display and top-up button
- [x] Task 13: Create navigation structure (AppNavigator, integrate screens)

## Phase 6: QR Scanner
- [x] Task 14: Create QRScannerScreen with Solana Pay URL parsing

## Phase 7: Backend Top-Up Simulation
- [x] Task 15: Create backend Express server with /api/topup endpoint (COMPLETE)
- [ ] Task 16: Integrate top-up API with mobile app (see TASK_15_16_COMPLETION.patch)

## Phase 8: Merchant QR Generator
- [x] Task 17: Create merchant Express server with QR generation and web UI (code complete)

## Phase 9: Build, Test & Documentation
- [ ] Task 18: Build development client and run on Android
- [ ] Task 19: Test complete flow (login → top-up → payment)
- [ ] Task 20: Create project README and final documentation

## Completed
- [x] Project initialization (planning, documentation structure)
- [x] Expo app initialization (Tasks 5-8)
- [x] Web3Auth integration setup (Task 10)
- [x] UI screens and navigation (Tasks 11-13)
- [x] QR scanner implementation (Task 14)
- [x] Backend server implementation (Task 15) - COMPLETE with Transaction import
- [x] API service implementation (Task 16) - code exists, needs DashboardScreen integration
- [x] Merchant terminal implementation (Task 17)

## Notes
- **BLOCKERS**: Tasks 1-4 require manual Solana CLI commands (see REMAINING_TASKS.md)
- **BLOCKER**: Task 9 requires user to create Web3Auth project and get Client ID
- **TASK 16**: DashboardScreen.tsx integration required (see TASK_15_16_COMPLETION.patch)
- **NOTE**: Task 6 dependencies installed with fixed version conflicts: @web3auth/react-native-sdk@8.1.0, @web3auth/base@9.7.0
- Token address from Task 4 is CRITICAL - save it immediately
- All blockchain operations use Devnet only (never mainnet)
- Custom dev client required - Expo Go is incompatible with crypto libraries

## Current Focus

**Task 16 is the only code fix remaining.** After that, all work requires manual setup:

1. **Task 16**: Apply DashboardScreen integration (see TASK_15_16_COMPLETION.patch)
2. Complete blockchain setup (Tasks 1-4) - Solana CLI commands
3. Configure and start backend service (Task 15)
4. Configure and start merchant service (Task 17)
5. Get Web3Auth credentials (Task 9)
6. Build and test on Android (Tasks 18-19)

**Reference**: `REMAINING_TASKS.md` contains comprehensive step-by-step instructions for all remaining work (~1 hour total).
