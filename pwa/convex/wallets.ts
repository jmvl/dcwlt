import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get wallet balance by wallet address (for real-time subscriptions)
export const getBalance = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      return null;
    }

    return {
      tokenBalance: wallet.tokenBalance,
      fiatBalance: wallet.fiatBalance,
      updatedAt: wallet.updatedAt,
    };
  },
});

// Update wallet balance (called by backend top-up endpoint)
export const updateBalance = mutation({
  args: {
    walletAddress: v.string(),
    newTokenBalance: v.number(),
    fiatBalance: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await ctx.db.patch(wallet._id, {
      tokenBalance: args.newTokenBalance,
      fiatBalance: args.fiatBalance,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(wallet._id);
  },
});

// Set mock balance for testing (before top-up flow is implemented)
export const setMockBalance = mutation({
  args: {
    walletAddress: v.string(),
    tokenBalance: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await ctx.db.patch(wallet._id, {
      tokenBalance: args.tokenBalance,
      fiatBalance: args.tokenBalance * 0.1, // Mock conversion rate
      updatedAt: Date.now(),
    });

    return await ctx.db.get(wallet._id);
  },
});
