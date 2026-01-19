# DCWLT PWA Mobile Frontend - Implementation Plan

## Overview

Create a Progressive Web App (PWA) mobile frontend for the DCWLT crypto wallet project, providing the same functionality as the existing React Native app (Gmail login → Wallet → Top-up → QR Payment) but as an installable web application.

**Branch:** `uix-user`

**Project Location:** `/Users/jm/Codebase/dcwlt/pwa-frontend/` (new root directory)

**Scope:** MVP First - Dashboard + Top-up only (QR/payment to be added later)

**Approach:** Design First - Use ux-ui-designer agent before implementation

---

## Technology Stack

### Core Framework: React + Next.js + TypeScript

**Chosen because:**

- Existing codebase is React-based (React Native) for knowledge transfer
- Next.js provides instant HMR and optimal build performance
- Web3Auth has mature Web SDK support

### Key Dependencies

```json
{
  "core": ["react@^18.3.0", "react-dom@^18.3.0", "react-router-dom@^6.22.0"],
  "blockchain": ["@solana/web3.js@^1.95.0", "@solana/spl-token@^0.4.0"],
  "auth": [
    "@web3auth/web3auth-web@^8.12.0",
    "@web3auth/solana-provider@^8.12.0"
  ],
  "pwa": ["next-pwa@^0.20.0", "workbox-window@^7.0.0"],
  "qr": ["react-qr-reader@^3.0.0"],
  "ui": ["clsx@^2.1.0", "tailwindcss@^3.4.0"]
}
```

---

## Design Tokens (from Mockup)

