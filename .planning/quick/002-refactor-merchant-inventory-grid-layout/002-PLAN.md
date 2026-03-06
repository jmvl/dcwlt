---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - pwa/app/components/MerchantInventory.tsx
autonomous: true

must_haves:
  truths:
    - "Items display in a 2-column grid layout"
    - "Each item is a square card with dark gradient background"
    - "Stock status badge displays in correct color (green/yellow/red)"
    - "Price displays prominently in bottom-right corner"
    - "QR button generates QR code for selected item"
    - "All existing Convex queries still function correctly"
  artifacts:
    - path: "pwa/app/components/MerchantInventory.tsx"
      provides: "2-column grid layout for inventory items"
      contains: "grid-cols-2"
    - path: "pwa/app/components/MerchantInventory.tsx"
      provides: "Square card component for each item"
      contains: "aspect-square"
  key_links:
    - from: "pwa/app/components/MerchantInventory.tsx"
      to: "api.itemGroups.getGroupItems"
      via: "useQuery hook"
      pattern: "useQuery.*getGroupItems"
    - from: "pwa/app/components/MerchantInventory.tsx"
      to: "api.itemGroups.getMerchantItemOverrides"
      via: "useQuery hook for price/stock overrides"
      pattern: "useQuery.*getMerchantItemOverrides"
---

<objective>
Refactor the merchant inventory screen from accordion-style layout to a 2-column grid layout with square cards.

Purpose: Improve visual presentation and UX of the merchant inventory interface to match the provided screenshot design.
Output: Modern grid-based inventory display with touch-friendly cards.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/002-refactor-merchant-inventory-grid-layout

# Current implementation
@pwa/app/components/MerchantInventory.tsx

# Existing styles
@pwa/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Refactor to 2-column grid layout with square cards</name>
  <files>pwa/app/components/MerchantInventory.tsx</files>
  <action>
    Replace the accordion-style layout with a flat 2-column grid:

    1. Remove `expandedGroups` state and `toggleGroup` function - no longer needed
    2. Remove the `ExpandedItems` and `ItemRow` components
    3. Create a single grid container: `<div className="grid grid-cols-2 gap-4">`
    4. Create a new `InventoryItemCard` component with:
       - Square aspect ratio: `aspect-square`
       - Dark gradient: `custom-gradient` class
       - Border: `border border-[#1a2f38]`
       - Hover effect: `hover:border-[#13a4ec]/50`
       - Touch feedback: `active:scale-95 transition-transform`
       - Flex layout for positioning content:
         - Item name top-left (large, bold text-white)
         - Stock badge top-right (getStockBadgeColor logic)
         - Description below name (small text-[#9db0b9])
         - Price bottom-right (text-lg font-bold text-white)
         - QR button either as a tap action on the whole card OR as a small icon button in corner

    5. Card content structure:
       ```tsx
       <div className="custom-gradient aspect-square rounded-lg border border-[#1a2f38] hover:border-[#13a4ec]/50 active:scale-95 transition-all p-4 relative">
         {/* Top row: name (left) + stock (right) */}
         <div className="flex justify-between items-start">
           <h3 className="font-bold text-white text-lg">{item.name}</h3>
           <span className={`text-xs px-2 py-1 rounded ${getStockBadgeColor(effectiveStock)}`}>
             {effectiveStock === null || effectiveStock === undefined ? 'In Stock' : effectiveStock.toString()}
           </span>
         </div>
         {/* Description */}
         {item.description && (
           <p className="text-sm text-[#9db0b9] mt-2 line-clamp-2">{item.description}</p>
         )}
         {/* Bottom: price + QR button */}
         <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <div className="text-lg font-bold text-white">
             {effectivePrice.toFixed(2)} <span className="text-sm">EVT</span>
           </div>
           <button onClick={() => onGenerateQR(effectivePrice, item)} className="bg-[#13a4ec] hover:bg-[#0d8ac4] p-2 rounded-lg">
             <QrCode className="w-5 h-5 text-white" />
           </button>
         </div>
       </div>
       ```

    6. Flatten the data structure: Query all items from all assigned groups and display them in the grid
    7. Preserve the `getStockBadgeColor` function for stock status colors
    8. Keep the QR modal state and logic unchanged

    IMPORTANT: Do NOT modify any Convex queries or the override logic - only change the layout.
  </action>
  <verify>
    1. Component renders without errors
    2. Grid displays in 2 columns
    3. Cards are square (aspect-square)
    4. Stock badges show correct colors
  </verify>
  <done>
    Inventory displays as a 2-column grid of square cards with dark gradient backgrounds
  </done>
</task>

<task type="checkpoint:human-verify">
  <what-built>Complete refactored inventory grid layout with square cards</what-built>
  <how-to-verify>
    1. Start the dev server: cd pwa && npm run dev
    2. Navigate to merchant inventory page
    3. Verify:
       - Items display in a 2-column grid
       - Cards are square with dark gradient background
       - Stock badges show correct colors (green=in stock, yellow=low stock, red=out of stock)
       - Price displays in bottom-right
       - QR button appears on each card and opens the QR modal
       - Touch feedback works (scale animation on tap/click)
    4. Test that QR generation still works by clicking QR button on an item
  </how-to-verify>
  <resume-signal>Type "approved" or describe any layout issues to fix</resume-signal>
</task>

</tasks>

<verification>
- Grid layout renders with 2 columns
- Cards maintain aspect-square ratio
- All Convex queries execute without errors
- Stock override logic still works
- QR code generation modal opens correctly
- No console errors
</verification>

<success_criteria>
- MerchantInventory.tsx uses grid-cols-2 layout
- Each item rendered as a square card with custom-gradient background
- Stock status badge displays with correct color coding
- Price displayed in bottom-right of each card
- QR button functional and generates codes correctly
- All existing Convex queries preserved
</success_criteria>

<output>
After completion, create `.planning/quick/002-refactor-merchant-inventory-grid-layout/002-SUMMARY.md`
</output>
