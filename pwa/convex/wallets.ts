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

// Mock top-up mutation that simulates adding tokens to wallet
export const mockTopUp = mutation({
  args: {
    walletAddress: v.string(),
    amount: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    // Simulate 2-second delay for network request
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock transaction signature
    const signature = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get existing wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Add amount to current balance
    const newBalance = wallet.tokenBalance + args.amount;

    // Update wallet with new balance
    await ctx.db.patch(wallet._id, {
      tokenBalance: newBalance,
      fiatBalance: newBalance * 0.1, // Mock conversion rate
      updatedAt: Date.now(),
    });

    return {
      success: true,
      signature,
      newBalance,
    };
  },
});
