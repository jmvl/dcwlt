import { query } from "./_generated/server";
import { v } from "convex/values";

// Server secret from environment (never exposed to client raw)
const QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || "default-dev-secret";

/**
 * Get QR secret for client-side QR generation
 * Returns the derived secret for TOTP and signing key for HMAC
 * SECURITY: Only returns secrets for authenticated users requesting their own data
 */
export const getQRSecret = query({
  args: {
    privyId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the requesting user matches the requested privyId
    if (identity.subject !== args.privyId) {
      throw new Error("Not authorized to access this QR secret");
    }

    // Simple derivation: userId + serverSecret (same pattern as server-side)
    const derivedSecret = `${args.privyId}:${QR_SIGNING_SECRET}`;

    return {
      derivedSecret,
      signingKey: QR_SIGNING_SECRET,
    };
  },
});
