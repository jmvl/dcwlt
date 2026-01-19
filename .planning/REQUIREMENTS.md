# Requirements: High-Frequency Event Wallet PWA

**Defined:** 2026-01-16
**Core Value:** Frictionless payments at scale — attendees spend tokens instantly (<200ms UI feedback) even when cellular networks are saturated, while maintaining blockchain security for settlement.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### PWA Installation

- [ ] **PWA-01**: QR code contains PWA URL with install prompt query parameter
- [ ] **PWA-02**: `beforeinstallprompt` event listener captures install capability
- [ ] **PWA-03**: Custom install button triggers native install dialog
- [ ] **PWA-04**: Manifest configured with standalone display mode
- [ ] **PWA-05**: Icons provided in all required sizes (72x72 to 512x512)
- [ ] **PWA-06**: Theme color matches event branding
- [ ] **PWA-07**: Service worker caches static assets immediately for offline resilience
- [ ] **PWA-08**: Install prompt shown on 2nd page visit (not aggressive)
- [ ] **PWA-09**: Fallback to "Add to Home Screen" instructions for iOS Safari

### Authentication & Wallet

- [x] **AUTH-01**: User sees "Continue with Google" or "Sign in with Apple" button
- [x] **AUTH-02**: Embedded wallet provider (Privy) generates keypair silently from OAuth
- [x] **AUTH-03**: No seed phrase display or management (social auth only)
- [x] **AUTH-04**: Wallet address displayed immediately after login
- [x] **AUTH-05**: Email verification available for account recovery
- [x] **AUTH-06**: Private key stored in device secure enclave (not plaintext)
- [x] **AUTH-07**: Loading spinner shown during wallet generation (2-3 seconds)

### Real-Time Balance Display

- [x] **BAL-01**: Large, centered balance display on dashboard (primary UI element)
- [x] **BAL-02**: Balance updates via WebSocket/subscription (no polling)
- [x] **BAL-03**: Fiat currency equivalent shown alongside token amount
- [x] **BAL-04**: Balance masking toggle (show/hide for privacy)
- [x] **BAL-05**: Loading state shown during initial balance fetch
- [x] **BAL-06**: Error state displayed if RPC unavailable
- [x] **BAL-07**: Last updated timestamp shown
- [x] **BAL-08**: Refresh button available for manual update

### Top-Up Flow

- [ ] **TOP-01**: Predefined token bundles shown (e.g., "$20 = 200 EVT")
- [ ] **TOP-02**: Mock top-up flow (no Stripe integration yet)
- [ ] **TOP-03**: Transaction signature displayed after successful top-up
- [ ] **TOP-04**: Balance updates automatically after confirmation
- [ ] **TOP-05**: Solana Explorer link for transaction verification

### QR Payment Scanning

- [ ] **PAY-01**: Camera access permission requested on first use
- [ ] **PAY-02**: QR code scanner with auto-focus
- [ ] **PAY-03**: Parse Solana Pay URL format: `solana:<address>?amount=<value>&spl-token=<TOKEN>`
- [ ] **PAY-04**: Payment confirmation screen shown before signing
- [ ] **PAY-05**: Transaction signing via wallet provider
- [ ] **PAY-06**: Success/error feedback displayed after payment
- [ ] **PAY-07**: 3-second countdown before confirming payment

### Transaction History

- [ ] **HIST-01**: Chronological list of all transactions displayed
- [ ] **HIST-02**: Transaction type icons shown (top-up vs payment)
- [ ] **HIST-03**: Merchant names shown for payments
- [ ] **HIST-04**: Amounts color-coded (green for in, red for out)
- [ ] **HIST-05**: Timestamps shown in relative time format ("2 minutes ago")
- [ ] **HIST-06**: Transaction detail view with signature available

### Offline Support

- [ ] **OFF-01**: Service worker caches all static assets
- [ ] **OFF-02**: Runtime caching for API responses
- [ ] **OFF-03**: Cache-first strategy for static assets
- [ ] **OFF-04**: Network-first strategy for API calls
- [ ] **OFF-05**: "You're offline" banner shown when disconnected
- [ ] **OFF-06**: Last-known balance displayed when offline

### Merchant Experience

- [x] **MERCH-EXP-01**: Merchant authentication uses same Privy social login as regular users
- [x] **MERCH-EXP-02**: Merchant dashboard route accessible only to approved merchants (status="approved")
- [x] **MERCH-EXP-03**: Merchant balance card displays EVT balance and wallet address
- [x] **MERCH-EXP-04**: Merchant inventory view shows assigned item groups for their events
- [x] **MERCH-EXP-05**: Each item displays name, description, price (in EVT), and stock count
- [x] **MERCH-EXP-06**: QR code generation button for each item (Solana Pay URL format)
- [x] **MERCH-EXP-07**: Sales history list shows all transactions with timestamp, item, amount, and customer wallet
- [x] **MERCH-EXP-08**: Logout button terminates merchant session and returns to home page

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Top-Up Flow Enhancements

