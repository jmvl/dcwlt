---
path: /Users/jm/Codebase/dcwlt/pwa/convex/itemGroups.ts
type: service
updated: 2025-01-21
status: active
---

# itemGroups.ts

## Purpose

Event-level item group and item management. Manages shared item groups (Beverages, Food, Merchandise) across all merchants at an event, handles CRUD for groups and items, manages merchant-to-group assignments with enable/disable, and supports per-merchant price/stock overrides.

## Exports

Group mutations:
- `createGroup` - Create item group for event
- `updateGroup` - Update group name, description, color, order
- `deleteGroup` - Delete group and all items

Item mutations:
- `addItemToGroup` - Add item to group
- `updateItemInGroup` - Update item name, description, price, stock
- `removeItemFromGroup` - Remove item from group

Assignment mutations:
- `assignGroupToMerchant` - Assign item group to merchant event
- `unassignGroupFromMerchant` - Unassign item group
- `toggleGroupEnabled` - Enable/disable group for merchant
- `reorderMerchantGroups` - Reorder groups for merchant

Override mutations:
- `setItemOverride` - Set price/stock override for merchant's item
- `removeItemOverride` - Remove override

Queries:
- `getEventItemGroups` - Get all groups for event
- `getGroupItems` - Get all items in group
- `getMerchantItems` - Get all items for merchant across events
- `getEventItems` - Get all items for event (admin view)
- `getMerchantGroupAssignments` - Get assignments for merchant event
- `getMerchantItemsWithOverrides` - Get items with overrides for merchant
- `getMerchantItemOverrides` - Get overrides for assignment

## Dependencies

- convex/server - Mutation and query handlers
- convex/values - Argument validators

## Used By

TBD
