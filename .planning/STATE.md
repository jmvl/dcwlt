---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-03T19:15:56.085Z"
progress:
  total_phases: 18
  completed_phases: 9
  total_plans: 42
  completed_plans: 33
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Frictionless payments at scale
**Current focus:** Phase 4.4 complete, milestone complete (all dashboard phases done)

## Current Position

Phase: 05-database-token-refactor
Plan: 05 (Delete Gas Sponsorship Endpoint)
Status: Complete
Last activity: 2026-03-03 — Completed 05-05 (Gas sponsorship backend endpoint deleted - no blockchain transactions needed)

Progress: █████░░░░░ 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 32
- Average duration: 7.8 min
- Total execution time: 4.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-pwa-foundation | 3 | 3 | 11.5 min |
| 2-auth-wallet-core-ui | 4 | 7 | 12.0 min |
| 3-topup-payments | 3 | 3 | 24.5 min |
| 3.5-merchant-management | 6 | 7 | 5.9 min |
| 4-merchant-experience | 4 | 7 | 8.5 min |
| 4.1-merchant-notifications | 1 | 1 | 2.0 min |
| 4.2-user-app-ux | 1 | 1 | 2.0 min |
| 4.3-user-dashboard-ux | 3 | 4 | 3.3 min |
| 04.4-dashboard-refactor | 4 | 4 | 1.5 min |
| quick-tasks | 2 | 2 | 2.0 min |

**Recent Trend:**
- Last 3 plans: 1 min (quick-003), 3 min (quick-001), 3 min (04.4-04)
- Trend: Phase 5 database token refactor in progress
- Next: Complete remaining plans in 05-database-token-refactor phase (04-08)
| Phase 05-database-token-refactor P05 | 2 | 1 tasks | 1 files |

## Session Continuity

Last session: 2026-01-20T21:08:00Z
Stopped at: Completed Quick task 003 (Fix Inventory Card Layout and Tabs)
Resume file: None

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Refactor merchant sales screen ui | 2026-01-20 | ddce6b33f | [001-refactor-merchant-sales-screen-ui](./quick/001-refactor-merchant-sales-screen-ui/) |
| 002 | Refactor merchant inventory to 2-column grid | 2026-01-20 | 7385971c1 | [002-refactor-merchant-inventory-grid-layout](./quick/002-refactor-merchant-inventory-grid-layout/) |
| 003 | Fix inventory card layout with category tabs | 2026-01-20 | f4aadf1bd | [003-fix-inventory-card-layout-tabs](./quick/003-fix-inventory-card-layout-tabs/) |
| 004 | Improve merchant terminal accessibility | 2026-01-21 | e31783082 | [004-improve-merchant-terminal-accessibility](./quick/004-improve-merchant-terminal-accessibility/) |

---

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From Plan 1-01:**
1. Used `@ducanh2912/next-pwa` instead of `next-pwa` - actively maintained for Next.js 16
2. Added `turbopack: {}` config to resolve webpack/turbopack conflict with PWA plugin
3. Separated viewport export for Next.js 16 compatibility (themeColor, viewport config)
4. Created Python PIL script for icon generation (portable, no ImageMagick dependency)
5. Used single `"purpose": "any"` value instead of `"any maskable"` due to TypeScript type constraints

**From Plan 1-02:**
6. Used Serwist instead of Workbox - Next.js 16 compatible, actively maintained
7. Created JavaScript service worker instead of TypeScript - inject-manifest CLI doesn't compile TS
8. Manual service worker registration - @serwist/next auto-registration broken with Turbopack
9. CLI-based SW generation - bypassed Turbopack compatibility issue with @serwist/next plugin
10. Cache strategies: CacheFirst for Google Fonts, StaleWhileRevalidate for static assets, NetworkFirst for API calls

**From Plan 1-03:**
11. localStorage for visit tracking - prompts on 2nd visit (not aggressive)
12. Separate iOS component - Safari doesn't support beforeinstallprompt
13. Bottom banner placement - non-intrusive but visible
14. QR code uses local network IP for testing - update for production

**From Plan 2-01:**
15. Modal-based Privy auth - single login button shows Google/Apple in Privy UI (cleaner UX)
16. SSR-safe PrivyProvider - useState + useEffect pattern for client-side only initialization
17. Embedded Solana wallet auto-creation on login - users-without-wallets setting

**From Plan 2-02:**
18. Convex stub types with any annotations - enables build without deployment configuration
19. Denormalized walletAddress in wallets table - avoids join for balance queries
20. Separate users/wallets tables - user profile independent from balance data
21. Auto-create wallet with zero balance - ensures wallet record exists on user creation
22. Index on walletAddress in both tables - primary lookup pattern for all operations

