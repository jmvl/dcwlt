import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Item Groups Module
 *
 * Manages event-level item groups and their associated items.
 * This refactors the inventory system from per-merchant items to
 * shared item groups that all merchants at an event can use.
 *
 * Architecture:
 * - Item Groups: Event-level categories (e.g., "Beverages", "Food", "Merchandise")
 * - Items: Products within groups (e.g., "Beer", "Hot Dog" within "Beverages")
 * - Merchants: Assigned to events can sell items from any group
 */

// ============================================================================
// MUTATIONS: Item Groups
// ============================================================================

/**
 * Create a new item group for an event.
 *
 * @param eventId - The event to create the group for
 * @param name - Group name (e.g., "Beverages", "Food")
 * @param description - Optional description
 * @param order - Display order (lower numbers appear first)
 * @returns The created group with its ID
 *
 * @example
 * const beverages = await createGroup({
 *   eventId: "event123",
 *   name: "Beverages",
 *   description: "Cold and alcoholic drinks",
 *   order: 1
 * });
 */
export const createGroup = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Validate name is not empty
    if (!args.name.trim()) {
      throw new Error("Group name cannot be empty");
    }

    // Validate order is non-negative
    if (args.order < 0) {
      throw new Error("Order must be non-negative");
    }

    // Validate hex color format if provided
    if (args.color !== undefined) {
      const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
      if (!hexColorRegex.test(args.color)) {
        throw new Error("Color must be a valid hex color code (e.g., #13a4ec, #FB8C00)");
      }
    }

    // Check for duplicate group name within this event
    const existingGroups = await ctx.db
      .query("itemGroups")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const duplicate = existingGroups.find(
      (g) => g.name.toLowerCase() === args.name.toLowerCase()
    );

    if (duplicate) {
      throw new Error(
        `Item group "${args.name}" already exists for this event`
      );
    }

    const now = Date.now();

    const groupId = await ctx.db.insert("itemGroups", {
      eventId: args.eventId,
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(groupId);
  },
});

/**
 * Update an existing item group.
 *
 * @param groupId - The group to update
 * @param name - New name (optional)
 * @param description - New description (optional)
 * @param order - New display order (optional)
 * @returns The updated group
 *
 * @example
 * const updated = await updateGroup({
 *   groupId: "group123",
 *   name: "Cold Drinks",
 *   order: 2
 * });
 */
export const updateGroup = mutation({
  args: {
    groupId: v.id("itemGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { groupId, ...updates } = args;

    // Validate group exists
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Item group not found");
    }

    // Build update object with validation
    const patch: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) {
      const newName = updates.name.trim();
      if (!newName) {
        throw new Error("Group name cannot be empty");
      }

      // Check for duplicate name (excluding current group)
      const existingGroups = await ctx.db
        .query("itemGroups")
        .withIndex("by_event", (q) => q.eq("eventId", group.eventId))
        .collect();

      const duplicate = existingGroups.find(
        (g) =>
          g._id !== groupId &&
          g.name.toLowerCase() === newName.toLowerCase()
      );

      if (duplicate) {
        throw new Error(
          `Item group "${updates.name}" already exists for this event`
        );
      }

      patch.name = newName;
    }

    if (updates.description !== undefined) {
      patch.description = updates.description?.trim() || undefined;
    }

    if (updates.color !== undefined) {
      if (updates.color !== null) {
        const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
        if (!hexColorRegex.test(updates.color)) {
          throw new Error("Color must be a valid hex color code (e.g., #13a4ec, #FB8C00)");
        }
      }
      patch.color = updates.color;
    }

    if (updates.order !== undefined) {
      if (updates.order < 0) {
        throw new Error("Order must be non-negative");
      }
      patch.order = updates.order;
    }

    await ctx.db.patch(groupId, patch);

    return await ctx.db.get(groupId);
  },
});

/**
 * Delete an item group.
 *
 * WARNING: This will also delete all items within the group.
 * Consider reassigning items before deletion if needed.
 *
 * @param itemGroupId - The group to delete
 * @returns Success confirmation with count of deleted items
 *
 * @example
 * await deleteGroup({ itemGroupId: "group123" });
 */