```css
:root {
  /* Colors */
  --color-primary: #13a4ec;
  --color-background-dark: #101c22;
  --color-card-dark: #1c2a31;
  --color-text-primary: #ffffff;
  --color-text-secondary: #9db0b9;

  /* Typography */
  --font-display: "Manrope", sans-serif;

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

---

# Implementation Phases (MVP Scope)

## Phase 0: Design System (UX/UI Designer Agent)

**Goal:** Create complete design system with ux-ui-designer agent before any implementation

### Tasks

#### Task 0.1: Launch ux-ui-designer Agent

- [ ] Launch ux-ui-designer agent with project context
- [ ] Provide mockup: `/Users/jm/Codebase/dcwlt/docs/plans/code.html`
- [ ] Provide screenshot: `/Users/jm/Codebase/dcwlt/docs/plans/screen.png`

#### Task 0.2: Define Component Variants

- [ ] Define Button variants (primary, secondary, ghost, danger)
- [ ] Define Button sizes (sm, md, lg)
- [ ] Define Button states (default, hover, active, disabled, loading)
- [ ] Define Card variants (default, elevated, outlined)
- [ ] Define Typography hierarchy (h1-h6, body, caption)

#### Task 0.3: Define Interactive States

- [ ] Define hover states for all interactive elements
- [ ] Define focus states for accessibility
- [ ] Define active/pressed states
- [ ] Define disabled states
- [ ] Define loading/skeleton states

#### Task 0.4: Document Design Tokens

- [ ] Document all color values (HEX, RGB, HSL)
- [ ] Document spacing scale
- [ ] Document border radius values
- [ ] Document shadow/elevation levels
- [ ] Document transition timings

#### Task 0.5: Create Style Guide

- [ ] Create component documentation
- [ ] Define layout patterns
- [ ] Define responsive breakpoints
- [ ] Document accessibility requirements (WCAG 2.1 AA)
- [ ] Create usage examples

---

## Phase 1: Project Setup

**Goal:** Initialize project with all dependencies and configuration

### Tasks

#### Task 1.1: Create Project Directory

- [ ] Create `/Users/jm/Codebase/dcwlt/pwa-frontend/` directory
- [ ] Verify directory creation

#### Task 1.2: Initialize Vite Project

- [ ] Run `npm create vite@latest pwa-frontend -- --template react-ts`
- [ ] Navigate to project directory
- [ ] Delete default Vite boilerplate files

#### Task 1.3: Install Core Dependencies

- [ ] Install React Router: `npm install react-router-dom`
- [ ] Install UI utilities: `npm install clsx`
- [ ] Install dev dependencies

#### Task 1.4: Install Blockchain Dependencies

- [ ] Install Solana: `npm install @solana/web3.js @solana/spl-token`
- [ ] Install Web3Auth: `npm install @web3auth/web3auth-web @web3auth/solana-provider`

#### Task 1.5: Install PWA Dependencies

- [ ] Install Vite PWA plugin: `npm install -D vite-plugin-pwa workbox-window`

#### Task 1.6: Install QR Scanner (Future)

- [ ] Install QR reader: `npm install react-qr-reader`

#### Task 1.7: Install and Configure Tailwind CSS

- [ ] Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Run: `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js` with design tokens
- [ ] Add Tailwind directives to `src/styles/global.css`

#### Task 1.8: Configure TypeScript

- [ ] Update `tsconfig.json` with strict mode settings
- [ ] Configure path aliases (@components, @contexts, etc.)
- [ ] Add type declarations for Vite

#### Task 1.9: Create Folder Structure

- [ ] Create `src/components/atoms/`
- [ ] Create `src/components/molecules/`
- [ ] Create `src/components/organisms/`
- [ ] Create `src/components/templates/`
- [ ] Create `src/contexts/`
- [ ] Create `src/hooks/`
- [ ] Create `src/services/`
- [ ] Create `src/screens/`
- [ ] Create `src/utils/`
- [ ] Create `src/types/`
- [ ] Create `src/styles/`

#### Task 1.10: Configure Vite

- [ ] Update `vite.config.ts` with React plugin
- [ ] Add path aliases to resolve configuration
- [ ] Configure proxy for backend API (localhost:3000)
- [ ] Configure proxy for merchant service (localhost:3001)

#### Task 1.11: Create Environment Files

- [ ] Create `.env.development` with local URLs
- [ ] Create `.env.production` placeholder
- [ ] Add Web3Auth client ID
- [ ] Add token address
- [ ] Add Solana RPC URL

---

## Phase 2: Core Components (Atoms)

**Goal:** Implement atomic UI components following design system

### Tasks

#### Task 2.1: Create Design Token Styles

- [ ] Create `src/styles/variables.css` with CSS custom properties
- [ ] Add color variables
- [ ] Add spacing variables
- [ ] Add typography variables
- [ ] Add border radius variables
- [ ] Add shadow variables

#### Task 2.2: Create Global Styles

- [ ] Create `src/styles/global.css`
- [ ] Add CSS reset
- [ ] Add base HTML element styles
- [ ] Add utility classes
- [ ] Import in `main.tsx`

#### Task 2.3: Implement Typography Component

- [ ] Create `src/components/atoms/Typography.tsx`
- [ ] Define TypeScript props interface
- [ ] Implement variants (h1-h6, body, caption)
- [ ] Add color and weight props
- [ ] Export component

#### Task 2.4: Implement Button Component

- [ ] Create `src/components/atoms/Button.tsx`
- [ ] Define TypeScript props interface (variant, size, disabled, loading)
- [ ] Implement all variants (primary, secondary, ghost, danger)
- [ ] Implement all sizes (sm, md, lg)
- [ ] Add disabled state styling
- [ ] Add loading state with spinner
- [ ] Add hover and active states
- [ ] Export component

#### Task 2.5: Implement IconButton Component

- [ ] Create `src/components/atoms/IconButton.tsx`
- [ ] Define TypeScript props interface
- [ ] Implement icon rendering
- [ ] Add size variants
- [ ] Add accessibility (aria-label)
- [ ] Export component

#### Task 2.6: Implement Card Component

- [ ] Create `src/components/atoms/Card.tsx`
- [ ] Define TypeScript props interface
- [ ] Implement variants (default, elevated, outlined)
- [ ] Add padding prop
- [ ] Export component

#### Task 2.7: Implement Icon Component

- [ ] Create `src/components/atoms/Icon.tsx`
- [ ] Set up icon library (lucide-react or similar)
- [ ] Define TypeScript props interface
- [ ] Implement icon rendering with size and color props
- [ ] Export component

#### Task 2.8: Implement Avatar Component

- [ ] Create `src/components/atoms/Avatar.tsx`
- [ ] Define TypeScript props interface
- [ ] Implement circular image rendering
- [ ] Add fallback for missing image
- [ ] Add size variants
- [ ] Export component

#### Task 2.9: Implement Badge Component

- [ ] Create `src/components/atoms/Badge.tsx`
- [ ] Define TypeScript props interface
- [ ] Implement circular badge
- [ ] Add color variants
- [ ] Add positioning support (absolute)
- [ ] Export component

#### Task 2.10: Create Atom Component Index

- [ ] Create `src/components/atoms/index.ts`
- [ ] Export all atom components
- [ ] Verify imports work correctly

---

## Phase 3: Dashboard Components

**Goal:** Implement molecular and organism components for the dashboard

### Tasks

#### Task 3.1: Implement BalanceCard Component

- [ ] Create `src/components/molecules/BalanceCard.tsx`
- [ ] Define TypeScript props interface (balance, isVisible, onToggleVisibility, walletAddress)
- [ ] Implement gradient background (#13a4ec primary color)
- [ ] Add balance amount display
- [ ] Implement visibility toggle with eye icon
- [ ] Add wallet address display (masked)
- [ ] Add card styling from design system
- [ ] Export component

#### Task 3.2: Implement TransactionItem Component

- [ ] Create `src/components/molecules/TransactionItem.tsx`
- [ ] Define TypeScript props interface (merchant, amount, category, timestamp, type)
- [ ] Implement icon display
- [ ] Add merchant name and category
- [ ] Add timestamp
- [ ] Add amount with color (green for positive, red for negative)
- [ ] Export component

#### Task 3.3: Implement ActionButton Component

- [ ] Create `src/components/molecules/ActionButton.tsx`
- [ ] Define TypeScript props interface (icon, label, onClick)
- [ ] Implement vertical layout with icon and label
- [ ] Add Card background styling
- [ ] Export component

#### Task 3.4: Implement UserGreeting Component

- [ ] Create `src/components/molecules/UserGreeting.tsx`
- [ ] Define TypeScript props interface (userName, userAvatar)
- [ ] Implement horizontal layout with avatar and text
- [ ] Add "Welcome back" prefix
- [ ] Export component

#### Task 3.5: Implement NotificationButton Component

- [ ] Create `src/components/molecules/NotificationButton.tsx`
- [ ] Define TypeScript props interface (count, onClick)
- [ ] Implement bell icon
- [ ] Add badge when count > 0
- [ ] Export component

#### Task 3.6: Implement TopAppBar Component

- [ ] Create `src/components/organisms/TopAppBar.tsx`
- [ ] Define TypeScript props interface
- [ ] Compose UserGreeting component
- [ ] Compose NotificationButton component
- [ ] Add horizontal layout with space-between
- [ ] Export component

#### Task 3.7: Implement ActionBar Component

- [ ] Create `src/components/organisms/ActionBar.tsx`
- [ ] Define TypeScript props interface (actions array)
- [ ] Implement horizontal scrollable layout
- [ ] Compose ActionButton components for Top Up, Send, Request
- [ ] Export component

#### Task 3.8: Implement TransactionList Component

- [ ] Create `src/components/organisms/TransactionList.tsx`
- [ ] Define TypeScript props interface (transactions array, title)
- [ ] Implement "Recent Activities" heading
- [ ] Compose TransactionItem components
- [ ] Add empty state when no transactions
- [ ] Export component

#### Task 3.9: Implement BottomNavigation Component

- [ ] Create `src/components/organisms/BottomNavigation.tsx`
- [ ] Define TypeScript props interface (activeTab, onTabChange)
- [ ] Implement horizontal layout with three tabs
- [ ] Add Home and History tabs
- [ ] Add prominent center Scan button placeholder
- [ ] Implement active state styling
- [ ] Export component

#### Task 3.10: Implement DashboardLayout Component

- [ ] Create `src/components/templates/DashboardLayout.tsx`
- [ ] Define TypeScript props interface (children)
- [ ] Compose TopAppBar
- [ ] Add scrollable content area
- [ ] Compose BottomNavigation
- [ ] Export component

#### Task 3.11: Create Component Index Files

- [ ] Create `src/components/molecules/index.ts`
- [ ] Create `src/components/organisms/index.ts`
- [ ] Create `src/components/templates/index.ts`
- [ ] Export all components

---

## Phase 4: Web3Auth Integration

**Goal:** Set up Web3Auth Web SDK for Gmail OAuth login

### Tasks

#### Task 4.1: Create Type Definitions

- [ ] Create `src/types/web3auth.ts`
- [ ] Define Web3AuthState interface
- [ ] Define Web3AuthContextType interface

#### Task 4.2: Implement Web3Auth Service

- [ ] Create `src/services/web3auth.ts`
- [ ] Import Web3Auth and SolanaPrivateKeyProvider
- [ ] Define chainConfig for Solana Devnet
- [ ] Create initialization function
- [ ] Export setup function

#### Task 4.3: Implement Web3AuthContext

- [ ] Create `src/contexts/Web3AuthContext.tsx`
- [ ] Define context state (web3auth, privateKey, walletAddress, isLoggedIn, isLoading)
- [ ] Implement init function
- [ ] Implement login function with Google provider
- [ ] Implement logout function
- [ ] Implement deriveSolanaAddress helper
- [ ] Create context provider component
- [ ] Export useWeb3Auth hook

#### Task 4.4: Create LoginScreen Component

- [ ] Create `src/screens/LoginScreen.tsx`
- [ ] Add app logo/branding
- [ ] Add welcome message
- [ ] Implement "Continue with Google" button
- [ ] Connect to Web3AuthContext login function
- [ ] Add loading state during login
- [ ] Add error handling and display
- [ ] Export component

#### Task 4.5: Create Utility Constants

- [ ] Create `src/utils/constants.ts`
- [ ] Add TOKEN_ADDRESS from existing project
- [ ] Add SOLANA_DEVNET_RPC URL
- [ ] Add Web3Auth CLIENT_ID
- [ ] Export all constants

#### Task 4.6: Create Wallet Types

- [ ] Create `src/types/wallet.ts`
- [ ] Define Wallet interface
- [ ] Define Balance interface
- [ ] Export types

#### Task 4.7: Implement WalletContext

- [ ] Create `src/contexts/WalletContext.tsx`
- [ ] Define context state (balance, transactions, isRefreshing)
- [ ] Implement fetchBalance function
- [ ] Implement refreshBalance function
- [ ] Create context provider component
- [ ] Export useWallet hook

#### Task 4.8: Implement Solana Service

- [ ] Create `src/services/solana.ts`
- [ ] Copy/adapt from `event-wallet/src/utils/solana.ts`
- [ ] Implement getTokenBalance function using @solana/web3.js
- [ ] Implement deriveAddress function
- [ ] Export functions

#### Task 4.9: Set Up App Routing

- [ ] Update `src/App.tsx` with React Router
- [ ] Create /login route
- [ ] Create /dashboard route (protected)
- [ ] Add route guards for authenticated users
- [ ] Implement navigation logic

#### Task 4.10: Create Main App Provider

- [ ] Update `src/main.tsx`
- [ ] Wrap app with Web3AuthProvider
- [ ] Wrap app with WalletProvider
- [ ] Wrap app with Router
- [ ] Mount app

#### Task 4.11: Test Login Flow

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to localhost:5173
- [ ] Test login button appears
- [ ] Test Google OAuth flow
- [ ] Verify wallet address is generated
- [ ] Verify navigation to dashboard

---

## Phase 5: Dashboard & Balance (MVP)

**Goal:** Implement main dashboard screen with balance display

### Tasks

#### Task 5.1: Create API Types

- [ ] Create `src/types/api.ts`
- [ ] Define TopUpRequest interface
- [ ] Define TopUpResponse interface
- [ ] Define ErrorResponse interface

#### Task 5.2: Implement API Service

- [ ] Create `src/services/api.ts`
- [ ] Copy/adapt from `event-wallet/src/services/api.ts`
- [ ] Implement topUpWallet function
- [ ] Implement checkBackendHealth function
- [ ] Add error handling
- [ ] Export functions

#### Task 5.3: Implement useBalance Hook

- [ ] Create `src/hooks/useBalance.ts`
- [ ] Implement balance fetching logic
- [ ] Add polling for balance updates
- [ ] Handle loading and error states
- [ ] Export hook

#### Task 5.4: Create Transaction Types

- [ ] Create `src/types/transaction.ts`
- [ ] Define Transaction interface
- [ ] Define TransactionType enum
- [ ] Export types

#### Task 5.5: Create Mock Transactions

- [ ] Create `src/utils/mockData.ts`
- [ ] Add sample transaction data
- [ ] Export for development

#### Task 5.6: Implement DashboardScreen

- [ ] Create `src/screens/DashboardScreen.tsx`
- [ ] Use DashboardLayout template
- [ ] Add BalanceCard with useWallet hook
- [ ] Add ActionBar with Top Up, Send, Request buttons
- [ ] Add TransactionList with mock data
- [ ] Add pull-to-refresh functionality
- [ ] Export component

#### Task 5.7: Implement useRefresh Hook

- [ ] Create `src/hooks/useRefresh.ts`
- [ ] Implement pull-to-refresh logic
- [ ] Add loading state
- [ ] Trigger balance refresh
- [ ] Export hook

#### Task 5.8: Update Main App

- [ ] Update `src/App.tsx`
- [ ] Add protected route wrapper
- [ ] Redirect unauthenticated users to login
- [ ] Test navigation flow

#### Task 5.9: Test Balance Display

- [ ] Verify balance displays on dashboard
- [ ] Test balance refresh functionality
- [ ] Verify loading states
- [ ] Test error states

#### Task 5.10: Style Dashboard

- [ ] Apply dark theme colors
- [ ] Ensure proper spacing
- [ ] Test responsive layout
- [ ] Verify accessibility (contrast, focus states)

---

## Phase 6: Top-up Integration (MVP Complete)

**Goal:** Integrate backend top-up API for adding tokens

### Tasks

#### Task 6.1: Implement Top-up Button Handler

- [ ] Update DashboardScreen
- [ ] Add onClick handler to Top Up button
- [ ] Show confirmation dialog
- [ ] Call API service topUpWallet function

#### Task 6.2: Add Loading States

- [ ] Create loading overlay component
- [ ] Show during top-up API call
- [ ] Disable Top Up button during loading
- [ ] Add spinner animation

#### Task 6.3: Handle Top-up Success

- [ ] Display success toast/notification
- [ ] Show transaction signature
- [ ] Add Solana Explorer link
- [ ] Trigger balance refresh
- [ ] Update transaction list

#### Task 6.4: Handle Top-up Errors

- [ ] Display error toast/notification
- [ ] Show specific error message
- [ ] Handle network errors
- [ ] Handle rate limit errors
- [ ] Add retry option

#### Task 6.5: Create Transaction History State

- [ ] Update WalletContext
- [ ] Add transactions array state
- [ ] Implement addTransaction function
- [ ] Implement fetchTransactions function

#### Task 6.6: Update Transaction List

- [ ] Connect to WalletContext transactions
- [ ] Display real transaction history
- [ ] Add empty state
- [ ] Add loading skeleton

#### Task 6.7: Test Top-up Flow

- [ ] Test successful top-up
- [ ] Verify balance increases
- [ ] Test transaction appears in list
- [ ] Test error handling
- [ ] Test rate limiting

#### Task 6.8: Add Transaction Details

- [ ] Create transaction detail view
- [ ] Show full transaction data
- [ ] Add link to Solana Explorer
- [ ] Add timestamp and amount details

---

## Phase 7: Basic PWA Features

**Goal:** Configure PWA manifest and service worker for installability

### Tasks

#### Task 7.1: Configure Vite PWA Plugin

- [ ] Update `vite.config.ts`
- [ ] Add VitePWA plugin configuration
- [ ] Configure registerType as 'autoUpdate'
- [ ] Add includeAssets for icons

#### Task 7.2: Create PWA Manifest

- [ ] Create `public/manifest.json`
- [ ] Add app name: "DCWLT Event Wallet"
- [ ] Add short name: "Event Wallet"
- [ ] Add description
- [ ] Set theme color: #13a4ec
- [ ] Set background color: #101c22
- [ ] Set display: standalone
- [ ] Set orientation: portrait

#### Task 7.3: Generate App Icons

- [ ] Create 72x72 icon
- [ ] Create 96x96 icon
- [ ] Create 128x128 icon
- [ ] Create 144x144 icon
- [ ] Create 152x152 icon
- [ ] Create 192x192 icon
- [ ] Create 384x384 icon
- [ ] Create 512x512 icon (maskable)
- [ ] Place in `public/icons/` directory

#### Task 7.4: Configure Service Worker

- [ ] Set up runtime caching for Solana RPC
- [ ] Set up runtime caching for API calls
- [ ] Configure cache expiration
- [ ] Set up cache strategies (NetworkFirst for API)

#### Task 7.5: Create Install Prompt Hook

- [ ] Create `src/hooks/useInstallPWA.ts`
- [ ] Listen for beforeinstallprompt event
- [ ] Implement install function
- [ ] Track installable state
- [ ] Export hook

#### Task 7.6: Add Install Button

- [ ] Update LoginScreen or DashboardScreen
- [ ] Add install button when available
- [ ] Connect to useInstallPWA hook
- [ ] Test install flow

#### Task 7.7: Test PWA Installation

- [ ] Test on Chrome Android
- [ ] Test on Safari iOS (Add to Home Screen)
- [ ] Verify app launches in standalone mode
- [ ] Verify theme color applies

#### Task 7.8: Implement Offline Detection

- [ ] Create `src/hooks/useOffline.ts`
- [ ] Listen for online/offline events
- [ ] Show offline banner when disconnected
- [ ] Export hook

#### Task 7.9: Add Offline Banner

- [ ] Create offline banner component
- [ ] Show when offline
- [ ] Hide when online
- [ ] Add to main layout

#### Task 7.10: Test Offline Functionality

- [ ] Test offline detection
- [ ] Verify service worker caches assets
- [ ] Test offline navigation
- [ ] Test online reconnection

---

## Future Phases (Post-MVP)

### Phase 8: QR Scanner Integration

- Implement react-qr-reader
- Create QRScannerScreen
- Parse Solana Pay URLs
- Handle camera permissions

### Phase 9: Payment Flow

- Create PaymentConfirmationScreen
- Implement SPL token transfer
- Add transaction signing
- Update balance after payment

### Phase 10: Advanced PWA Features

- Offline mode with background sync
- Push notifications
- Periodic background sync
- App shortcuts

### Phase 11: Testing & Polish

- Unit tests with Vitest
- Integration tests
- E2E tests with Playwright
- Performance optimization
- Accessibility audit

---

## Key Files Reference

### New Project Files (pwa-frontend directory)

1. `src/contexts/Web3AuthContext.tsx` - Web3Auth Web SDK integration
2. `src/contexts/WalletContext.tsx` - Wallet state management
3. `src/services/api.ts` - Backend API integration
4. `src/services/solana.ts` - Solana web3.js integration
5. `src/screens/DashboardScreen.tsx` - Main dashboard
6. `src/components/molecules/BalanceCard.tsx` - Key UI component
7. `vite.config.ts` - PWA configuration
8. `public/manifest.json` - PWA manifest

### Existing Files to Reference

- `/Users/jm/Codebase/dcwlt/event-wallet/src/utils/solana.ts`
- `/Users/jm/Codebase/dcwlt/event-wallet/src/services/api.ts`
- `/Users/jm/Codebase/dcwlt/event-wallet/src/config/constants.ts`
- `/Users/jm/Codebase/dcwlt/docs/plans/code.html`

---

## Environment Variables

```bash
# .env.development
VITE_BACKEND_URL=http://localhost:3000
VITE_MERCHANT_URL=http://localhost:3001
VITE_WEB3AUTH_CLIENT_ID=BF_3EwSny_eyZmyDHMK-FOv1mu3Zrt7gRB5G9TQQtoBYmo_2Hww_Yd6l0xCqKBLadXIM0ZVEKNCwfAxaqvHc648
VITE_TOKEN_ADDRESS=4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Success Criteria