**From Plan 2-03:**
23. Auth bridge via useEffect - usePrivyAuth hook listens to Privy auth state and triggers Convex user creation
24. Idempotent user creation - createFromPrivy checks for existing user before inserting, preventing duplicates
25. Nested providers: PrivyAuthProvider (outer) -> ConvexClientProvider (inner) - maintains SSR-safe pattern
26. Auto-user creation on login - no separate registration step, user records created automatically on first auth

**From Plan 2-04:**
27. SSR-safe Convex provider with dummy client - provides dummy ConvexReactClient during build, real client in browser
28. Stub function references with string identifiers - enables Convex functions to be referenced during build without real types
29. force-dynamic export on real-time pages - prevents SSR pre-rendering issues with Convex hooks
30. Module index re-exports - created convex/_generated/index.ts for cleaner imports and better module resolution

**From Plan 3-01:**
31. Mock top-up with 2-second delay - simulates network request for realistic UX
32. Mock transaction signature format - `mock_${timestamp}_${random}` provides unique IDs
33. Separate success screen for top-ups - displays signature with "View Dashboard" button
34. TopUpBundle component state management - maintains own loading/purchased state for clean separation
35. Next.js 16 router API - use URL string syntax, not object with pathname/query (fixed bug in scan page)

**From Plan 3-02:**
36. html5-qrcode library for QR scanning - cross-platform PWA compatibility with iOS Safari
37. 100ms DOM render delay - prevents React 18 Strict Mode race condition with element initialization
38. Always-render scanner element - never conditionally render to maintain stable DOM reference
39. Separate parse/validate functions - isValidSolanaPayURL() returns boolean, parseSolanaPayURL() throws errors
40. Camera permission handling with retry UI - user-friendly error states for permission denial

**From Plan 3-03:**
95. Used @solana/web3.js directly for transaction building instead of @solana/kit - complete functionality with better documentation
96. VersionedTransaction (v0) for modern Solana transaction format - future-proof and compatible with Privy signing
97. Amount conversion between display and base units - parseTokenAmount() converts display → base units for SPL transfers (9 decimals)
98. Convex transaction record created as PENDING before on-chain submission - provides audit trail even if Solana transaction fails
99. ATA created idempotently for recipient if needed - createAssociatedTokenAccountIdempotentInstruction() checks and creates ATA if missing
100. Balance query invalidated after successful payment - queryClient.invalidateQueries() triggers real-time balance update

**From Plan 3.5-01:**
41. Mock wallet generation for POC - deterministic base58 encoding from email hash
42. Email validation in both client and server - defense in depth for duplicate prevention
43. No wallet display in merchant registration - merchants never see their wallet address

**From Plan 3.5-03:**
44. Events table supports both predefined and custom types - type field stores standard categories (Concert, Sports, Festival) while customType stores custom names when type="Custom"
45. Date stored as ISO string - using ISO date strings (e.g., "2026-07-15") for better readability and easier date manipulation, no future date validation
46. Color-coded type badges for events - each predefined type has distinct color (Concert=blue, Sports=green, Festival=purple, Custom=gray) for quick visual scanning
47. Conditional custom type field - custom type input only appears when "Custom" selected, keeping form clean while guiding user input

**From Plan 3.5-04:**
48. Composite index for junction table uniqueness - by_event_merchant index on (eventId, merchantId) prevents duplicate merchant assignments to same event
49. Booth number as required field in junction table - ensures every merchant assignment has a physical location mapping for event operations
50. Approved merchant validation in assignment mutation - assignMerchantToEvent validates merchant.status === "approved" before creating assignment
51. Join queries in backend for complete data - getEventAssignments and getMerchantAssignments fetch related entity details and return sorted results
52. Two-panel master-detail admin UI pattern - left panel for entity selection, right panel for related items, following established /admin/events pattern

**From Plan 3.5-02:**
53. Admin access control via email domain check - dashboard restricted to @dcwlt.com emails for security
54. Audit trail on merchant status changes - reviewedBy, reviewedAt, notes tracked for all approve/reject actions
55. Separate mutations for approve/reject - clear semantic separation with different optional note fields

**From Plan 3.5-05:**
56. Stock field optional (null = unlimited) - supports both limited and unlimited inventory items without separate tables
57. Items reference merchantEvent junction table (not merchant directly) - enables merchant-specific pricing per event
58. Price stored as number in EVT tokens (not smallest unit) - admin-friendly display without decimal conversion
59. Join queries return merchant details in getEventInventory - complete context for inventory display without N+1 queries
60. Color-coded stock warnings (yellow < 10, red = 0) - visual inventory management for proactive restocking

