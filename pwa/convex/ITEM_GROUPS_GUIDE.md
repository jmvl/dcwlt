# Item Groups Implementation Guide

## Overview

The item groups system refactors the inventory architecture from **per-merchant items** to **event-level shared item groups**. This allows multiple merchants at the same event to share a common catalog of items while still maintaining the ability to customize prices and stock levels.

## Architecture

### Old System (Deprecated)

```
Merchant → MerchantEvent → Inventory Items
          ├─ Item 1 (Beer, $5)
          ├─ Item 2 (Hot Dog, $3)
          └─ Item 3 (Water, $2)
```

Each merchant had their own isolated items, leading to:
- Duplicate items across merchants (e.g., "Beer" defined 10 times)
- Inconsistent pricing for the same item
- Difficult bulk updates
- Poor scalability

### New System

```
Event → Item Groups → Group Items
       ├─ Beverages (Group)
       │   ├─ Beer (Item)
       │   ├─ Water (Item)
       │   └─ Soda (Item)
       └─ Food (Group)
           ├─ Hot Dog (Item)
           └─ Burger (Item)

Merchant → MerchantEvent → (Assigned to Event) → Can sell from any group
```

Benefits:
- Single source of truth for item definitions
- Consistent base pricing across merchants
- Easy bulk updates
- Scalable to many merchants

## Database Schema

### Tables

#### 1. `itemGroups`
Event-level categories for organizing items.

```typescript
{
  eventId: Id<"events">,
  name: string,              // "Beverages", "Food", "Merchandise"
  description?: string,      // Optional description
  order: number,             // Display order (0 = first)
  createdAt: number,
  updatedAt: number,
}
```

**Indexes:**
- `by_event` - Query groups by event
- `by_event_order` - Query groups by event with order

#### 2. `groupItems`
Items within item groups (event-level catalog).

```typescript
{
  itemGroupId: Id<"itemGroups">,
  name: string,              // "Beer", "Hot Dog"
  description?: string,      // "16oz draft", "All-beef"
  defaultPrice: number,      // Price in EVT tokens
  defaultStock?: number,     // null = unlimited
  order: number,             // Display order within group
  createdAt: number,
  updatedAt: number,
}
```

**Indexes:**
- `by_group` - Query items by group
- `by_group_order` - Query items by group with order

#### 3. `merchantGroupAssignments` (Future)
Links item groups to merchants with optional overrides.

```typescript
{
  merchantEventId: Id<"merchantEvents">,
  itemGroupId: Id<"itemGroups">,
  enabled: boolean,          // Whether group is enabled for merchant
  order: number,             // Display order for this merchant
  createdAt: number,
  updatedAt: number,
}
```

#### 4. `merchantItemOverrides` (Future)
Per-merchant overrides for item properties.

```typescript
{
  merchantGroupAssignmentId: Id<"merchantGroupAssignments">,
  groupItemId: Id<"groupItems">,
  priceOverride?: number,    // null = use defaultPrice
  stockOverride?: number,    // null = use defaultStock
  createdAt: number,
  updatedAt: number,
}
```

## API Reference

### Mutations

#### Item Groups

##### `createGroup`
Create a new item group for an event.

```typescript
const group = await ctx.runMutation(api.itemGroups.createGroup, {
  eventId: "event123",
  name: "Beverages",
  description: "Cold and alcoholic drinks",
  order: 1
});
```

**Validation:**
- Event must exist
- Name cannot be empty
- Order must be non-negative
- No duplicate group names within event

##### `updateGroup`
Update an existing item group.

```typescript
const updated = await ctx.runMutation(api.itemGroups.updateGroup, {
  groupId: "group123",
  name: "Cold Drinks",
  order: 2
});
```

##### `deleteGroup`
Delete a group and all its items.

```typescript
await ctx.runMutation(api.itemGroups.deleteGroup, {
  groupId: "group123"
});
// Returns: { success: true, groupId: "group123", deletedItemsCount: 5 }
```

#### Items

##### `addItemToGroup`
Add an item to a group.

```typescript
const beer = await ctx.runMutation(api.itemGroups.addItemToGroup, {
  itemGroupId: "group123",
  name: "Beer",
  description: "16oz draft",
  defaultPrice: 5,
  defaultStock: 100,
  order: 1
});
```

