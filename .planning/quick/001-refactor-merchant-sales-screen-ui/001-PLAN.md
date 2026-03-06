---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - pwa/app/merchant/sales/page.tsx
  - pwa/app/globals.css
autonomous: true
user_setup: []

must_haves:
  truths:
    - Sales screen displays stats cards with the new dark gradient style
    - Transaction table uses the updated dark theme with proper hover states
    - Date filter buttons have the new active/inactive state styling
    - Search input matches the dark theme design
    - Status badges use proper color schemes (green/yellow/red)
    - Explorer links are styled correctly
  artifacts:
    - path: pwa/app/merchant/sales/page.tsx
      provides: "Sales history page with refactored UI"
      contains: "stats cards with gradient backgrounds, styled filters, transaction table"
    - path: pwa/app/globals.css
      provides: "Custom gradient classes for sales cards"
      contains: ".custom-gradient class"
  key_links:
    - from: "pwa/app/merchant/sales/page.tsx"
      to: "pwa/app/globals.css"
      via: "className references"
      pattern: "custom-gradient"
---

<objective>
Refactor the merchant sales screen UI to match the new design pattern with dark gradient cards and improved styling.

Purpose: Apply consistent visual design across the merchant portal matching the new inventory screen style.
Output: Updated sales page with gradient backgrounds, consistent colors, and improved visual hierarchy.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@pwa/app/merchant/sales/page.tsx
@pwa/app/globals.css
@pwa/package.json

Current sales page has:
- 4 stats cards (Total Sales, Transactions, Average, Today)
- Date range filter buttons (Today, Week, Month, All Time)
- Search input for wallet addresses
- Transaction table with columns: Time, Item, Amount, Customer, Status, Actions

Design pattern to apply (from reference):
- Custom gradient: rgba(35,48,56,1) to rgba(16,28,34,1)
- Primary color: #13a4ec (already used in current page)
- Card hover effects with border transitions
- Proper spacing and rounded corners
- Touch feedback on interactive elements
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add custom gradient utility to globals.css</name>
  <files>pwa/app/globals.css</files>
  <action>
    Add a new utility class for the custom gradient used on cards:

    ```css
    /* Custom gradient for sales/inventory cards */
    .custom-gradient {
      background: linear-gradient(180deg, rgba(35,48,56,1) 0%, rgba(16,28,34,1) 100%);
    }
    ```

    Add to end of globals.css, before the closing comment block.
  </action>
  <verify>grep -n "custom-gradient" pwa/app/globals.css returns the new class definition</verify>
  <done>Custom gradient class exists and can be applied via className</done>
</task>

<task type="auto">
  <name>Task 2: Refactor stats cards to use custom gradient styling</name>
  <files>pwa/app/merchant/sales/page.tsx</files>
  <action>
    Update the 4 stats cards (Total Sales, Transactions, Average, Today) to use the new gradient styling:

    1. Replace `bg-[#1a2f38]` with `custom-gradient` className
    2. Ensure border transition uses `hover:border-[#13a4ec]/50` (already present)
    3. Verify rounded-lg corners are applied
    4. Keep all existing icon colors and data displays unchanged

    The cards section starts at line 116 with comment "Summary Cards".
  </action>
  <verify>grep -c "custom-gradient" pwa/app/merchant/sales/page.tsx returns 4 (one per stats card)</verify>
  <done>All 4 stats cards use custom-gradient background with proper hover effects</done>
</task>

<task type="auto">
  <name>Task 3: Refactor filters and transaction section for consistent dark theme</name>
  <files>pwa/app/merchant/sales/page.tsx</files>
  <action>
    Update the filters section and transaction list container:

    1. Filters container (line 178): Replace `bg-[#1a2f38]` with `custom-gradient`
    2. Transaction list container (line 215): Replace `bg-[#1a2f38]` with `custom-gradient`
    3. Ensure date filter buttons maintain proper active/inactive states:
       - Active: `bg-[#13a4ec] text-white`
       - Inactive: `bg-[#101c22] text-[#9db0b9] hover:text-white`
    4. Verify search input styling matches: `bg-[#101c22]` with focus state `focus:border-[#13a4ec]`
    5. Confirm table hover state uses: `hover:bg-[#243b47]/50`
  </action>
  <verify>grep -c "custom-gradient" pwa/app/merchant/sales/page.tsx returns 6 (4 cards + filters + transaction container)</verify>
  <done>Filters and transaction sections use consistent dark gradient theme with proper interactive states</done>
</task>

</tasks>

<verification>
1. Start dev server: `cd pwa && npm run dev`
2. Navigate to merchant sales page (requires merchant auth)
3. Verify stats cards display with gradient background
4. Test date filter buttons show proper active/inactive states
5. Verify search input has correct dark theme styling
6. Confirm transaction table rows show hover effect
7. Check status badges have correct colors (green/yellow/red)
8. Verify explorer links are styled and clickable
</verification>

<success_criteria>
- All stats cards use custom-gradient background
- Filters and transaction container use custom-gradient background
- Date filter buttons have distinct active/inactive visual states
- Search input matches dark theme with focus state
- Transaction table has proper hover effects on rows
- Status badges use semantic colors correctly
- No layout breaks or visual regressions
- Page remains fully functional with all existing features working
</success_criteria>

<output>
After completion, create `.planning/quick/001-refactor-merchant-sales-screen-ui/001-SUMMARY.md`
</output>
