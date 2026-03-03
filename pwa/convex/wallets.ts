import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Get all wallets (for admin dashboard)
export const getAllWallets = query({
  args: {},
  handler: async (ctx: any) => {
    const wallets = await ctx.db.query("wallets").collect();
    return wallets.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },
});

// Get wallet by address (for merchant dashboard)
export const getWalletByAddress = query({
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

    return wallet;
  },
});

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

// Increment balance by amount (for top-up flow - database-only, no Solana transaction)
export const incrementBalance = mutation({
  args: {
    walletAddress: v.string(),
    amount: v.number(), // Amount to add (positive)
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = wallet.tokenBalance + args.amount;
    await ctx.db.patch(wallet._id, {
      tokenBalance: newBalance,
      fiatBalance: newBalance * 0.1,
      updatedAt: Date.now(),
    });

    return { success: true, newBalance };
  },
});

// Internal query to get wallet (used by action)
export const getWalletForTopUpInternal = internalQuery({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

// Internal mutation to update wallet balance (used by action)
export const updateWalletForTopUpInternal = internalMutation({
  args: {
    walletId: v.id("wallets"),
    newBalance: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.walletId, {
      tokenBalance: args.newBalance,
      fiatBalance: args.newBalance * 0.1, // Mock conversion rate
      updatedAt: Date.now(),
    });
  },
});

// Query to get wallet for top-up action (exported for public use)
export const getWalletForTopUp = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

// Mutation to update wallet balance for top-up action (exported for public use)
export const updateWalletForTopUp = mutation({
  args: {
    walletId: v.id("wallets"),
    newBalance: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.walletId, {
      tokenBalance: args.newBalance,
      fiatBalance: args.newBalance * 0.1, // Mock conversion rate
      updatedAt: Date.now(),
    });
  },
});

// Real top-up action that transfers EVT tokens on Solana Devnet
// Calls backend server which has the bank wallet to send tokens
export const mockTopUp = action({
  args: {
    walletAddress: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    signature?: string;
    newBalance?: number;
    explorerUrl?: string;
  }> => {
    console.log('[mockTopUp] Starting real top-up on Solana Devnet...');

    try {
      // Call the backend API to transfer tokens
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: args.walletAddress,
          amount: args.amount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Top-up failed');
      }

      console.log('[mockTopUp] Backend response:', result);

      // Get existing wallet
      const wallet = await ctx.runQuery(internal.wallets.getWalletForTopUpInternal, {
        walletAddress: args.walletAddress,
      });

      if (!wallet) {
        throw new Error("Wallet not found in database");
      }

      // Update local database with new balance
      const newBalance = wallet.tokenBalance + args.amount;
      await ctx.runMutation(internal.wallets.updateWalletForTopUpInternal, {
        walletId: wallet._id,
        newBalance,
      });

      console.log('[mockTopUp] Top-up complete, signature:', result.signature);

      return {
        success: true,
        signature: result.signature,
        newBalance,
        explorerUrl: result.explorerUrl,
      };
    } catch (error: any) {
      console.error('[mockTopUp] Error:', error);
      throw new Error(error?.message || 'Top-up failed');
    }
  },
});

// Record payment mutation that subtracts tokens from wallet after successful payment
export const recordPayment = mutation({
  args: {
    walletAddress: v.string(),
    amount: v.number(), // Amount in EVT (not lamports)
    signature: v.string(),
    type: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    // Get existing wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Subtract amount from current balance
    const newBalance = wallet.tokenBalance - args.amount;

    // Ensure balance doesn't go negative
    if (newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    // Update wallet with new balance
    await ctx.db.patch(wallet._id, {
      tokenBalance: newBalance,
      fiatBalance: newBalance * 0.1, // Mock conversion rate
      updatedAt: Date.now(),
    });

    return {
      success: true,
      signature: args.signature,
      newBalance,
    };
  },
});
