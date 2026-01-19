import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * @deprecated
 *
 * This module contains the LEGACY inventory system where items were
 * per-merchant (each merchant had their own items).
 *
 * The NEW system uses event-level item groups:
 * - Item groups are shared across all merchants at an event
 * - See `itemGroups.ts` for the new implementation
 * - Use `getMerchantItems` from itemGroups.ts for merchant queries
 *
 * This file is maintained for backward compatibility during migration.
 */

/**
 * @deprecated
 * Legacy mutation for adding per-merchant items.
 * Use `addItemToGroup` from itemGroups.ts instead.
 */
export const addItem = mutation({
  args: {
    merchantEventId: v.id('merchantEvents'),
    itemName: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate merchantEvent exists
    const merchantEvent = await ctx.db.get(args.merchantEventId);
    if (!merchantEvent) {
      throw new Error('Merchant event assignment not found');
    }

    // Validate price is positive
    if (args.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Validate stock is non-negative if provided
    if (args.stock !== undefined && args.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const now = Date.now();

    const itemId = await ctx.db.insert('inventory', {
      merchantEventId: args.merchantEventId,
      itemName: args.itemName,
      description: args.description,
      price: args.price,
      stock: args.stock,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(itemId);
  },
});

/**
 * @deprecated
 * Legacy mutation for updating per-merchant items.
 * Use `updateItemInGroup` from itemGroups.ts instead.
 */
export const updateItem = mutation({
  args: {
    itemId: v.id('inventory'),
    itemName: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate item exists
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.itemName !== undefined) {
      updates.itemName = args.itemName;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.price !== undefined) {
      if (args.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      updates.price = args.price;
    }
    if (args.stock !== undefined) {
      if (args.stock < 0) {
        throw new Error('Stock cannot be negative');
      }
      updates.stock = args.stock;
    }

    await ctx.db.patch(args.itemId, updates);

    return await ctx.db.get(args.itemId);
  },
});

/**
 * @deprecated
 * Legacy mutation for removing per-merchant items.
 * Use `removeItemFromGroup` from itemGroups.ts instead.
 */
export const removeItem = mutation({
  args: {
    itemId: v.id('inventory'),
  },
  handler: async (ctx, args) => {
    // Validate item exists
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    await ctx.db.delete(args.itemId);

    return { success: true };
  },
});

/**
 * @deprecated
 * Legacy query for getting per-merchant inventory at an event.
 * Use `getEventItems` from itemGroups.ts instead.
 */
export const getEventInventory = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    // Get all merchant events for this event
    const merchantEvents = await ctx.db
      .query('merchantEvents')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect();

    // Get all inventory items for these merchant events
    const inventoryItems = await Promise.all(
      merchantEvents.map(async (me) => {
        const items = await ctx.db
          .query('inventory')
          .withIndex('by_merchantEvent', (q) => q.eq('merchantEventId', me._id))
          .collect();

        // Get merchant details
        const merchant = await ctx.db.get(me.merchantId);

        return {
          merchantEvent: {
            ...me,
            merchant: {
              businessName: merchant?.businessName || 'Unknown',
              email: merchant?.email || '',
              walletAddress: merchant?.walletAddress || '',
            },
          },
          items: items.map((item) => ({
            ...item,
          })),
        };
      })
    );

    // Return all merchant events for this event, even if they have no items yet
    // This allows admins to add items to merchants
    return inventoryItems;
  },
});

/**
 * @deprecated
 * Legacy query for getting items for a specific merchant event.
 * Use `getMerchantItems` from itemGroups.ts instead.
 */
export const getMerchantEventItems = query({
  args: {
    merchantEventId: v.id('merchantEvents'),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('inventory')
      .withIndex('by_merchantEvent', (q) => q.eq('merchantEventId', args.merchantEventId))
      .collect();

    // Sort by item name
    return items.sort((a, b) => a.itemName.localeCompare(b.itemName));
  },
});
