import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new merchant with automatic Privy wallet generation
export const registerMerchant = mutation({
  args: {
    email: v.string(),
    businessName: v.string(),
    walletAddress: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    // Check if email already registered
    const existing = await ctx.db
      .query("merchants")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate wallet address format (basic Solana address validation)
    // Solana addresses are 32-44 characters in base58 encoding
    if (!args.walletAddress || args.walletAddress.length < 32 || args.walletAddress.length > 44) {
      throw new Error("Invalid wallet address format");
    }

    // Create merchant record with pending status
    // Uses the provided wallet address from Privy embedded wallet
    const merchantId = await ctx.db.insert("merchants", {
      email: args.email,
      businessName: args.businessName,
      status: "pending",
      walletAddress: args.walletAddress,
      createdAt: Date.now(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      notes: undefined,
    });

    return await ctx.db.get(merchantId);
  },
});;

// Get merchant by email
export const getMerchantByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const merchant = await ctx.db
      .query("merchants")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();

    if (!merchant) {
      return null;
    }

    return merchant;
  },
});

// Get all pending merchants (for admin review)
export const getPendingMerchants = query({
  args: {},
  handler: async (ctx: any) => {
    const pendingMerchants = await ctx.db
      .query("merchants")
      .withIndex("by_status", (q: any) => q.eq("status", "pending"))
      .collect();

    // Sort by createdAt (oldest first)
    return pendingMerchants.sort((a: any, b: any) => a.createdAt - b.createdAt);
  },
});

// Get merchant by wallet address (for payment routing)
export const getMerchantByWallet = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const merchant = await ctx.db
      .query("merchants")
      .withIndex("by_wallet", (q: any) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!merchant) {
      return null;
    }

    return merchant;
  },
});

// Approve merchant application
export const approveMerchant = mutation({
  args: {
    merchantId: v.id("merchants"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Get merchant
    const merchant = await ctx.db.get(args.merchantId);

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Validate merchant is pending
    if (merchant.status !== "pending") {
      throw new Error("Can only approve pending merchants");
    }

    // Get admin user ID from auth
    const identity = ctx.auth.getUserIdentity();
    const adminId = identity?.subject;

    // Update merchant status
    await ctx.db.patch(args.merchantId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: adminId,
      notes: args.adminNotes,
    });

    return await ctx.db.get(args.merchantId);
  },
});

// Reject merchant application
export const rejectMerchant = mutation({
  args: {
    merchantId: v.id("merchants"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Get merchant
    const merchant = await ctx.db.get(args.merchantId);

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Validate merchant is pending
    if (merchant.status !== "pending") {
      throw new Error("Can only reject pending merchants");
    }

    // Get admin user ID from auth
    const identity = ctx.auth.getUserIdentity();
    const adminId = identity?.subject;

    // Update merchant status
    await ctx.db.patch(args.merchantId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: adminId,
      notes: args.rejectionReason,
    });

    return await ctx.db.get(args.merchantId);
  },
});

// Admin queries

// Get all merchants ordered by createdAt (newest first)
export const getAllMerchants = query({
  args: {},
  handler: async (ctx: any) => {
    const merchants = await ctx.db.query("merchants").collect();

    // Sort by createdAt (newest first)
    return merchants.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// Get merchants by status
export const getMerchantsByStatus = query({
  args: {
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const merchants = await ctx.db
      .query("merchants")
      .withIndex("by_status", (q: any) => q.eq("status", args.status))
      .collect();

    // Sort by createdAt (newest first)
    return merchants.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// Get merchant with details by ID
export const getMerchantWithDetails = query({
  args: {
    merchantId: v.id("merchants"),
  },
  handler: async (ctx: any, args: any) => {
    const merchant = await ctx.db.get(args.merchantId);

    if (!merchant) {
      return null;
    }

    return merchant;
  },
});

// Update merchant wallet address (for fixing invalid mock addresses)
export const updateMerchantWalletAddress = mutation({
  args: {
    email: v.string(),
    walletAddress: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    // Find merchant by email
    const merchant = await ctx.db
      .query("merchants")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Validate wallet address format (basic Solana address validation)
    if (!args.walletAddress || args.walletAddress.length < 32 || args.walletAddress.length > 44) {
      throw new Error("Invalid wallet address format");
    }

    // Update wallet address
    await ctx.db.patch(merchant._id, {
      walletAddress: args.walletAddress,
    });

    return await ctx.db.get(merchant._id);
  },
});
