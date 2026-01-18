import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new merchant with automatic Privy wallet generation
export const registerMerchant = mutation({
  args: {
    email: v.string(),
    businessName: v.string(),
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

    // Auto-generate Privy embedded wallet address
    // In production, this would call Privy's embedded wallet API
    // For now, generate a mock Solana address following the pattern from Phase 2
    const mockWalletAddress = generateMockWalletAddress(args.email);

    // Create merchant record with pending status
    const merchantId = await ctx.db.insert("merchants", {
      email: args.email,
      businessName: args.businessName,
      status: "pending",
      walletAddress: mockWalletAddress,
      createdAt: Date.now(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      notes: undefined,
    });

    return await ctx.db.get(merchantId);
  },
});

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

// Helper function to generate mock wallet address
// In production, this would be replaced by actual Privy embedded wallet creation
function generateMockWalletAddress(email: string): string {
  // Generate a deterministic mock Solana address based on email
  // This follows the same pattern as user wallets from Phase 2
  const hash = simpleHash(email);
  const pubkeyBase58 = encodeBase58(hash);
  return pubkeyBase58;
}

// Simple hash function for mock wallet generation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Base58 encoding for mock Solana address
function encodeBase58(num: number): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let encoded = "";
  let n = num;

  while (n > 0) {
    const remainder = n % 58;
    encoded = alphabet[remainder] + encoded;
    n = Math.floor(n / 58);
  }

  // Pad to typical Solana address length (44 chars)
  while (encoded.length < 44) {
    encoded = "1" + encoded;
  }

  return encoded;
}

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
