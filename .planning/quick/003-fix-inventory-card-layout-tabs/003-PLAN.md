---
phase: 003-quick-fix
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - pwa/app/components/MerchantInventory.tsx
  - pwa/convex/schema.ts
  - pwa/convex/itemGroups.ts
autonomous: true

must_haves:
  truths:
    - Category tabs (Beverage, Snacks, Food) appear at top of inventory page
    - Active category tab has blue underline (#13a4ec)
    - Clicking a tab filters items to show only that category
    - EVT text in price is colored blue (#13a4ec)
    - Each card has its own color based on item group
    - Price is positioned bottom-right with proper spacing
  artifacts:
    - path: pwa/app/components/MerchantInventory.tsx
      provides: Category tabs and filtered card rendering
      contains: "useState.*selectedCategory|category.*tabs"
    - path: pwa/convex/schema.ts
      provides: Color field for item groups
      contains: "color.*v.optional(v.string())"
    - path: pwa/convex/itemGroups.ts
      provides: Migration to add color field
      contains: "color.*string"
  key_links:
    - from: pwa/app/components/MerchantInventory.tsx
      to: pwa/convex/itemGroups.ts
      via: useQuery api.itemGroups.getMerchantItemsWithOverrides
      pattern: "useQuery.*getMerchantItemsWithOverrides"
---

<objective>
Fix merchant inventory card layout to match screenshot with category tabs, proper EVT color styling, and per-card colors.

Purpose: The inventory page needs category filtering tabs at the top (Beverage, Snacks, Food) similar to the HTML reference, with proper styling for EVT text (blue #13a4ec) and unique colors per card based on item group.

Output: Updated MerchantInventory component with category tabs, EVT text colored in primary blue, color field added to item groups schema, and per-card color rendering.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@pwa/app/components/MerchantInventory.tsx
@pwa/convex/schema.ts
@pwa/convex/itemGroups.ts
@pwa/app/globals.css

Current state:
- Inventory displays all items in 2-column grid with no category filtering
- EVT text uses default white color (should be #13a4ec)
- All cards use same "custom-gradient" class (should vary by item group)
- Price is bottom-left (should be bottom-right per screenshot)
- Schema has no color field for item groups

Color reference from globals.css:
- Primary: --primary: #0EA5E9 (matches #13a4ec approximately)
- Category colors: --category-food: #FB8C00, --category-tech: #42A5F5, etc.

Tab reference HTML (from planning context):
```html
<nav class="bg-background-light dark:bg-background-dark sticky top-[72px] z-10 border-b border-gray-200 dark:border-slate-800">
<div class="flex px-4 gap-8">
<a class="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-4">
<span class="text-sm font-bold leading-normal tracking-wide">Beverage</span>
</a>
```
</context>

<tasks>

<task type="auto">
  <name>Add color field to item groups schema</name>
  <files>pwa/convex/schema.ts, pwa/convex/itemGroups.ts</files>
  <action>
    1. In pwa/convex/schema.ts, add color field to itemGroups table:
       - Add after description field: `// Optional color for card backgrounds (hex code)`
       - Add: `color: v.optional(v.string()),`

    2. In pwa/convex/itemGroups.ts:
       - Update createGroup mutation to accept optional color parameter
       - Update updateGroup mutation to allow color updates
       - Add validation for hex color format (e.g., #13a4ec, #FB8C00)

    3. DO NOT run migration yet - this will be done via existing schema update flow
  </action>
  <verify>Check that schema compiles: npx convex dev</verify>
  <done>Schema accepts color field, mutations updated to handle color parameter</done>
</task>

<task type="auto">
  <name>Add category tabs and filtering to MerchantInventory</name>
  <files>pwa/app/components/MerchantInventory.tsx</files>
  <action>
    1. Extract unique item groups from merchantItems data (use groupData.group.name)

    2. Add state for selected category:
       ```typescript
       const [selectedCategory, setSelectedCategory] = useState<string>('All');
       ```

    3. Create category tabs component (ABOVE the grid):
       - Render tabs for: "All" + each unique group name
       - Active tab style: border-b-2 border-[#13a4ec] text-[#13a4ec]
       - Inactive tab: border-b-2 border-transparent text-[#9db0b9]
       - Use sticky positioning below any header
       - Flex layout with gap-8, horizontal scroll on mobile

    4. Filter allItems based on selectedCategory:
       - If 'All', show all items
       - Otherwise, only show items from selected group (track group name on each item)

    5. Pass group color to InventoryItemCard:
       - Add color prop to card component
       - Use group color if available, otherwise default to colors from globals.css:
         * Beverages: #42A5F5 (tech blue)
         * Food: #FB8C00 (orange)
         * Snacks: #66BB6A (green)
  </action>
  <verify>Check that tabs appear and filter correctly</verify>
  <done>Category tabs visible at top, clicking filters items, "All" shows everything</done>
</task>

<task type="auto">
  <name>Update card styling - EVT color, card colors, price position</name>
  <files>pwa/app/components/MerchantInventory.tsx</files>
  <action>
    1. Fix EVT text color to use primary blue (#13a4ec):
       - Change: `<span className="text-sm">EVT</span>`
       - To: `<span className="text-[#13a4ec] text-sm">EVT</span>`

    2. Add color prop to InventoryItemCard interface:
       ```typescript
       interface InventoryItemCardProps {
         item: any;
         onGenerateQR: (effectivePrice: number, item: any) => void;
         color?: string; // hex color for card background
       }
       ```

    3. Apply color to card background:
       - Replace `className="custom-gradient"` with dynamic style
       - Use inline style for color overlay or gradient tint
       - Pattern: `style={{ backgroundColor: color || '#1a2f38' }}`
       - Keep the border and hover states

    4. Fix price position to bottom-right:
       - Change from `absolute bottom-4 left-4`
       - To: `absolute bottom-4 right-4`
       - Adjust text alignment to right

    5. Ensure proper spacing:
       - Price should not overlap description
       - Add padding to card to accommodate bottom-right price
       - Description should have line-clamp to prevent overflow

    Reference from HTML:
    ```html
    <p class="text-white text-base font-bold">15 <span class="text-primary text-xs tracking-tighter">EVT</span></p>
    ```
  </action>
  <verify>Visual inspection - EVT is blue, price bottom-right, cards have different colors</verify>
  <done>EVT text is #13a4ec blue, price positioned bottom-right, each card shows unique color based on group</done>
</task>

</tasks>

<verification>
1. Load merchant inventory page at http://localhost:3000/merchant/inventory
2. Verify category tabs appear at top (Beverage, Food, Snacks, All)
3. Click each tab and verify only items from that category appear
4. Verify "All" tab shows all items
5. Verify EVT text in price is colored blue (#13a4ec)
6. Verify each card has unique color based on its item group
7. Verify price is positioned at bottom-right corner of card
8. Verify stock badge remains in top-right position
9. Verify item name remains in top-left position
10. Test responsive behavior on mobile (tabs scroll horizontally)
</verification>

<success_criteria>
- Category tabs render above inventory grid
- Active tab has blue underline (#13a4ec)
- Clicking tabs filters items correctly
- EVT currency text is blue (#13a4ec)
- Price displays in bottom-right corner
- Each item group has distinct card color
- Schema supports color field for future admin configuration
- Layout matches screenshot reference
</success_criteria>

<output>
After completion, create `.planning/quick/003-fix-inventory-card-layout-tabs/003-SUMMARY.md`
</output>
