# Roadmap: High-Frequency Event Wallet PWA

## Overview

A Progressive Web App (PWA) for live event payments using Next.js 16, Convex, Privy, and Solana Devnet. Users install via QR code, sign in with social auth, purchase event tokens, and spend them by scanning merchant QR codes. This roadmap delivers an MVP on Devnet with frictionless payments at scale.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: PWA Foundation** - Installable PWA with service worker caching
- [x] **Phase 2: Auth + Wallet + Core UI** - Social login, embedded wallet, real-time balance display
- [x] **Phase 3: Top-Up + Payments** - Mock top-up flow, QR scanning, payment execution
- [x] **Phase 3.5: Merchant Registration & Management** - Merchant self-registration with approval, admin-controlled events and item pricing
- [x] **Phase 4: Merchant Experience** - Merchant dashboard, inventory management, QR generation, sales history
- [x] **Phase 4.1: Merchant Payment Notifications** - Real-time payment notifications via Convex subscriptions (INSERTED)
- [x] **Phase 4.2: User App Payment Workflow UX** - Mobile-responsive payment confirmation, merchant name display, countdown removal (INSERTED)
- [ ] **Phase 4.3: User Dashboard UX** - Complete user dashboard with balance card, recent activities, navigation (INSERTED)
- [ ] **Phase 5: History + Offline** - Transaction history, offline support

## Phase Details

### Phase 1: PWA Foundation

**Goal**: Installable PWA with offline-capable service worker
**Depends on**: Nothing (first phase)
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, PWA-08, PWA-09
**Success Criteria** (what must be TRUE):

1. User can install PWA via QR code scan
2. PWA launches in standalone mode (not browser tab)
3. App loads offline (service worker caching active)
4. iOS Safari shows "Add to Home Screen" fallback
   **Research**: Unlikely (Next.js 16 + Serwist patterns established)
   **Plans**: TBD

Plans:

- [ ] 01-01: Next.js 16 project with PWA manifest
- [ ] 01-02: Serwist service worker configuration
- [ ] 01-03: PWA install prompt with QR code flow

### Phase 2: Auth + Wallet + Core UI

**Goal**: Social login with embedded wallet and real-time balance display
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, BAL-01, BAL-02, BAL-03, BAL-04, BAL-05, BAL-06, BAL-07, BAL-08
**Success Criteria** (what must be TRUE):

1. User can sign in with Google or Apple
2. Wallet address displayed immediately after login
3. Large balance shown on dashboard
4. Balance updates in real-time via WebSocket
   **Research**: Likely (Privy integration new to codebase)
   **Research topics**: Privy OAuth flows, embedded wallet UX patterns, rate limits for concurrent auth
   **Plans**: TBD

Plans:

- [x] 02-01: Privy integration with social auth providers
- [x] 02-02: Convex setup with wallet schema
- [x] 02-03: Balance display component with real-time subscriptions
- [x] 02-04: Dashboard layout with Shadcn/UI

### Phase 3: Top-Up + Payments

**Goal**: Mock top-up flow and QR code payment execution
**Depends on**: Phase 2
**Requirements**: TOP-01, TOP-02, TOP-03, TOP-04, TOP-05, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07
**Success Criteria** (what must be TRUE):

1. User can complete mock top-up and see balance update
2. User can scan merchant QR code
3. Payment confirmation screen shown before signing
4. Success/error feedback after payment
   **Research**: Likely (Solana web3.js 2.0 new, iOS PWA camera access)
   **Research topics**: Solana web3.js 2.0 functional patterns, qr-scanner PWA compatibility on iOS
   **Plans**: TBD

Plans:

- [x] 03-01: Mock top-up flow (no Stripe yet)
- [x] 03-02: QR code scanner with camera access
- [x] 03-03: Payment signing and transaction submission (includes Solana Pay URL parsing)

### Phase 3.5: Merchant Registration & Management

**Goal**: Merchant self-registration with approval workflow, admin-driven event configuration, and merchant-to-event assignment
**Depends on**: Phase 3 (payments must work for merchants to receive payments)
**Requirements**: MERCHANT-01, MERCHANT-02, MERCHANT-03, MERCHANT-04, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, EVENT-01, EVENT-02, EVENT-03, EVENT-04, INVENTORY-01, INVENTORY-02
**Success Criteria** (what must be TRUE):

1. Merchants can self-register via web form (email only - no wallet visible)
2. System automatically generates and manages merchant wallet address via Privy embedded wallet (invisible to merchant)
3. Admin can review and approve/reject merchant applications
4. Admins create events and assign approved merchants to specific events/booths
5. Admins configure pre-priced items for each merchant at each event
6. Event types support both predefined (Concert, Sports, Festival) and custom categories
7. Admin dashboard provides full visibility into merchant roster, managed wallets, and event-item assignments
8. Merchants never see wallet addresses or private keys - completely abstracted away
   **Research**: Likely (new Convex schema patterns, admin UI patterns, approval workflow design)
   **Research topics**: Admin dashboard UI patterns, merchant verification workflows, event-merchant assignment modeling, inventory configuration for multi-merchant events
   **Plans**: TBD

Plans:

