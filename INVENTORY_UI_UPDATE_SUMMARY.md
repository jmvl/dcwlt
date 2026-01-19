# Inventory Management UI Update - Item Groups Model

## Summary

Successfully updated the inventory management UI from a per-merchant model to a new event-level item groups architecture. The system now supports reusable item groups that can be assigned to multiple merchants with optional overrides.

## Changes Made

### 1. Backend Schema Updates (`pwa/convex/schema.ts`)

Added four new tables to support the item groups model:

#### **itemGroups** - Event-level item categories
- Links to events via `eventId`
- Fields: `name`, `description`, `order`, `createdAt`, `updatedAt`
- Indexes: `by_event`, `by_event_order`

#### **groupItems** - Items within item groups
- Links to item groups via `itemGroupId`
- Fields: `name`, `description`, `defaultPrice`, `defaultStock`, `order`, `createdAt`, `updatedAt`
- Indexes: `by_group`, `by_group_order`

#### **merchantGroupAssignments** - Links groups to merchants
- Links merchant events to item groups
- Fields: `merchantEventId`, `itemGroupId`, `enabled`, `order`, `createdAt`, `updatedAt`
- Indexes: `by_merchantEvent`, `by_event_group`, `by_merchantEvent_order`

#### **merchantItemOverrides** - Per-merchant property overrides
- Optional price/stock overrides per merchant per item
- Fields: `merchantGroupAssignmentId`, `groupItemId`, `priceOverride`, `stockOverride`, `createdAt`, `updatedAt`
- Indexes: `by_merchantGroupAssignment`, `by_groupItem`

### 2. Convex Functions (`pwa/convex/itemGroups.ts`)

Added comprehensive CRUD operations for the new model:

#### Item Groups
- `createGroup` - Create a new item group for an event
- `updateGroup` - Update group name, description, or order
- `deleteGroup` - Delete a group and all its items
- `getEventItemGroups` - Get all groups for an event with item counts
- `getGroupItems` - Get all items in a specific group

#### Group Items
- `addItemToGroup` - Add an item to a group
- `updateItemInGroup` - Update item properties
- `removeItemFromGroup` - Remove an item from a group

#### Merchant Assignments
- `assignGroupToMerchant` - Assign a group to a merchant
- `unassignGroupFromMerchant` - Remove a group assignment
- `toggleGroupEnabled` - Enable/disable a group for a merchant
- `reorderMerchantGroups` - Reorder groups for a merchant
- `getMerchantGroupAssignments` - Get all assignments for a merchant
- `getMerchantItemsWithOverrides` - Get items with effective prices/stock

#### Item Overrides
- `setItemOverride` - Set price/stock overrides for a merchant's item
- `removeItemOverride` - Remove an override

### 3. UI Components

Created three reusable components in `/pwa/app/admin/inventory/components/`:

#### **TabNavigation.tsx**
- Two-tab navigation: "Item Groups" and "Merchant Assignments"
- Uses Lucide React icons (Layers, Store)
- Active tab highlighting with #13a4ec accent color

#### **GroupCard.tsx**
- Displays item group with name, description, and item count
- Edit and delete buttons with hover effects
- Drag handle for future drag-and-drop reordering
- Responsive design with proper spacing

#### **ItemCard.tsx**
- Displays item with name, description, price, and stock
- Visual indicators for low stock (yellow) and out of stock (red)
- Edit and delete buttons
- Supports unlimited stock display

### 4. Main Inventory Page (`pwa/app/admin/inventory/page.tsx`)

Complete rewrite with two-tab architecture:

#### **Item Groups Tab**
- List of all item groups for the selected event
- Expand/collapse to view items within each group
- Create/edit/delete groups
- Add/edit/delete items within groups
- Item count badges on each group
- Empty state with call-to-action button

#### **Merchant Assignments Tab**
- Left panel: List of merchants assigned to the event
- Right panel: Group assignments for selected merchant
- Shows available groups (not yet assigned)
- Shows assigned groups with enable/disable toggle
- Unassign groups from merchants
- Real-time updates after mutations

#### **Dialogs**
- Create/Edit Item Group dialog
- Create/Edit Item dialog with price and stock fields
- Delete confirmation dialogs for groups and items
- Form validation with error messages
- Success notifications with auto-dismiss

#### **Responsive Design**
- Mobile-first approach
- Grid layout: 1 column on mobile, 3 columns on desktop
- Proper touch targets (minimum 44x44px)
- Loading spinners for async operations
- Error handling with user-friendly messages

## Architecture Benefits

### 1. Reusability
- Item groups are created once at the event level
- Multiple merchants can sell the same items
- No need to recreate items for each merchant

### 2. Flexibility
- Merchants can be assigned any subset of item groups
- Groups can be enabled/disabled per merchant without losing assignments
- Optional price/stock overrides per merchant per item

### 3. Scalability
- Adding a new merchant is as simple as assigning existing groups
- Event organizers can manage the product catalog in one place
- Merchants see only what they're assigned to sell

### 4. Data Integrity
- Default values defined once at the group level
- Overrides are explicit and tracked
- Order is maintained for both groups and items

## Technical Details

### State Management
- Uses React hooks (useState) for local state
- Convex useQuery for data fetching with 'skip' option
- Convex useMutation for all write operations
- Optimistic updates through automatic refetching

### Styling
- Consistent with existing dark theme
- Colors: #101c22 (background), #1a2f38 (cards), #13a4ec (accent)
- Tailwind CSS for utility classes
- Custom borders and hover effects
- Loading states with spinners

### Error Handling
- Form validation before submission
- Error messages displayed in dialog
- Success notifications with auto-dismiss
- Graceful handling of undefined/null states

### Performance
- Conditional queries with 'skip' to avoid unnecessary fetches
- Component reuse (GroupCard, ItemCard)
- Efficient data structure with proper indexing
- Minimal re-renders through proper state management

## Migration Notes

The old `inventory` table is still present in the schema but is no longer used by the new UI. A future migration can:

1. Read all existing per-merchant inventory items
2. Create item groups from unique item names
3. Create group items with default prices/stock
4. Assign groups to merchants based on their previous inventory
5. Verify data integrity before removing the old table

## Files Modified

1. `/pwa/convex/schema.ts` - Added 4 new tables
2. `/pwa/convex/itemGroups.ts` - Added merchant assignment functions
3. `/pwa/app/admin/inventory/page.tsx` - Complete UI rewrite
4. `/pwa/app/admin/inventory/components/TabNavigation.tsx` - New component
5. `/pwa/app/admin/inventory/components/GroupCard.tsx` - New component
6. `/pwa/app/admin/inventory/components/ItemCard.tsx` - New component

## Testing Checklist

- [ ] Create a new item group
- [ ] Add items to a group
- [ ] Edit group name and description
- [ ] Edit item price and stock
- [ ] Delete an item from a group
- [ ] Delete a group (with items)
- [ ] Assign a group to a merchant
- [ ] Enable/disable a group for a merchant
- [ ] Unassign a group from a merchant
- [ ] Test on mobile device (responsive design)
- [ ] Test loading states
- [ ] Test error handling (invalid inputs)
- [ ] Test success notifications

## Next Steps

1. **Testing**: Thoroughly test all CRUD operations
2. **Migration**: Create migration script from old inventory table
3. **Analytics**: Add usage tracking for item groups
4. **Bulk Operations**: Add bulk import/export functionality
5. **Drag-and-Drop**: Implement drag-and-drop reordering for groups and items
6. **Search/Filter**: Add search and filter capabilities for large catalogs
