"use node";

import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

import { internal } from "./_generated/api";

import { internalAction } from "./_generated/server";

import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import * as crypto from "crypto";

// ============================================================================
// Cryptographic QR Payment System (Node.js Actions Only)
// ============================================================================

// Server secret from environment (never exposed to client)
const QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || "default-dev-secret";

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// Helper: Convert buffer to Base32 string
function bufferToBase32(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    result += BASE32_ALPHABET[parseInt(chunk, 2)];
  }

  return result;
}

// Configure TOTP for 60-second windows with clock skew tolerance
const totp = new TOTP({
  period: 60,
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

// Helper: Derive per-user secret as Base32 (TOTP requires Base32)
function deriveUserSecretBase32(userId: string): string {
  const hmac = crypto
    .createHmac("sha256", QR_SIGNING_SECRET)
    .update(userId)
    .digest();
  return bufferToBase32(hmac);
}

// Helper: Verify TOTP time key (5-minute window, 2-minute skew)
async function verifyTimeKey(timeKey: string, derivedSecret: string): Promise<boolean> {
  const result = await totp.verify(timeKey, {
    secret: derivedSecret,
    epochTolerance: 120, // 2-minute tolerance
  });
  return result.valid;
}

// Helper: Verify HMAC signature (server-side only)
function verifyHMAC(message: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");
  return signature === expectedSignature;
}

// ============================================================================
// MAIN PAYMENT ACTION
// ============================================================================
/**
 * Process QR Payment - Atomic payment processing for QR-based payments
 *
 * Flow:
 * 1. Validate QR signature using server secret
 * 2. Verify time key with 2-minute clock skew tolerance
 * 3. Check customer balance before transfer
 * 4. Execute atomic balance transfer
 * 5. Create transaction record
 */
export const processQRPayment = internalAction({
  args: {
    customerPrivyId: v.string(),
    timeKey: v.string(),
    signature: v.string(),
    merchantId: v.id("merchants"),
    amount: v.number(),
    itemId: v.optional(v.id("groupItems")),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    amount: number;
    transactionId: Id<"transactions">;
    newCustomerBalance: number;
  }> => {
    // 1. Get derived secret for this user (Base32 for TOTP)
    const derivedSecretBase32 = deriveUserSecretBase32(args.customerPrivyId);

    // 2. Verify signature (using raw secret for HMAC)
    const message = `${args.customerPrivyId}:${args.timeKey}`;
    if (!verifyHMAC(message, args.signature, QR_SIGNING_SECRET)) {
      throw new Error("Invalid QR signature");
    }

    // 3. Verify time key (5-minute validity, 2-minute skew)
    if (!await verifyTimeKey(args.timeKey, derivedSecretBase32)) {
      throw new Error("QR code expired");
    }

    // 4. Get customer by Privy ID
    const customer = await ctx.runQuery(internal.cryptographicQrInternal.getUserByPrivyIdInternal, {
      privyId: args.customerPrivyId,
    });
    if (!customer) {
      throw new Error("Customer not found");
    }

    // 5. Get customer wallet
    const customerWallet = await ctx.runQuery(internal.cryptographicQrInternal.getWalletByUserIdInternal, {
      userId: customer._id,
    });
    if (!customerWallet) {
      throw new Error("Customer wallet not found");
    }

    // 6. Validate sufficient balance
    if (customerWallet.tokenBalance < args.amount) {
      throw new Error(
        `Insufficient balance: have ${customerWallet.tokenBalance} EVT, need ${args.amount} EVT`
      );
    }

    // 7. Get merchant
    const merchant = await ctx.runQuery(internal.cryptographicQrInternal.getMerchantByIdInternal, {
      merchantId: args.merchantId,
    });
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // 8. Get merchant wallet
    const merchantWallet = await ctx.runQuery(internal.cryptographicQrInternal.getWalletByAddressInternal, {
      walletAddress: merchant.walletAddress,
    });
    if (!merchantWallet) {
      throw new Error("Merchant wallet not found");
    }

    // 9. Calculate new balances
    const newCustomerBalance = customerWallet.tokenBalance - args.amount;
    const newMerchantBalance = merchantWallet.tokenBalance + args.amount;

    // 10. Debit customer wallet (atomic)
    await ctx.runMutation(internal.cryptographicQrInternal.updateWalletBalanceInternal, {
      walletId: customerWallet._id,
      newBalance: newCustomerBalance,
    });

    // 11. Credit merchant wallet (atomic)
    await ctx.runMutation(internal.cryptographicQrInternal.updateWalletBalanceInternal, {
      walletId: merchantWallet._id,
      newBalance: newMerchantBalance,
    });

    // 12. Create transaction record
    const transactionId = await ctx.runMutation(internal.cryptographicQrInternal.createTransactionInternal, {
      customerWalletAddress: customerWallet.walletAddress,
      merchantWalletAddress: merchantWallet.walletAddress,
      merchantId: args.merchantId,
      itemId: args.itemId,
      amount: args.amount,
      signature: args.signature,
    });

    return {
      success: true,
      amount: args.amount,
      transactionId,
      newCustomerBalance,
    };
  },
});