**From Plan 3.5-06:**
61. Admin layout with fixed sidebar on desktop, collapsible hamburger menu on mobile - provides consistent navigation across all admin pages
62. Cast Privy email to string for domain check - Email type doesn't support string methods like endsWith()
63. Convex mutations called directly as functions - useMutation returns callable function, not object with .mutate() method
64. Low balance threshold set at 10 EVT - yellow warning indicators for proactive merchant wallet management
65. Wallet monitoring joins merchants table with wallets table via walletAddress - enables dashboard balance display without foreign key

**From Plan 04-01:**
66. MerchantAuthProvider handles all authentication logic and status checks - validates merchant status (pending, approved, rejected) and redirects to home with appropriate error messages
67. Merchant portal uses same design system as admin panel - consistent UI/UX across both interfaces (sidebar navigation, color scheme, responsive patterns)
68. Sales display is placeholder until sales tracking is implemented - dashboard shows empty state with note that sales tracking will come in later phase
69. Wallet balance queried through existing wallets table - added getWalletByAddress query to look up merchant wallets by address for balance display

**From Plan 04-02:**
70. Auto-select first event when merchant has multiple event assignments - improves UX by not requiring selection when only one option exists
71. Accordion expand/collapse managed via Set<string> for O(1) lookups - efficient state management for expanded groups
72. Stock color coding: green (>5), yellow (1-5), red (0) - visual inventory status indicators for proactive restocking
73. Unlimited stock displayed as "Unlimited" when stock is null - clear distinction between limited and unlimited inventory
74. getMerchantItemOverrides query added to look up merchant-specific pricing and stock overrides - enables per-merchant customization

**From Plan 04-03:**
75. Use qrcode library for client-side QR code generation on HTML5 canvas - avoids server-side generation and enables instant QR code display
76. Solana Pay URL format: solana:address?amount=X&spl-token=Y&reference=Z - standardized URL format for Solana Pay transactions with item reference
77. TOKEN_MINT_ADDRESS defined inline in QRCodeGenerator component (same as useSolanaBalance hook) - consistent with existing pattern for token mint address
78. Download PNG converts canvas to blob and creates download link - enables merchants to save QR codes as images for printing
79. Print button opens browser print dialog with @media print CSS to hide non-QR elements - clean print output showing only QR code
80. QR code modal shows item name, price, and Solana Pay URL for reference - merchants can verify QR code contents before printing

**From Plan 04-04:**
81. Transaction status uses union type with literal values (pending, confirmed, failed) for type safety and TypeScript exhaustiveness checking
82. Timestamp stored as Unix milliseconds for easy date range filtering and relative time calculation without complex date libraries
83. Transaction amount stored as number in EVT tokens (not smallest unit) for merchant-friendly display without decimal conversion
84. Transaction signature optional in table - pending transactions have no signature until confirmed on Solana
85. Composite index byMerchantByTime on (merchantId, timestamp) supports efficient date range queries without table scans
86. Sales stats calculations only include confirmed transactions - pending and failed excluded to prevent misleading revenue metrics
87. Relative time formatting ("2h ago", "Yesterday") used instead of absolute timestamps for better UX and readability
88. Date range filter buttons use pill-shaped UI with active state highlighting - follows admin dashboard pattern for consistency
89. Search input for wallet addresses uses 300ms debounce delay to prevent excessive Convex queries while typing
90. Mock transaction seeding function generates 10-20 transactions with varied timestamps and statuses - enables UI testing before real payment flow
91. Sales page amount displayed in red color to represent money out from customer perspective - matches payment UX patterns

**From Plan 04.1-01:**
92. Client-side filtering preserves stable WebSocket subscription - unfiltered query with stable parameters + useMemo for filtered data prevents resubscription on filter changes
93. Toast notifications use sonner library for modern, React 19-compatible alerts with custom styling matching merchant portal theme
94. Limited live query to last 100 transactions for performance while covering reasonable event volume - balances data transfer with real-time responsiveness

**From Plan 04.2-01:**
95. Removed countdown timer from payment confirmation — users already scanned QR code intentionally, countdown adds unnecessary friction
96. Merchant name from Convex lookup — use businessName from merchants table instead of "Unknown Merchant" placeholder
97. Mobile-responsive button layout — stack buttons vertically on mobile (< 640px) with min-height 44px for better thumb reach and accessibility
98. Privy action sheet is necessary security UX — cannot be disabled, part of non-custodial wallet security model

**From Plan 04.3-01:**
99. Added byCustomerByTime index on transactions table — efficient customer wallet lookups ordered by timestamp
100. listUserTransactions query joins with groupItems table — fetches item names without N+1 queries
101. useUserTransactions hook uses "skip" token pattern — prevents query execution when wallet unavailable

