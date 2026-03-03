import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user by wallet address
export const getOrCreateUser = mutation({
  args: {
    walletAddress: v.string(),
    oauthProvider: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
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
  handler: async (ctx: any, args: any) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    return user;
  },
});

// Get user by Privy ID (did:privy:xxx)
export const getByPrivyId = query({
  args: { privyId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_privy_id", (q) => q.eq("privyId", args.privyId))
      .first();
  },
});

// Create user from Privy authentication (called after login)
export const createFromPrivy = mutation({
  args: {
    walletAddress: v.string(),
    email: v.optional(v.string()),
    privyId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Check for existing user by wallet address first
    const existingByWallet = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (existingByWallet) {
      // Update privyId if not already set
      if (!existingByWallet.privyId && args.privyId) {
        await ctx.db.patch(existingByWallet._id, {
          privyId: args.privyId,
          lastActiveAt: Date.now(),
        });
      }
      return existingByWallet;
    }

    // Also check by privyId if provided
    if (args.privyId) {
      const existingByPrivyId = await ctx.db
        .query("users")
        .withIndex("by_privy_id", (q: any) => q.eq("privyId", args.privyId))
        .first();

      if (existingByPrivyId) {
        return existingByPrivyId;
      }
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      privyId: args.privyId,
      oauthProvider: "privy",
      email: args.email,
      createdAt: now,
      lastActiveAt: now,
    });

    // Initialize wallet with zero balance
    await ctx.db.insert("wallets", {
      userId,
      walletAddress: args.walletAddress,
      tokenBalance: 0,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});;
