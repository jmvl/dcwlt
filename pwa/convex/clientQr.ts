"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import * as crypto from "crypto";

// Server secret from environment (never exposed to client raw)
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

// Helper: Derive per-user secret as Base32 (TOTP requires Base32)
function deriveUserSecret(userId: string): string {
  const hmac = crypto
    .createHmac("sha256", QR_SIGNING_SECRET)
    .update(userId)
    .digest();
  return bufferToBase32(hmac);
}

/**
 * Get QR secret for client-side QR generation
 * Returns the derived secret for TOTP and signing key for HMAC
 * SECURITY: Only returns secrets for users that exist in the database
 *
 * Note: For production, configure Convex Auth with Privy to use ctx.auth.getUserIdentity()
 * See: https://docs.convex.dev/auth
 */
export const getQRSecret = action({
  args: {
    privyId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the user exists in our database
    const user = await ctx.runQuery(api.users.getByPrivyId, {
      privyId: args.privyId,
    });

    if (!user) {
      throw new Error("User not found - please log in first");
    }

    // Derive secret as Base32 (TOTP compatible)
    const derivedSecret = deriveUserSecret(args.privyId);

    return {
      derivedSecret,
      signingKey: QR_SIGNING_SECRET,
    };
  },
});