**From Plan 04.3-02:**
102. User initials extracted from email — DashboardHeader shows first character of email as avatar
103. BalanceCard visibility toggle masks balance by default — eye icon button to show/hide balance
104. Gradient background on BalanceCard — purple-to-pink gradient for visual prominence
105. Top Up links to /topup page — reuses existing top-up flow from Phase 3
106. Cash Out shows "Coming Soon" toast — placeholder for future cash-out feature

**From Plan 04.3-03:**
107. formatTransactionTime utility — relative time formatting (Just now, 2m ago, Today, Yesterday)
108. TransactionItem color-coded amounts — red color for expenses (payments), primary color for income
109. TransactionList with 5 transaction limit — shows recent activities without overwhelming dashboard
110. DashboardBottomNav with elevated center scan button — 56px touch targets, safe-area-inset-bottom for notched devices
111. Loading skeleton with pulse animation — improves perceived performance during data fetch

**From Plan 04.4-01:**
112. CSS custom properties for colors and gradients — centralized design tokens in globals.css for consistency
113. Shadow elevation system — systematic shadow scale (xs, sm, md, lg) for depth hierarchy
114. 64px action-button-circle size — larger touch targets for better mobile UX

**From Plan 04.4-02:**
115. Pure CSS gradient for BalanceCard — removes external image dependency, faster loading
116. Hero typography scale (56px) for balance display — establishes clear visual hierarchy
117. Premium spacing (32px) on BalanceCard — elevated feel with generous padding
118. 48x48px eye icon touch target — exceeds minimum 44px requirement for comfortable interaction
119. Floating action buttons without container — cleaner design, buttons stand independently
120. Hover scale animations (1.05) with 200ms duration — smooth interactive feedback on desktop

**From Plan 04.4-03:**
121. Category-based icon mapping — helper function maps category strings to Material Symbols (food=restaurant, tech=devices, income=payments, transport=directions_car)
122. Category-based color coding — helper function maps categories to semantic colors (food=orange, tech=blue, income=green, transport=purple, default=gray)
123. Semantic amount colors with +/- prefix — cyan (#00BCD4) for positive amounts with + prefix, red-orange (#FF6B35) for negative amounts with - prefix
124. Shadow elevation replaces borders — using shadow-elevation-sm instead of border-white/5 for modern depth without visible borders
125. Transaction item spacing — 88px min-height, 20px horizontal padding (px-5), 16px gap between items (gap-4)
126. Link component for navigation — "See All" changed from span to Next.js Link with hover underline for proper navigation

**From Plan 04.4-04:**
127. Material Symbols Outlined font loaded via Google Fonts — supports FILL weight for icon variants
128. Removed category prop from TransactionItem — Convex transaction schema doesn't include category field, reverted to static "payments" icon
129. Systematic color palette applied throughout — #0F192E for cards, #141E33 for elevated surfaces, #00BCD4 for primary accents
130. Shadow elevation replacing all borders — bottom nav uses shadow-[0_-4px_10px_rgba(0,0,0,0.3)] for upward elevation
131. Design system consistency complete — all dashboard components use unified color palette and shadow elevation

**From Quick Task 001:**
132. Custom gradient utility class (.custom-gradient) for merchant portal cards — CSS utility in globals.css with gradient rgba(35,48,56,1) to rgba(16,28,34,1) for consistent dark theme styling across sales and inventory screens

**From Quick Task 003:**
133. Category tabs UI pattern — sticky header with border-b-2 active indicator (#13a4ec) for inventory filtering
134. Per-card color schema field — optional hex color field on itemGroups table with fallback DEFAULT_GROUP_COLORS mapping
135. EVT currency styling — primary blue (#13a4ec) color for EVT text in price labels
136. useMemo for performance optimization — category extraction and filtered items computed once per data change
137. Dynamic inline styles for card backgrounds — linear-gradient with hex color opacity (dd to aa) for depth
138. Price positioning bottom-right — absolute positioning with text-right alignment for card price display

**From Plan 05-03:**
139. QR codes use simplified Solana Pay URL format — removed spl-token parameter for database token system (format: solana:<address>?amount=<price>&reference=<itemId>)
140. Parser already handles optional spl-token gracefully — searchParams.get returns null if parameter missing, no code changes needed

**From Plan 05-02:**
139. Top-up uses incrementBalance mutation instead of setMockBalance — cleaner API passing amount to add, not total
140. React Query invalidation removed for top-up — Convex subscriptions provide real-time balance updates automatically
141. Database-only top-up flow — no Solana transaction or backend API call required for balance updates
