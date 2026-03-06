import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

// ============================================================================
// Cryptographic QR Payment System - Internal Queries & Mutations
// These run in Convex runtime (not Node.js)
// ============================================================================

// Internal query to get user by Privy ID
export const getUserByPrivyIdInternal = internalQuery({
  args: {
    privyId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_privy_id", (q) => q.eq("privyId", args.privyId))
      .first();
  },
});

// Internal query to get wallet by user ID
export const getWalletByUserIdInternal = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Internal query to get merchant by ID
export const getMerchantByIdInternal = internalQuery({
  args: {
    merchantId: v.id("merchants"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.merchantId);
  },
});

// Internal query to get wallet by wallet address
export const getWalletByAddressInternal = internalQuery({
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

// Internal mutation to update wallet balance
export const updateWalletBalanceInternal = internalMutation({
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

// Internal mutation to create transaction record
export const createTransactionInternal = internalMutation({
  args: {
    customerWalletAddress: v.string(),
    merchantWalletAddress: v.string(),
    merchantId: v.id("merchants"),
    itemId: v.optional(v.id("groupItems")),
    amount: v.number(),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", {
      customerWallet: args.customerWalletAddress,
      merchantId: args.merchantId,
      itemId: args.itemId,
      amount: args.amount,
      timestamp: Date.now(),
      status: "confirmed",
      signature: args.signature,
    });
  },
});