- [x] 03.5-01: Merchant self-registration flow (email-only signup with automatic Privy embedded wallet generation, stored in Convex)
- [x] 03.5-02: Admin approval workflow (approve/reject merchants with review notes; approved merchants get activated in system)
- [x] 03.5-03: Event creation system (predefined + custom event types with date, venue, capacity)
- [x] 03.5-04: Merchant-to-event assignment (assign approved merchants to events/booths; system uses managed wallet addresses)
- [x] 03.5-05: Item configuration per merchant/event (admin sets prices and inventory for each merchant's assigned booth)
- [x] 03.5-06: Admin dashboard (merchant management, wallet monitoring, event-item assignment monitoring)

### Phase 4: Merchant Experience

**Goal**: Merchant-facing dashboard for viewing balance, assigned inventory, sales history, and generating payment QR codes
**Depends on**: Phase 3.5 (merchant registration, approval workflow, and item groups must exist)
**Requirements**: MERCH-EXP-01, MERCH-EXP-02, MERCH-EXP-03, MERCH-EXP-04, MERCH-EXP-05, MERCH-EXP-06, MERCH-EXP-07, MERCH-EXP-08
**Success Criteria** (what must be TRUE):

1. Approved merchants can log in via same Privy auth as regular users
2. Merchant dashboard displays their EVT balance and wallet address
3. Merchants can view their assigned item groups and inventory for events
4. Merchants can generate Solana Pay QR codes for each item
5. Merchants can view their sales history with transaction details
6. Unauthorized users (non-approved merchants) cannot access merchant dashboard
   **Research**: Unlikely (builds on Phase 3.5 backend which is complete)
   **Plans**: TBD

Plans:

- [x] 04-01: Merchant authentication and dashboard layout
- [x] 04-02: Merchant inventory view (assigned item groups and items)
- [x] 04-03: QR code generation for payments
- [x] 04-04: Sales history and transaction list

### Phase 4.1: Merchant Payment Notifications

**Goal**: Instant payment notifications for merchants via Convex real-time subscriptions
**Depends on**: Phase 4 (transactions table and sales page must exist)
**Requirements**: Real-time payment notifications for merchant UX (new requirement)
**Success Criteria** (what must be TRUE):

1. Merchants see new payments within 1 second without manual refresh
2. Multiple merchant devices (tablets, phones) sync simultaneously
3. Date range and wallet search filters work without interrupting real-time updates
4. Toast notification appears on new payment with item name and amount
5. No UI flicker when filters active and new payment arrives
   **Research**: Unlikely (Convex real-time subscriptions well-understood from Phase 2)
   **Plans**: TBD

Plans:

- [x] 04.1-01: Real-time transaction subscriptions with client-side filtering

### Phase 4.2: User App Payment Workflow UX (INSERTED)

**Goal**: Streamline payment confirmation flow with mobile-responsive design and reduced friction
**Depends on**: Phase 3 (payment flow must exist), Phase 3.5 (merchant data must exist)
**Requirements**: UX improvements for user payment workflow (new requirement)
**Success Criteria** (what must be TRUE):

1. Payment confirmation screen has no countdown delay
2. Merchant name displayed from Convex lookup (not "Unknown Merchant")
3. Confirm/Cancel buttons are mobile-responsive with proper touch targets
4. Users understand Privy action sheet is necessary security UX
   **Research**: Unlikely (well-understood components and patterns)
   **Plans**: TBD

Plans:

- [x] 04.2-01: Remove countdown, show merchant name, mobile-responsive buttons

### Phase 4.3: User Dashboard UX (INSERTED)

**Goal**: Complete user-facing dashboard with balance display, recent activities, and bottom navigation
**Depends on**: Phase 2 (auth + balance must exist), Phase 3 (payments must create transactions)
**Requirements**: User dashboard with balance card, transaction list, navigation (new requirement)
**Success Criteria** (what must be TRUE):

1. User sees large balance card with EVT amount after login
2. Top Up and Cash Out action buttons visible and functional
3. Recent Activities list shows last 5 transactions with icons, amounts, timestamps
4. Bottom navigation with Home, Scan QR, History tabs
5. Dashboard is mobile-responsive with proper touch targets
6. User name and profile displayed in header
   **Research**: Likely (new dashboard design patterns, bottom navigation in PWA)
   **Research topics**: Mobile dashboard patterns, bottom navigation UX, transaction list design, balance masking UX
   **Plans**: 3 plans in 2 waves

Plans:

- [ ] 04.3-01: Convex index and query for user transactions
- [ ] 04.3-02: Dashboard header, balance card, action buttons
- [ ] 04.3-03: Recent Activities list and bottom navigation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.5 → 4 → 4.1 → 4.2 → 4.3 → 5

Decimal phases (like 3.5, 4.1, 4.2, 4.3) execute between their surrounding integers (3 → 3.5 → 4 → 4.1 → 4.2 → 4.3 → 5).

| Phase                                   | Plans Complete | Status      | Completed  |
| --------------------------------------- | -------------- | ----------- | ---------- |
| 1. PWA Foundation                       | 3/3            | Complete    | 2026-01-16 |
| 2. Auth + Wallet + Core UI              | 4/4            | Complete    | 2026-01-16 |
| 3. Top-Up + Payments                    | 3/3            | Complete    | 2026-01-17 |
| 3.5. Merchant Registration & Management | 6/6            | Complete    | 2026-01-18 |
| 4. Merchant Experience                 | 4/4            | Complete    | 2026-01-19 |
| 4.1. Merchant Payment Notifications    | 1/1            | Complete    | 2026-01-19 |
| 4.2. User App Payment Workflow UX      | 1/1            | Complete    | 2026-01-20 |
| 4.3. User Dashboard UX                 | 0/3            | Pending     | - |
