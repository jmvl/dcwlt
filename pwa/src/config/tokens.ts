/**
 * Token Implementation Feature Flag
 *
 * When true: Uses Convex database for token balances (instant, no gas)
 * When false: Uses Solana SPL tokens (blockchain, gas sponsorship)
 */
export const USE_DATABASE_TOKENS =
  process.env.NEXT_PUBLIC_USE_DATABASE_TOKENS === 'true';

/**
 * Token configuration constants
 */
export const TOKEN_CONFIG = {
  // Conversion rate: 1 EVT = 0.1 USD (for display purposes)
  FIAT_CONVERSION_RATE: 0.1,
} as const;
