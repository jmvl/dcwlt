import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new event
export const createEvent = mutation({
  args: {
    name: v.string(),
    type: v.string(), // "Concert" | "Sports" | "Festival" | "Custom"
    customType: v.optional(v.string()),
    date: v.string(),
    venue: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    // Validate required fields
    if (!args.name || args.name.trim() === "") {
      throw new Error("Event name is required");
    }
    if (!args.type || args.type.trim() === "") {
      throw new Error("Event type is required");
    }
    if (!args.date || args.date.trim() === "") {
      throw new Error("Event date is required");
    }
    if (!args.venue || args.venue.trim() === "") {
      throw new Error("Venue is required");
    }
    if (args.capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    // If type is "Custom", require customType
    if (args.type === "Custom" && (!args.customType || args.customType.trim() === "")) {
      throw new Error("Custom type name is required when type is 'Custom'");
    }

    // Validate event type is one of the allowed values
    const validTypes = ["Concert", "Sports", "Festival", "Custom"];
    if (!validTypes.includes(args.type)) {
      throw new Error(`Invalid event type. Must be one of: ${validTypes.join(", ")}`);
    }

    // Validate date format (ISO date string)
    const dateObj = new Date(args.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Use ISO date string (e.g., 2026-07-15)");
    }

    // Create event with timestamps
    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      name: args.name.trim(),
      type: args.type,
      customType: args.customType?.trim(),
      date: args.date,
      venue: args.venue.trim(),
      capacity: args.capacity,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(eventId);
  },
});

// Update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    customType: v.optional(v.string()),
    date: v.optional(v.string()),
    venue: v.optional(v.string()),
    capacity: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // Validate event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Build updates object with only provided fields
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (args.name.trim() === "") {
        throw new Error("Event name cannot be empty");
      }
      updates.name = args.name.trim();
    }

    if (args.type !== undefined) {
      const validTypes = ["Concert", "Sports", "Festival", "Custom"];
      if (!validTypes.includes(args.type)) {
        throw new Error(`Invalid event type. Must be one of: ${validTypes.join(", ")}`);
      }
      updates.type = args.type;

      // If type is being set to "Custom", require customType
      if (args.type === "Custom" && !args.customType) {
        // Check if existing customType exists, otherwise require it
        if (!event.customType) {
          throw new Error("Custom type name is required when type is 'Custom'");
        }
      }
    }

    if (args.customType !== undefined) {
      updates.customType = args.customType?.trim() || undefined;
    }

    if (args.date !== undefined) {
      if (args.date.trim() === "") {
        throw new Error("Event date cannot be empty");
      }
      const dateObj = new Date(args.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format. Use ISO date string (e.g., 2026-07-15)");
      }
      updates.date = args.date;
    }

    if (args.venue !== undefined) {
      if (args.venue.trim() === "") {
        throw new Error("Venue cannot be empty");
      }
      updates.venue = args.venue.trim();
    }

    if (args.capacity !== undefined) {
      if (args.capacity <= 0) {
        throw new Error("Capacity must be greater than 0");
      }
      updates.capacity = args.capacity;
    }

    // Update event
    await ctx.db.patch(args.eventId, updates);

    return await ctx.db.get(args.eventId);
  },
});

// Get all events, optionally filtered by type
export const getEvents = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    let events;

    if (args.type) {
      // Filter by type
      events = await ctx.db
        .query("events")
        .withIndex("by_type", (q: any) => q.eq("type", args.type))
        .collect();
    } else {
      // Get all events
      events = await ctx.db.query("events").collect();
    }

    // Sort by date (earliest first)
    return events.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  },
});

// Get a single event by ID
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx: any, args: any) => {
    const event = await ctx.db.get(args.eventId);
    return event || null;
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx: any, args: any) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.eventId);
    return { success: true, eventId: args.eventId };
  },
});
