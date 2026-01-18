import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User accounts - linked to Privy wallet addresses
  users: defineTable({
    // Primary identifier: Solana wallet address from Privy
    walletAddress: v.string(),
    // OAuth provider (google, apple)
    oauthProvider: v.optional(v.string()),
    // OAuth email (for recovery)
    email: v.optional(v.string()),
    // Account creation timestamp
    createdAt: v.number(),
    // Last active timestamp
    lastActiveAt: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_email", ["email"]),

  // Wallet balances - tracks token holdings
  wallets: defineTable({
    // Reference to users table
    userId: v.id("users"),
    // Wallet address (denormalized for queries)
    walletAddress: v.string(),
    // Event Token balance (in smallest unit, e.g., lamports)
    tokenBalance: v.number(),
    // Fiat equivalent (USD)
    fiatBalance: v.optional(v.number()),
    // Last balance update timestamp
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletAddress"]),

  // Merchants - business accounts for receiving payments
  merchants: defineTable({
    // Primary contact email
    email: v.string(),
    // Business display name
    businessName: v.string(),
    // Approval status
    status: v.string(), // "pending" | "approved" | "rejected"
    // Privy-managed wallet address (denormalized for queries)
    walletAddress: v.string(),
    // Registration timestamp
    createdAt: v.number(),
    // Admin review timestamp
    reviewedAt: v.optional(v.number()),
    // Admin user who reviewed
    reviewedBy: v.optional(v.id("users")),
    // Admin review notes
    notes: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_wallet", ["walletAddress"]),

  // Events - events that merchants can be assigned to
  events: defineTable({
    // Event name (e.g., "Summer Music Festival 2026")
    name: v.string(),
    // Event type (predefined or custom)
    type: v.string(), // "Concert" | "Sports" | "Festival" | "Custom"
    // Custom type name (required if type is "Custom")
    customType: v.optional(v.string()),
    // Event date (ISO date string)
    date: v.string(),
    // Venue/location name
    venue: v.string(),
    // Maximum attendees
    capacity: v.number(),
    // Creation timestamp
    createdAt: v.number(),
    // Last update timestamp
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_date", ["date"]),

  // Merchant Events - junction table linking merchants to events with booth assignments
  merchantEvents: defineTable({
    // Reference to merchant
    merchantId: v.id("merchants"),
    // Reference to event
    eventId: v.id("events"),
    // Booth location (e.g., "A1", "B12", "Food Court 3")
    boothNumber: v.string(),
    // Assignment timestamp
    createdAt: v.number(),
  })
    .index("by_merchant", ["merchantId"])
    .index("by_event", ["eventId"])
    .index("by_event_merchant", ["eventId", "merchantId"]),

  // Inventory - items that merchants sell at events
  inventory: defineTable({
    // Reference to merchant-event assignment (links to specific merchant at specific event)
    merchantEventId: v.id("merchantEvents"),
    // Item name (e.g., "Beer", "Hot Dog", "T-Shirt")
    itemName: v.string(),
    // Optional item description
    description: v.optional(v.string()),
    // Price in EVT tokens
    price: v.number(),
    // Available quantity (null for unlimited)
    stock: v.optional(v.number()),
    // Creation timestamp
    createdAt: v.number(),
    // Last update timestamp
    updatedAt: v.number(),
  })
    .index("by_merchantEvent", ["merchantEventId"])
    .index("by_name", ["itemName"]),
});