### MVP Completion Checklist

- [ ] PWA installs on mobile devices (iOS Safari, Android Chrome)
- [ ] Gmail login works successfully with Web3Auth
- [ ] Dashboard displays wallet balance from Solana Devnet
- [ ] Top-up button successfully adds 50 EVT tokens
- [ ] Transaction appears in history after top-up
- [ ] Solana Explorer link works for transactions
- [ ] App works offline after first load
- [ ] Dark theme matches mockup design
- [ ] All components follow design system

### Performance Targets

- Lighthouse PWA Score: 90+
- Time to Interactive: < 3s
- First Contentful Paint: < 1.5s
- Bundle Size: < 500KB (gzipped)

---

## Progress Tracking

| Phase                         | Tasks  | Status      | Notes                    |
| ----------------------------- | ------ | ----------- | ------------------------ |
| Phase 0: Design System        | 5      | Not Started | Use ux-ui-designer agent |
| Phase 1: Project Setup        | 11     | Not Started | Initialize Vite project  |
| Phase 2: Core Components      | 10     | Not Started | Atomic components        |
| Phase 3: Dashboard Components | 11     | Not Started | Molecular/organisms      |
| Phase 4: Web3Auth Integration | 11     | Not Started | Gmail login              |
| Phase 5: Dashboard & Balance  | 10     | Not Started | MVP dashboard            |
| Phase 6: Top-up Integration   | 8      | Not Started | Backend integration      |
| Phase 7: Basic PWA Features   | 10     | Not Started | Installability           |
| **MVP Total**                 | **76** | **0%**      |                          |