export const deleteGroup = mutation({
  args: {
    itemGroupId: v.id("itemGroups"),
  },
  handler: async (ctx, args) => {
    // Validate group exists
    const group = await ctx.db.get(args.itemGroupId);
    if (!group) {
      throw new Error("Item group not found");
    }

    // Delete all items in this group first
    const items = await ctx.db
      .query("groupItems")
      .withIndex("by_group", (q) => q.eq("itemGroupId", args.itemGroupId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete the group
    await ctx.db.delete(args.itemGroupId);

    return {
      success: true,
      itemGroupId: args.itemGroupId,
      deletedItemsCount: items.length,
    };
  },
});

// ============================================================================
// MUTATIONS: Items
// ============================================================================

/**
 * Add an item to a group.
 *
 * @param itemGroupId - The group to add the item to
 * @param name - Item name (e.g., "Beer", "Hot Dog")
 * @param description - Optional description
 * @param defaultPrice - Default price in EVT tokens (must be > 0)
 * @param defaultStock - Optional default stock quantity (null = unlimited)
 * @param order - Display order within the group (lower = first)
 * @returns The created item with its ID
 *
 * @example
 * const beer = await addItemToGroup({
 *   itemGroupId: "group123",
 *   name: "Beer",
 *   description: "16oz draft",
 *   defaultPrice: 5,
 *   defaultStock: 100,
 *   order: 1
 * });
 */
export const addItemToGroup = mutation({
  args: {
    itemGroupId: v.id("itemGroups"),
    name: v.string(),
    description: v.optional(v.string()),
    defaultPrice: v.number(),
    defaultStock: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate group exists
    const group = await ctx.db.get(args.itemGroupId);
    if (!group) {
      throw new Error("Item group not found");
    }

    // Validate name is not empty
    if (!args.name.trim()) {
      throw new Error("Item name cannot be empty");
    }

    // Validate price is positive
    if (args.defaultPrice <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Validate stock is non-negative if provided
    if (args.defaultStock !== undefined && args.defaultStock < 0) {
      throw new Error("Stock cannot be negative");
    }

    // Validate order is non-negative
    if (args.order < 0) {
      throw new Error("Order must be non-negative");
    }

    // Check for duplicate item name within this group
    const existingItems = await ctx.db
      .query("groupItems")
      .withIndex("by_group", (q) => q.eq("itemGroupId", args.itemGroupId))
      .collect();

    const duplicate = existingItems.find(
      (item) => item.name.toLowerCase() === args.name.toLowerCase()
    );

    if (duplicate) {
      throw new Error(`Item "${args.name}" already exists in this group`);
    }

    const now = Date.now();

    const itemId = await ctx.db.insert("groupItems", {
      itemGroupId: args.itemGroupId,
      name: args.name.trim(),
      description: args.description?.trim(),
      defaultPrice: args.defaultPrice,
      defaultStock: args.defaultStock,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(itemId);
  },
});

/**
 * Update an item in a group.
 *
 * @param groupItemId - The item to update
 * @param name - New name (optional)
 * @param description - New description (optional)
 * @param defaultPrice - New default price (optional)
 * @param defaultStock - New default stock quantity (optional)
 * @param order - New display order (optional)
 * @returns The updated item
 *
 * @example
 * const updated = await updateItemInGroup({
 *   groupItemId: "item123",
 *   defaultPrice: 6,
 *   defaultStock: 150
 * });
 */
export const updateItemInGroup = mutation({
  args: {
    groupItemId: v.id("groupItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultPrice: v.optional(v.number()),
    defaultStock: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { groupItemId, ...updates } = args;

    // Validate item exists
    const item = await ctx.db.get(groupItemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Build update object with validation
    const patch: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) {
      const newName = updates.name.trim();
      if (!newName) {
        throw new Error("Item name cannot be empty");
      }

      // Check for duplicate name (excluding current item)
      const existingItems = await ctx.db
        .query("groupItems")
        .withIndex("by_group", (q) => q.eq("itemGroupId", item.itemGroupId))
        .collect();

      const duplicate = existingItems.find(
        (i) =>
          i._id !== groupItemId &&
          i.name.toLowerCase() === newName.toLowerCase()
      );

      if (duplicate) {
        throw new Error(`Item "${updates.name}" already exists in this group`);
      }

      patch.name = newName;
    }

    if (updates.description !== undefined) {
      patch.description = updates.description?.trim() || undefined;
    }

    if (updates.defaultPrice !== undefined) {
      if (updates.defaultPrice <= 0) {
        throw new Error("Price must be greater than 0");
      }
      patch.defaultPrice = updates.defaultPrice;
    }

    if (updates.defaultStock !== undefined) {
      if (updates.defaultStock < 0) {
        throw new Error("Stock cannot be negative");
      }
      patch.defaultStock = updates.defaultStock;
    }

    if (updates.order !== undefined) {
      if (updates.order < 0) {
        throw new Error("Order must be non-negative");
      }
      patch.order = updates.order;
    }

    await ctx.db.patch(groupItemId, patch);

    return await ctx.db.get(groupItemId);
  },
});

/**
 * Remove an item from its group.
 *
 * @param groupItemId - The item to remove
 * @returns Success confirmation
 *
 * @example
 * await removeItemFromGroup({ groupItemId: "item123" });
 */
export const removeItemFromGroup = mutation({
  args: {
    groupItemId: v.id("groupItems"),
  },
  handler: async (ctx, args) => {
    // Validate item exists
    const item = await ctx.db.get(args.groupItemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await ctx.db.delete(args.groupItemId);

    return {
      success: true,
      groupItemId: args.groupItemId,
    };
  },
});

// ============================================================================
// QUERIES: Item Groups
// ============================================================================

/**
 * Get all item groups for an event.
 *
 * Returns groups sorted by their order field.
 *
 * @param eventId - The event to get groups for
 * @returns Array of item groups with their item counts
 *
 * @example
 * const groups = await getEventItemGroups({ eventId: "event123" });
 * // Returns: [{ _id: "group123", name: "Beverages", itemCount: 5, ... }]
 */
export const getEventItemGroups = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("itemGroups")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Count items in each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const items = await ctx.db
          .query("groupItems")
          .withIndex("by_group", (q) => q.eq("itemGroupId", group._id))
          .collect();

        return {
          ...group,
          itemCount: items.length,
        };
      })
    );

    // Sort by order field
    return groupsWithCounts.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get all items in a specific group.
 *
 * Returns items sorted by their order field.
 *
 * @param itemGroupId - The group to get items for
 * @returns Array of items in the group
 *
 * @example
 * const items = await getGroupItems({ itemGroupId: "group123" });
 * // Returns: [{ _id: "item123", name: "Beer", defaultPrice: 5, ... }]
 */
export const getGroupItems = query({
  args: {
    itemGroupId: v.id("itemGroups"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("groupItems")
      .withIndex("by_group", (q) => q.eq("itemGroupId", args.itemGroupId))
      .collect();

    // Sort by order field
    return items.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get all items available to a merchant at their assigned events.
 *
 * This is the primary query for merchants to see what they can sell.
 * It aggregates all items from all groups at all events the merchant is assigned to.
 *
 * @param merchantId - The merchant to get items for
 * @returns Array of items grouped by event, with group information
 *
 * @example
 * const items = await getMerchantItems({ merchantId: "merchant123" });
 * // Returns: [
 * //   {
 * //     event: { name: "Summer Festival", date: "2026-07-15" },
 * //     groups: [
 * //       {
 * //         group: { name: "Beverages", order: 1 },
 * //         items: [{ name: "Beer", price: 5, ... }]
 * //       }
 * //     ]
 * //   }
 * // ]
 */
export const getMerchantItems = query({
  args: {
    merchantId: v.id("merchants"),
  },
  handler: async (ctx, args) => {
    // Get all event assignments for this merchant
    const merchantEvents = await ctx.db
      .query("merchantEvents")
      .withIndex("by_merchant", (q) => q.eq("merchantId", args.merchantId))
      .collect();

    // For each event, get all groups and their items
    const eventsWithItems = await Promise.all(
      merchantEvents.map(async (me) => {
        const event = await ctx.db.get(me.eventId);
        if (!event) return null;

        // Get all groups for this event
        const groups = await ctx.db
          .query("itemGroups")
          .withIndex("by_event", (q) => q.eq("eventId", me.eventId))
          .collect();

        // Get items for each group
        const groupsWithItems = await Promise.all(
          groups.map(async (group) => {
            const items = await ctx.db
              .query("groupItems")
              .withIndex("by_group", (q) => q.eq("itemGroupId", group._id))
              .collect();

            return {
              group: {
                _id: group._id,
                name: group.name,
                description: group.description,
                order: group.order,
              },
              items: items.sort((a, b) => a.order - b.order),
            };
          })
        );

        // Filter out groups with no items and sort by order
        const populatedGroups = groupsWithItems
          .filter((g) => g.items.length > 0)
          .sort((a, b) => a.group.order - b.group.order);

        return {
          event: {
            _id: me.eventId,
            name: event.name,
            type: event.type,
            date: event.date,
            venue: event.venue,
          },
          merchantEventId: me._id,
          boothNumber: me.boothNumber,
          groups: populatedGroups,
        };
      })
    );

    // Filter out nulls and sort by event date
    return eventsWithItems
      .filter((e) => e !== null)
      .sort(
        (a, b) =>
          new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
      );
  },
});

/**
 * Get all items for a specific event (regardless of merchant).
 *
 * Useful for admins to see all available items at an event.
 *
 * @param eventId - The event to get items for
 * @returns Array of all items grouped by category
 *
 * @example
 * const items = await getEventItems({ eventId: "event123" });
 * // Returns: [
 * //   {
 * //     group: { name: "Beverages", order: 1 },
 * //     items: [{ name: "Beer", defaultPrice: 5, ... }]
 * //   }
 * // ]
 */
export const getEventItems = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get all groups for this event
    const groups = await ctx.db
      .query("itemGroups")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get items for each group
    const groupsWithItems = await Promise.all(
      groups.map(async (group) => {
        const items = await ctx.db
          .query("groupItems")
          .withIndex("by_group", (q) => q.eq("itemGroupId", group._id))
          .collect();

        return {
          group: {
            _id: group._id,
            name: group.name,
            description: group.description,
            order: group.order,
          },
          items: items.sort((a, b) => a.order - b.order),
        };
      })
    );

    // Filter out groups with no items and sort by order
    return groupsWithItems
      .filter((g) => g.items.length > 0)
      .sort((a, b) => a.group.order - b.group.order);
  },
});

// ============================================================================
// MUTATIONS: Merchant Group Assignments
// ============================================================================

/**
 * Assign an item group to a merchant event.
 *
 * @param merchantEventId - The merchant-event assignment
 * @param itemGroupId - The group to assign
 * @returns The created assignment
 */
export const assignGroupToMerchant = mutation({
  args: {
    merchantEventId: v.id("merchantEvents"),
    itemGroupId: v.id("itemGroups"),
  },
  handler: async (ctx, args) => {
    // Validate merchant event exists
    const merchantEvent = await ctx.db.get(args.merchantEventId);
    if (!merchantEvent) {
      throw new Error("Merchant event assignment not found");
    }

    // Validate group exists
    const group = await ctx.db.get(args.itemGroupId);
    if (!group) {
      throw new Error("Item group not found");
    }

    // Check if assignment already exists
    const existingAssignments = await ctx.db
      .query("merchantGroupAssignments")
      .withIndex("by_merchantEvent", (q) => q.eq("merchantEventId", args.merchantEventId))
      .collect();

    const existing = existingAssignments.find((a) => a.itemGroupId === args.itemGroupId);

    if (existing) {
      // Just enable it if it exists
      await ctx.db.patch(existing._id, {
        enabled: true,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    // Get existing assignments to determine order
    const order = existingAssignments.length;
    const now = Date.now();

    const assignmentId = await ctx.db.insert("merchantGroupAssignments", {
      merchantEventId: args.merchantEventId,
      itemGroupId: args.itemGroupId,
      enabled: true,
      order,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(assignmentId);
  },
});

/**
 * Unassign an item group from a merchant event.
 *
 * @param merchantEventId - The merchant-event assignment
 * @param itemGroupId - The group to unassign
 * @returns Success confirmation
 */
export const unassignGroupFromMerchant = mutation({
  args: {
    merchantEventId: v.id("merchantEvents"),
    itemGroupId: v.id("itemGroups"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("merchantGroupAssignments")
      .withIndex("by_merchantEvent", (q) => q.eq("merchantEventId", args.merchantEventId))
      .collect();

    const assignment = assignments.find((a) => a.itemGroupId === args.itemGroupId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Delete all item overrides for this assignment
    const overrides = await ctx.db
      .query("merchantItemOverrides")
      .withIndex("by_merchantGroupAssignment", (q) => q.eq("merchantGroupAssignmentId", assignment._id))
      .collect();

    for (const override of overrides) {
      await ctx.db.delete(override._id);
    }

    await ctx.db.delete(assignment._id);
    return { success: true };
  },
});

/**
 * Toggle whether a group assignment is enabled.
 *
 * @param assignmentId - The assignment to toggle
 * @param enabled - Whether to enable or disable
 * @returns The updated assignment
 */
export const toggleGroupEnabled = mutation({
  args: {
    assignmentId: v.id("merchantGroupAssignments"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await ctx.db.patch(args.assignmentId, {
      enabled: args.enabled,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.assignmentId);
  },
});

/**
 * Reorder merchant group assignments.
 *
 * @param merchantEventId - The merchant-event assignment
 * @param assignmentIds - Array of assignment IDs in new order
 * @returns Success confirmation
 */
export const reorderMerchantGroups = mutation({
  args: {
    merchantEventId: v.id("merchantEvents"),
    assignmentIds: v.array(v.id("merchantGroupAssignments")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.assignmentIds.length; i++) {
      await ctx.db.patch(args.assignmentIds[i], {
        order: i,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ============================================================================
// QUERIES: Merchant Assignments
// ============================================================================

/**
 * Get all group assignments for a merchant event.
 *
 * @param merchantEventId - The merchant-event assignment
 * @returns Array of assignments with group details
 */
export const getMerchantGroupAssignments = query({
  args: {
    merchantEventId: v.id("merchantEvents"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("merchantGroupAssignments")
      .withIndex("by_merchantEvent_order", (q) => q.eq("merchantEventId", args.merchantEventId))
      .collect();

    // Get full group details for each assignment
    const assignmentsWithGroups = await Promise.all(
      assignments.map(async (assignment) => {
        const group = await ctx.db.get(assignment.itemGroupId);
        return {
          ...assignment,
          group,
        };
      })
    );

    return assignmentsWithGroups;
  },
});

/**
 * Get all items for a merchant with their overrides.
 *
 * This is the main query for showing what items a merchant can sell.
 *
 * @param merchantEventId - The merchant-event assignment
 * @returns Array of groups with items and overrides
 */
export const getMerchantItemsWithOverrides = query({
  args: {
    merchantEventId: v.id("merchantEvents"),
  },
  handler: async (ctx, args) => {
    // Get all group assignments for this merchant
    const assignments = await ctx.db
      .query("merchantGroupAssignments")
      .withIndex("by_merchantEvent_order", (q) => q.eq("merchantEventId", args.merchantEventId))
      .collect();

    const result = [];

    for (const assignment of assignments) {
      if (!assignment.enabled) continue;

      const group = await ctx.db.get(assignment.itemGroupId);
      if (!group) continue;

      // Get all items in this group
      const groupItems = await ctx.db
        .query("groupItems")
        .withIndex("by_group_order", (q) => q.eq("itemGroupId", assignment.itemGroupId))
        .collect();

      // Get overrides for this assignment
      const overrides = await ctx.db
        .query("merchantItemOverrides")
        .withIndex("by_merchantGroupAssignment", (q) =>
          q.eq("merchantGroupAssignmentId", assignment._id)
        )
        .collect();

      // Combine items with their overrides
      const itemsWithOverrides = groupItems.map((item) => {
        const override = overrides.find((o) => o.groupItemId === item._id);
        return {
          groupItem: item,
          override: override || null,
          effectivePrice: override?.priceOverride ?? item.defaultPrice,
          effectiveStock: override?.stockOverride ?? item.defaultStock,
        };
      });

      result.push({
        group,
        assignment,
        items: itemsWithOverrides,
      });
    }

    return result;
  },
});

// ============================================================================
// MUTATIONS: Item Overrides
// ============================================================================

/**
 * Set or update price/stock overrides for a merchant's item.
 *
 * @param merchantGroupAssignmentId - The merchant group assignment
 * @param groupItemId - The item to override
 * @param priceOverride - Optional price override (null = use default)
 * @param stockOverride - Optional stock override (null = use default)
 * @returns The created or updated override
 */
export const setItemOverride = mutation({
  args: {
    merchantGroupAssignmentId: v.id("merchantGroupAssignments"),
    groupItemId: v.id("groupItems"),
    priceOverride: v.optional(v.number()),
    stockOverride: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate assignment exists
    const assignment = await ctx.db.get(args.merchantGroupAssignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Validate group item exists
    const groupItem = await ctx.db.get(args.groupItemId);
    if (!groupItem) {
      throw new Error("Group item not found");
    }

    // Check if override already exists
    const existingOverrides = await ctx.db
      .query("merchantItemOverrides")
      .withIndex("by_merchantGroupAssignment", (q) =>
        q.eq("merchantGroupAssignmentId", args.merchantGroupAssignmentId)
      )
      .collect();

    let existing = existingOverrides.find((o) => o.groupItemId === args.groupItemId);

    const now = Date.now();

    if (existing) {
      // Update existing override
      const updates: Record<string, any> = {
        updatedAt: now,
      };

      if (args.priceOverride !== undefined) {
        if (args.priceOverride <= 0) {
          throw new Error("Price must be greater than 0");
        }
        updates.priceOverride = args.priceOverride;
      }
      if (args.stockOverride !== undefined) {
        if (args.stockOverride < 0) {
          throw new Error("Stock cannot be negative");
        }
        updates.stockOverride = args.stockOverride;
      }

      await ctx.db.patch(existing._id, updates);
      return await ctx.db.get(existing._id);
    } else {
      // Create new override
      const overrideId = await ctx.db.insert("merchantItemOverrides", {
        merchantGroupAssignmentId: args.merchantGroupAssignmentId,
        groupItemId: args.groupItemId,
        priceOverride: args.priceOverride,
        stockOverride: args.stockOverride,
        createdAt: now,
        updatedAt: now,
      });

      return await ctx.db.get(overrideId);
    }
  },
});

/**
 * Remove an override for a merchant's item.
 *
 * @param overrideId - The override to remove
 * @returns Success confirmation
 */
export const removeItemOverride = mutation({
  args: {
    overrideId: v.id("merchantItemOverrides"),
  },
  handler: async (ctx, args) => {
    const override = await ctx.db.get(args.overrideId);
    if (!override) {
      throw new Error("Override not found");
    }

    await ctx.db.delete(args.overrideId);
    return { success: true };
  },
});

// ============================================================================
// QUERIES: Item Overrides
// ============================================================================

/**
 * Get all item overrides for a merchant group assignment.
 *
 * @param merchantGroupAssignmentId - The merchant group assignment
 * @returns Array of overrides with item details
 */
export const getMerchantItemOverrides = query({
  args: {
    merchantGroupAssignmentId: v.id("merchantGroupAssignments"),
  },
  handler: async (ctx, args) => {
    const overrides = await ctx.db
      .query("merchantItemOverrides")
      .withIndex("by_merchantGroupAssignment", (q) =>
        q.eq("merchantGroupAssignmentId", args.merchantGroupAssignmentId)
      )
      .collect();

    return overrides;
  },
});
