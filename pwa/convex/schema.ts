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
});
