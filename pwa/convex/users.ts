import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user by wallet address
export const getOrCreateUser = mutation({
  args: {
    walletAddress: v.string(),
    oauthProvider: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (existing) {
      // Update last active
      await ctx.db.patch(existing._id, {
        lastActiveAt: Date.now(),
      });
      return existing;
    }

    // Create new user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      oauthProvider: args.oauthProvider,
      email: args.email,
      createdAt: now,
      lastActiveAt: now,
    });

    // Create wallet record with zero balance
    await ctx.db.insert("wallets", {
      userId,
      walletAddress: args.walletAddress,
      tokenBalance: 0,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

// Get current user by wallet address
export const getUser = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    return user;
  },
});