**Validation:**
- Group must exist
- Name cannot be empty
- Price must be > 0
- Stock must be ≥ 0
- Order must be ≥ 0
- No duplicate item names within group

##### `updateItemInGroup`
Update an item in a group.

```typescript
const updated = await ctx.runMutation(api.itemGroups.updateItemInGroup, {
  groupItemId: "item123",
  defaultPrice: 6,
  defaultStock: 150
});
```

##### `removeItemFromGroup`
Remove an item from its group.

```typescript
await ctx.runMutation(api.itemGroups.removeItemFromGroup, {
  groupItemId: "item123"
});
```

### Queries

##### `getEventItemGroups`
Get all item groups for an event with item counts.

```typescript
const groups = await ctx.runQuery(api.itemGroups.getEventItemGroups, {
  eventId: "event123"
});
// Returns: [{ _id: "group123", name: "Beverages", itemCount: 5, ... }]
```

##### `getGroupItems`
Get all items in a specific group.

```typescript
const items = await ctx.runQuery(api.itemGroups.getGroupItems, {
  itemGroupId: "group123"
});
// Returns: [{ _id: "item123", name: "Beer", defaultPrice: 5, ... }]
```

##### `getMerchantItems`
Get all items available to a merchant at their assigned events.

```typescript
const items = await ctx.runQuery(api.itemGroups.getMerchantItems, {
  merchantId: "merchant123"
});
// Returns: [
//   {
//     event: { name: "Summer Festival", date: "2026-07-15" },
//     merchantEventId: "me123",
//     boothNumber: "A1",
//     groups: [
//       {
//         group: { name: "Beverages", order: 1 },
//         items: [{ name: "Beer", defaultPrice: 5, ... }]
//       }
//     ]
//   }
// ]
```

##### `getEventItems`
Get all items for an event (admin view).

```typescript
const items = await ctx.runQuery(api.itemGroups.getEventItems, {
  eventId: "event123"
});
```

## Migration Guide

### For Admins

**Old way:**
```typescript
// Add items to each merchant individually
await ctx.runMutation(api.inventory.addItem, {
  merchantEventId: "merchant1Event",
  itemName: "Beer",
  price: 5
});

await ctx.runMutation(api.inventory.addItem, {
  merchantEventId: "merchant2Event",
  itemName: "Beer",
  price: 5  // Duplicate!
});
```

**New way:**
```typescript
// Create item group once
const beverages = await ctx.runMutation(api.itemGroups.createGroup, {
  eventId: "event123",
  name: "Beverages",
  order: 1
});

// Add item once
await ctx.runMutation(api.itemGroups.addItemToGroup, {
  itemGroupId: beverages._id,
  name: "Beer",
  defaultPrice: 5,
  order: 1
});

// All merchants at event can now sell Beer
```

### For Merchants

**Old way:**
```typescript
// Query per-merchant items
const items = await ctx.runQuery(api.inventory.getMerchantEventItems, {
  merchantEventId: "me123"
});
```

**New way:**
```typescript
// Query all available items at all assigned events
const items = await ctx.runQuery(api.itemGroups.getMerchantItems, {
  merchantId: "merchant123"
});
```

## Best Practices

### 1. Ordering
Use the `order` field for consistent display:

```typescript
// Create groups in logical order
await createGroup({ name: "Beverages", order: 1 });
await createGroup({ name: "Food", order: 2 });
await createGroup({ name: "Merchandise", order: 3 });
```

### 2. Stock Management
Use `defaultStock: null` for unlimited items:

```typescript
// Limited stock
await addItemToGroup({
  name: "Limited Edition Shirt",
  defaultStock: 50
});

// Unlimited stock
await addItemToGroup({
  name: "Water",
  defaultStock: null  // Always available
});
```

### 3. Descriptions
Provide helpful descriptions for customers:

```typescript
await addItemToGroup({
  name: "Beer",
  description: "16oz domestic draft",  // Helpful!
  defaultPrice: 5
});
```

### 4. Validation
All mutations validate inputs and throw descriptive errors:

```typescript
try {
  await addItemToGroup({
    itemGroupId: "group123",
    name: "",  // Empty name
    defaultPrice: -1  // Negative price
  });
} catch (error) {
  console.error(error.message);
  // "Item name cannot be empty"
  // "Price must be greater than 0"
}
```

