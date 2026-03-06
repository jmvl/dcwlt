import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Assign a merchant to an event with booth number
export const assignMerchantToEvent = mutation({
  args: {
    merchantId: v.id("merchants"),
    eventId: v.id("events"),
    boothNumber: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    // Validate merchant exists
    const merchant = await ctx.db.get(args.merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Validate merchant is approved
    if (merchant.status !== "approved") {
      throw new Error("Merchant not approved");
    }

    // Validate event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Validate booth number
    if (!args.boothNumber || args.boothNumber.trim() === "") {
      throw new Error("Booth number is required");
    }

    // Check if merchant already assigned to this event
    const existing = await ctx.db
      .query("merchantEvents")
      .withIndex("by_event_merchant", (q: any) =>
        q.eq("eventId", args.eventId).eq("merchantId", args.merchantId)
      )
      .first();

    if (existing) {
      throw new Error("Merchant already assigned to this event");
    }

    // Create merchant-event assignment
    const merchantEventId = await ctx.db.insert("merchantEvents", {
      merchantId: args.merchantId,
      eventId: args.eventId,
      boothNumber: args.boothNumber.trim(),
      createdAt: Date.now(),
    });

    return await ctx.db.get(merchantEventId);
  },
});

// Remove merchant from event
export const removeMerchantFromEvent = mutation({
  args: {
    merchantEventId: v.id("merchantEvents"),
  },
  handler: async (ctx: any, args: any) => {
    // Validate assignment exists
    const merchantEvent = await ctx.db.get(args.merchantEventId);
    if (!merchantEvent) {
      throw new Error("Assignment not found");
    }

    // Delete assignment
    await ctx.db.delete(args.merchantEventId);

    return { success: true, merchantEventId: args.merchantEventId };
  },
});

// Get all merchant assignments for an event (with merchant details)
export const getEventAssignments = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx: any, args: any) => {
    // Get all merchant assignments for this event
    const assignments = await ctx.db
      .query("merchantEvents")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();

    // Fetch merchant details for each assignment
    const assignmentsWithMerchants = await Promise.all(
      assignments.map(async (assignment: any) => {
        const merchant = await ctx.db.get(assignment.merchantId);
        return {
          _id: assignment._id,
          merchantId: assignment.merchantId,
          eventId: assignment.eventId,
          boothNumber: assignment.boothNumber,
          createdAt: assignment.createdAt,
          merchant: merchant
            ? {
                businessName: merchant.businessName,
                email: merchant.email,
                walletAddress: merchant.walletAddress,
                status: merchant.status,
              }
            : null,
        };
      })
    );

    // Sort by booth number
    return assignmentsWithMerchants.sort((a: any, b: any) =>
      a.boothNumber.localeCompare(b.boothNumber, undefined, { numeric: true })
    );
  },
});

// Get all event assignments for a merchant (with event details)
export const getMerchantAssignments = query({
  args: {
    merchantId: v.id("merchants"),
  },
  handler: async (ctx: any, args: any) => {
    // Get all event assignments for this merchant
    const assignments = await ctx.db
      .query("merchantEvents")
      .withIndex("by_merchant", (q: any) => q.eq("merchantId", args.merchantId))
      .collect();

    // Fetch event details for each assignment
    const assignmentsWithEvents = await Promise.all(
      assignments.map(async (assignment: any) => {
        const event = await ctx.db.get(assignment.eventId);
        return {
          _id: assignment._id,
          merchantId: assignment.merchantId,
          eventId: assignment.eventId,
          boothNumber: assignment.boothNumber,
          createdAt: assignment.createdAt,
          event: event
            ? {
                name: event.name,
                type: event.type,
                customType: event.customType,
                date: event.date,
                venue: event.venue,
              }
            : null,
        };
      })
    );

    // Sort by event date
    return assignmentsWithEvents.sort((a: any, b: any) =>
      new Date(a.event?.date || 0).getTime() - new Date(b.event?.date || 0).getTime()
    );
  },
});
