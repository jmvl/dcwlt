/**
 * Seed Mock Transactions
 *
 * Generates mock transaction data for testing the sales history page.
 * This is temporary for development and testing.
 *
 * Usage:
 *   npx convex run --merchantId <MERCHANT_ID>
 *
 * Or call from Convex dashboard:
 *   seedMockTransactions("<merchant-id>")
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Mock Solana addresses (44 characters, base58)
const mockWalletAddresses = [
  '5xK3cHvYjGxN9PqR2sT7wF4mZ8nB1aL6dE3kJ0oV9hG2',
  '7pL4dIwKzH0oR3sT8uG5nA9mC2bN7eF4jK1lP0oW6xH3',
  '8qM5eJxL0iS4tU9vH6nB3oD8cO5fR2gM1kN0pY7zI4',
  '9rN6fKyM1jT5uV0wI7oC4pE9dQ6sS3hN2lO1qX8zJ5',
  '0sO7gLzN2kU6wX1yJ8pD5qF0eR7tT4iO3mP2rY9aK6',
];

const mockSignatures = [
  'mock_signature_abc123def456',
  'mock_signature_ghi789jkl012',
  'mock_signature_mno345pqr678',
  'mock_signature_stu901vwx234',
  'mock_signature_yza567bcd890',
];

function generateRandomTimestamp(daysAgo: number): number {
  const now = Date.now();
  const daysMs = daysAgo * 24 * 60 * 60 * 1000;
  const randomOffset = Math.random() * daysMs; // Random time within the day range
  return now - randomOffset;
}

function generateRandomStatus(): 'pending' | 'confirmed' | 'failed' {
  const rand = Math.random();
  if (rand < 0.7) return 'confirmed'; // 70% confirmed
  if (rand < 0.9) return 'pending'; // 20% pending
  return 'failed'; // 10% failed
}

/**
 * Seed mock transactions for a merchant.
 *
 * Generates 10-20 mock transactions with varied data for testing.
 * Timestamps distributed across today, yesterday, last week, and last month.
 *
 * @param merchantId - The merchant to seed transactions for
 * @returns Count of created transactions
 */
export const seedMockTransactions = mutation({
  args: {
    merchantId: v.id('merchants'),
  },
  handler: async (ctx, args) => {
    const { merchantId } = args;

    // Get merchant's event assignments
    const merchantEvents = await ctx.db
      .query('merchantEvents')
      .withIndex('by_merchant', (q) => q.eq('merchantId', merchantId))
      .collect();

    if (merchantEvents.length === 0) {
      throw new Error('Merchant has no event assignments. Cannot seed transactions without items.');
    }

    // Get all group assignments for this merchant
    const allGroupAssignments = await Promise.all(
      merchantEvents.map(async (me) => {
        const assignments = await ctx.db
          .query('merchantGroupAssignments')
          .withIndex('by_merchantEvent', (q) => q.eq('merchantEventId', me._id))
          .collect();
        return assignments.filter((a) => a.enabled);
      })
    );

    const groupAssignments = allGroupAssignments.flat();

    if (groupAssignments.length === 0) {
      throw new Error('Merchant has no item groups assigned. Cannot seed transactions.');
    }

    // Get items from assigned groups
    const allItems = await Promise.all(
      groupAssignments.map(async (assignment) => {
        const items = await ctx.db
          .query('groupItems')
          .withIndex('by_group', (q) => q.eq('itemGroupId', assignment.itemGroupId))
          .collect();
        return items;
      })
    );

    const availableItems = allItems.flat();

    if (availableItems.length === 0) {
      throw new Error('No items available in assigned groups. Cannot seed transactions.');
    }

    // Generate 10-20 mock transactions
    const transactionCount = Math.floor(Math.random() * 11) + 10; // 10-20
    const createdTransactions = [];

    for (let i = 0; i < transactionCount; i++) {
      // Pick random item
      const item = availableItems[Math.floor(Math.random() * availableItems.length)];

      // Pick random customer wallet
      const customerWallet =
        mockWalletAddresses[Math.floor(Math.random() * mockWalletAddresses.length)];

      // Amount from item price
      const amount = item.defaultPrice;

      // Determine timestamp distribution
      let daysAgo: number;
      if (i < transactionCount * 0.25) {
        // 25% today (last 24 hours)
        daysAgo = Math.random() * 1;
      } else if (i < transactionCount * 0.5) {
        // 25% yesterday (1-2 days ago)
        daysAgo = 1 + Math.random() * 1;
      } else if (i < transactionCount * 0.75) {
        // 25% last week (2-7 days ago)
        daysAgo = 2 + Math.random() * 5;
      } else {
        // 25% last month (7-30 days ago)
        daysAgo = 7 + Math.random() * 23;
      }

      const timestamp = generateRandomTimestamp(daysAgo);

      // Status with distribution
      const status = generateRandomStatus();

      // Signature for confirmed transactions
      const signature = status === 'confirmed'
        ? mockSignatures[Math.floor(Math.random() * mockSignatures.length)] + `_${i}`
        : undefined;

      // Insert transaction
      const transactionId = await ctx.db.insert('transactions', {
        merchantId,
        itemId: item._id,
        customerWallet,
        amount,
        timestamp,
        signature,
        status,
      });

      createdTransactions.push(transactionId);
    }

    return {
      success: true,
      created: createdTransactions.length,
      transactionIds: createdTransactions,
    };
  },
});