## Backward Compatibility

The old `inventory.ts` module is marked as `@deprecated` but maintained for backward compatibility. Existing code using the old system will continue to work during the migration period.

**Migration timeline:**
1. Phase 1: New system implemented (current)
2. Phase 2: Frontend updated to use new queries
3. Phase 3: Old mutations deprecated
4. Phase 4: Old system removed

## Future Enhancements

### Merchant Customization
The schema includes tables for future merchant customization:

- `merchantGroupAssignments` - Enable/disable groups per merchant
- `merchantItemOverrides` - Override prices and stock per merchant

Example (future):
```typescript
// Merchant A sells Beer for $6 (override)
await createMerchantItemOverride({
  merchantGroupAssignmentId: "mga123",
  groupItemId: "item123",
  priceOverride: 6  // Custom price
});

// Merchant B sells Beer for default $5
// No override needed
```

## Testing

### Unit Tests
Test validation and edge cases:

```typescript
describe('addItemToGroup', () => {
  it('should reject empty names', async () => {
    await expect(
      addItemToGroup({ name: '', defaultPrice: 5 })
    ).rejects.toThrow('Item name cannot be empty');
  });

  it('should reject negative prices', async () => {
    await expect(
      addItemToGroup({ name: 'Beer', defaultPrice: -1 })
    ).rejects.toThrow('Price must be greater than 0');
  });

  it('should reject duplicate names', async () => {
    await addItemToGroup({ name: 'Beer', defaultPrice: 5 });
    await expect(
      addItemToGroup({ name: 'Beer', defaultPrice: 6 })
    ).rejects.toThrow('Item "Beer" already exists in this group');
  });
});
```

### Integration Tests
Test end-to-end flows:

```typescript
describe('Merchant Items Flow', () => {
  it('should return items for merchant at event', async () => {
    // Setup event, groups, items
    const event = await createEvent();
    const group = await createGroup({ eventId: event._id });
    const item = await addItemToGroup({ itemGroupId: group._id });

    // Assign merchant to event
    const merchantEvent = await assignMerchantToEvent({
      eventId: event._id,
      merchantId: merchant._id
    });

    // Query merchant items
    const items = await getMerchantItems({ merchantId: merchant._id });

    expect(items).toHaveLength(1);
    expect(items[0].groups[0].items[0].name).toBe('Beer');
  });
});
```

## Performance Considerations

### Indexes
All queries use indexed fields for optimal performance:

```typescript
// Efficient - uses index
await db.query('itemGroups')
  .withIndex('by_event', q => q.eq('eventId', event))
  .collect();

// Inefficient - scans all groups
await db.query('itemGroups')
  .filter(q => q.eq(q.field('eventId'), event))
  .collect();
```

### Pagination
For large catalogs, implement pagination:

```typescript
export const getGroupItemsPaginated = query({
  args: {
    itemGroupId: v.id('itemGroups'),
    limit: v.number(),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('groupItems')
      .withIndex('by_group', q => q.eq('itemGroupId', args.itemGroupId))
      .order('asc');

    if (args.cursor) {
      query = query.cursor('after', args.cursor);
    }

    const results = await query.take(args.limit);
    const nextPage = results.length === args.limit
      ? results[results.length - 1]._id
      : null;

    return { results, nextPage };
  },
});
```

## Error Handling

All mutations throw descriptive errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `Event not found` | Invalid eventId | Verify event exists |
| `Item group not found` | Invalid groupId | Verify group exists |
| `Item name cannot be empty` | Empty string | Provide name |
| `Price must be greater than 0` | Zero/negative price | Use positive number |
| `Stock cannot be negative` | Negative stock | Use non-negative number |
| `Order must be non-negative` | Negative order | Use non-negative number |
| `Group already exists` | Duplicate name | Use unique name |
| `Item already exists in this group` | Duplicate item name | Use unique name |

## Summary

The item groups system provides:
- **Scalability**: Share items across merchants
- **Consistency**: Single source of truth
- **Flexibility**: Merchant-level customization (future)
- **Performance**: Indexed queries
- **Safety**: Comprehensive validation
- **Compatibility**: Backward compatible with old system

For questions or issues, refer to the implementation in `pwa/convex/itemGroups.ts`.