- **TOP-10**: Stripe Checkout integration (hosted payment page)
- **TOP-11**: Webhook triggers backend token transfer
- **TOP-12**: Success animation with confetti after top-up

### Transaction History Enhancements

- **HIST-10**: Link to Solana Explorer for transaction verification
- **HIST-11**: Show last 20 transactions with pagination for older
- **HIST-12**: Pull-to-refresh for latest transactions

### Offline Support Enhancements

- **OFF-10**: Offline detection with banner notification
- **OFF-11**: Cached user wallet QR code (public key)
- **OFF-12**: Queue transactions for background sync

### Push Notifications

- **PUSH-01**: Request notification permission after first top-up
- **PUSH-02**: Notify when top-up completes
- **PUSH-03**: Notify when payment confirms
- **PUSH-04**: Warn when balance < threshold
- **PUSH-05**: Deep link to app on notification tap

### Optimistic Balance Updates

- **OPTM-01**: Deduct balance from UI immediately after payment confirmation
- **OPTM-02**: Show "Processing" indicator until blockchain settlement
- **OPTM-03**: Revert balance if transaction fails
- **OPTM-04**: Queue transaction for backend processing
- **OPTM-05**: WebSocket notification when transaction confirms

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Seed phrase management | Social auth eliminates UX burden; embedded wallet providers handle key abstraction |
| P2P transfers | Event wallets are closed-loop (user → merchant only); adds regulatory complexity |
| Multi-token support | Single event token per deployment; multi-token UI confuses non-crypto users |
| Card payments at POS | PWA cannot access NFC on iOS; token-only system simpler operationally |
| NFT ticket integration | Out of scope for MVP; ticketing is separate problem from payments |
| Advanced trading features | Event wallet is spending wallet, not trading platform; DEX/swap not needed |
| Multi-language support | MVP focused on single market; adds localization complexity |
| Mainnet deployment | Devnet only for MVP validation; mainnet requires security audit and legal compliance |
| iOS/Android native apps | PWA deliberately chosen to avoid App Store/Play Store review cycles |
| Thundering Herd optimization | Full 20,000-user concurrency optimization deferred until MVP validates core flows |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PWA-01 | Phase 1 | Complete |
| PWA-02 | Phase 1 | Complete |
| PWA-03 | Phase 1 | Complete |
| PWA-04 | Phase 1 | Complete |
| PWA-05 | Phase 1 | Complete |
| PWA-06 | Phase 1 | Complete |
| PWA-07 | Phase 1 | Complete |
| PWA-08 | Phase 1 | Complete |
| PWA-09 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| AUTH-06 | Phase 2 | Complete |
| AUTH-07 | Phase 2 | Complete |
| BAL-01 | Phase 2 | Complete |
| BAL-02 | Phase 2 | Complete |
| BAL-03 | Phase 2 | Complete |
| BAL-04 | Phase 2 | Complete |
| BAL-05 | Phase 2 | Complete |
| BAL-06 | Phase 2 | Complete |
| BAL-07 | Phase 2 | Complete |
| BAL-08 | Phase 2 | Complete |
| TOP-01 | Phase 3 | Pending |
| TOP-02 | Phase 3 | Pending |
| TOP-03 | Phase 3 | Pending |
| TOP-04 | Phase 3 | Pending |
| TOP-05 | Phase 3 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| PAY-04 | Phase 3 | Pending |
| PAY-05 | Phase 3 | Pending |
| PAY-06 | Phase 3 | Pending |
| PAY-07 | Phase 3 | Pending |
| HIST-01 | Phase 4 | Pending |
| HIST-02 | Phase 4 | Pending |
| HIST-03 | Phase 4 | Pending |
| HIST-04 | Phase 4 | Pending |
| HIST-05 | Phase 4 | Pending |
| HIST-06 | Phase 4 | Pending |
| OFF-01 | Phase 4 | Pending |
| OFF-02 | Phase 4 | Pending |
| OFF-03 | Phase 4 | Pending |
| OFF-04 | Phase 4 | Pending |
| OFF-05 | Phase 4 | Pending |
| OFF-06 | Phase 4 | Pending |
| MERCH-EXP-01 | Phase 4 | Complete |
| MERCH-EXP-02 | Phase 4 | Complete |
| MERCH-EXP-03 | Phase 4 | Complete |
| MERCH-EXP-04 | Phase 4 | Complete |
| MERCH-EXP-05 | Phase 4 | Complete |
| MERCH-EXP-06 | Phase 4 | Complete |
| MERCH-EXP-07 | Phase 4 | Complete |
| MERCH-EXP-08 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-16*
*Last updated: 2026-01-16 after initial definition*
