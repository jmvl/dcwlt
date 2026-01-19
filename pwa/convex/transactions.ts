import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Transactions Module
 *
 * Manages payment transaction records for merchants.
 * Tracks all customer payments with status, signatures, and metadata.
 */

// ============================================================================
// QUERIES: Transactions
// ============================================================================

/**
 * List transactions for a merchant with optional filtering.
 *
 * @param merchantId - The merchant to get transactions for
 * @param dateRange - Optional date filter (today, week, month, all)
 * @param searchWallet - Optional customer wallet address search
 * @returns Array of transactions with item details
 *
 * @example
 * const transactions = await listMerchantTransactions({
 *   merchantId: "merchant123",
 *   dateRange: "week",
 *   searchWallet: "5xK3..."
 * });
 */
export const listMerchantTransactions = query({
  args: {
    merchantId: v.id("merchants"),
    dateRange: v.optional(v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    )),
    searchWallet: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Query transactions by merchant
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byMerchantByTime", (q) => q.eq("merchantId", args.merchantId))
      .collect();

    // Filter by date range
    const now = Date.now();
    const filteredByDate = transactions.filter((tx) => {
      const age = now - tx.timestamp;

      switch (args.dateRange) {
        case "today":
          // Last 24 hours
          return age < 24 * 60 * 60 * 1000;
        case "week":
          // Last 7 days
          return age < 7 * 24 * 60 * 60 * 1000;
        case "month":
          // Last 30 days
          return age < 30 * 24 * 60 * 60 * 1000;
        case "all":
        default:
          return true;
      }
    });

    // Filter by customer wallet if provided
    const filteredByWallet = args.searchWallet
      ? filteredByDate.filter((tx) =>
          tx.customerWallet.toLowerCase().includes(args.searchWallet!.toLowerCase())
        )
      : filteredByDate;

    // Sort by timestamp descending (newest first)
    const sorted = filteredByWallet.sort((a, b) => b.timestamp - a.timestamp);

    // Join with groupItems table to get item names
    const transactionsWithItemNames = await Promise.all(
      sorted.map(async (tx) => {
        const item = await ctx.db.get(tx.itemId);
        return {
          _id: tx._id,
          timestamp: tx.timestamp,
          itemName: item?.name || "Unknown Item",
          amount: tx.amount,
          customerWallet: tx.customerWallet,
          status: tx.status,
          signature: tx.signature,
        };
      })
    );

    return transactionsWithItemNames;
  },
});

/**
 * Get sales statistics for a merchant.
 *
 * @param merchantId - The merchant to get stats for
 * @param dateRange - Optional date filter (today, week, month, all)
 * @returns Sales statistics object
 *
 * @example
 * const stats = await getMerchantSalesStats({
 *   merchantId: "merchant123",
 *   dateRange: "week"
 * });
 * // Returns: { totalSales: 150, transactionCount: 30, averageTransaction: 5, todaySales: 25 }
 */
export const getMerchantSalesStats = query({
  args: {
    merchantId: v.id("merchants"),
    dateRange: v.optional(v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all")
    )),
  },
  handler: async (ctx, args) => {
    // Query transactions by merchant
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byMerchantByTime", (q) => q.eq("merchantId", args.merchantId))
      .collect();

    // Filter by date range
    const now = Date.now();
    const filteredByDate = transactions.filter((tx) => {
      const age = now - tx.timestamp;

      switch (args.dateRange) {
        case "today":
          return age < 24 * 60 * 60 * 1000;
        case "week":
          return age < 7 * 24 * 60 * 60 * 1000;
        case "month":
          return age < 30 * 24 * 60 * 60 * 1000;
        case "all":
        default:
          return true;
      }
    });

    // Calculate stats for confirmed transactions only
    const confirmedTransactions = filteredByDate.filter(
      (tx) => tx.status === "confirmed"
    );

    const totalSales = confirmedTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    const transactionCount = confirmedTransactions.length;

    const averageTransaction =
      transactionCount > 0 ? totalSales / transactionCount : 0;

    // Calculate today's sales (last 24 hours) for confirmed transactions
    const todaySales = confirmedTransactions
      .filter((tx) => now - tx.timestamp < 24 * 60 * 60 * 1000)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalSales,
      transactionCount,
      averageTransaction,
      todaySales,
    };
  },
});

// ============================================================================
// MUTATIONS: Transactions
// ============================================================================

/**
 * Create a new transaction record.
 *
 * This will be called from the payment flow when Phase 3 (payments) is complete.
 * For now, used by seed function to create mock data.
 *
 * @param merchantId - The merchant receiving payment
 * @param itemId - The item being purchased
 * @param customerWallet - The customer's wallet address
 * @param amount - Payment amount in EVT
 * @param signature - Optional Solana transaction signature
 * @returns The created transaction ID
 *
 * @example
 * const transactionId = await createTransaction({
 *   merchantId: "merchant123",
 *   itemId: "item456",
 *   customerWallet: "5xK3...9aB2",
 *   amount: 5.50,
 *   signature: "mock_signature_123"
 * });
 */
export const createTransaction = mutation({
  args: {
    merchantId: v.id("merchants"),
    itemId: v.id("groupItems"),
    customerWallet: v.string(),
    amount: v.number(),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate merchant exists
    const merchant = await ctx.db.get(args.merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Validate item exists
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Validate amount is positive
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Create transaction with pending status
    const transactionId = await ctx.db.insert("transactions", {
      merchantId: args.merchantId,
      itemId: args.itemId,
      customerWallet: args.customerWallet,
      amount: args.amount,
      timestamp: Date.now(),
      signature: args.signature,
      status: "pending",
    });

    return transactionId;
  },
});

/**
 * Update transaction status.
 *
 * Used when transaction confirmation is received from Solana.
 *
 * @param transactionId - The transaction to update
 * @param status - New status (pending, confirmed, failed)
 * @param signature - Optional Solana signature to add
 * @returns The updated transaction
 */
export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("failed")),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const updates: Record<string, any> = {
      status: args.status,
    };

    if (args.signature) {
      updates.signature = args.signature;
    }

    await ctx.db.patch(args.transactionId, updates);

    return await ctx.db.get(args.transactionId);
  },
});
