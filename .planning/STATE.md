# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Frictionless payments at scale
**Current focus:** Phase 4.2 complete, ready for Phase 5

## Current Position

Phase: 4.3 of 6 (User Dashboard UX)
Plan: 01 of 4 (User Transaction Index and Query)
Status: Complete
Last activity: 2026-01-20 — Completed Plan 04.3-01 (User Transaction Index and Query)

Progress: ███████████ 92.2%

## Performance Metrics

**Velocity:**
- Total plans completed: 24
- Average duration: 9.1 min
- Total execution time: 3.66 hours

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
| 4.3-user-dashboard-ux | 1 | 4 | 4.0 min |

**Recent Trend:**
- Last 3 plans: 4 min (04.3-01), 2 min (04.2-01), 2 min (04.1-01)
- Trend: Phase 4.3 (User Dashboard UX) starting - building transaction history foundation
- Next: Plan 04.3-02 (Dashboard Components)

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
95. Removed countdown timer from payment confirmation - users already scanned QR code intentionally, countdown adds unnecessary friction
96. Merchant name from Convex lookup - use businessName from merchants table instead of "Unknown Merchant" placeholder
97. Mobile-responsive button layout - stack buttons vertically on mobile (< 640px) with min-height 44px for better thumb reach and accessibility
98. Privy action sheet is necessary security UX - cannot be disabled, part of non-custodial wallet security model

**From Plan 04.3-01:**
99. User transaction queries mirror merchant queries - byCustomerByTime index follows same pattern as byMerchantByTime for consistency
100. Real-time hooks use "skip" token when required params unavailable - useUserTransactions passes "skip" when walletAddress is undefined
101. Item name lookup via join query - listUserTransactions fetches item names from groupItems table for display

**From Plan 04.3-02:**
102. User initials extracted from email for profile avatar - no image upload required, shows first 2 characters of email username
103. Balance masked by default for privacy - shows ••••••• until user taps eye icon to reveal actual amount
104. Cash Out shows 'Coming Soon' toast - feature not implemented, toast notifies users of future availability
105. Mobile-width container (480px max) for consistent mobile UX - ensures dashboard looks correct on all screen sizes
106. pb-24 padding reserved for bottom navigation - space allocated for navigation bar (will be added in plan 04.3-03)
107. Action buttons use shared CSS utility class (action-button-circle) - consistent styling for Top Up and Cash Out buttons
108. Material Symbols Outlined used for dashboard icons - notifications, add, account_balance (already loaded via layout.tsx)
109. Lucide-react icons used for toggle states - Eye/EyeOff for balance visibility toggle

### Pending Todos

None yet.

### Blockers/Concerns

**Privy app ID required:** Need to create Privy app and configure NEXT_PUBLIC_PRIVY_APP_ID before testing OAuth flow. See .planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md for setup instructions.

**Convex deployment not configured:** Convex backend initialized but deployment requires interactive authentication (npx convex dev). Stub types allow build to proceed. Full type generation and deployment setup needed before production. See .planning/phases/2-auth-wallet-core-ui/2-02-SUMMARY.md for details.

**Turbopack incompatibility:** @serwist/next plugin doesn't work with Turbopack in development mode. Service worker only generated in production builds. May need to revisit if SW debugging becomes difficult.

**Install prompt not yet tested:** Install prompt components created but not verified in browser. Should test on both Chrome/Edge (native prompt) and iOS Safari (manual instructions).

**Production QR code:** Current QR code points to local network URL (192.168.1.172:3000). Must regenerate with production domain before deployment.

**Balance display shows zero:** Current balance display shows 0 EVT for all users. Needs Phase 3 top-up flow to add tokens, or manual use of setMockBalance mutation for testing. **RESOLVED**: Plan 03-01 completed - mock top-up flow now adds tokens to balance.

**Real transaction recording not implemented:** Sales history uses mock data seeded via seedMockTransactions function. Real transaction recording requires Phase 3 (payments) completion to create transactions from actual Solana payments. **RESOLVED**: Plan 03-03 completed - transactions now recorded in Convex with PENDING → CONFIRMED/FAILED lifecycle when users make payments via QR codes.

## Session Continuity

Last session: 2026-01-20
Stopped at: Completed Plan 04.3-01 (User Transaction Index and Query)
Resume file: None
