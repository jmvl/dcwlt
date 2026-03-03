/**
 * Solana Pay URL parser and validator
 *
 * Parses Solana Pay URLs of the format:
 * solana:<recipient>?amount=<amount>&reference=<ref>&label=<label>&message=<message>
 *
 * Note: spl-token parameter is optional - not required for database token system
 * The parser handles missing spl-token gracefully (returns null if not present)
 */

export interface ParsedSolanaPayURL {
  recipient: string;
  amount: string | null;
  splToken: string | null;
  reference: string | null;
  label: string | null;
  message: string | null;
}

/**
 * Regex pattern for validating Solana Pay URLs
 * Matches: solana:<base58-address>?<query-params>
 */
export const SOLANA_PAY_URL_PATTERN = /^solana:[1-9A-HJ-NP-Za-km-z]{32,44}(\?.*)?$/;

/**
 * Validates a Solana Pay URL
 * @param url - URL string to validate
 * @returns true if valid Solana Pay URL, false otherwise
 */
export function isValidSolanaPayURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check if URL starts with "solana:" scheme
  if (!url.startsWith('solana:')) {
    return false;
  }

  // Validate against regex pattern
  return SOLANA_PAY_URL_PATTERN.test(url);
}

/**
 * Parses a Solana Pay URL into its components
 * @param url - Solana Pay URL string (e.g., "solana:abc123...?amount=100")
 * @returns Parsed URL components
 * @throws Error if URL format is invalid
 */
export function parseSolanaPayURL(url: string): ParsedSolanaPayURL {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL: URL must be a non-empty string');
  }

  // Validate URL format
  if (!isValidSolanaPayURL(url)) {
    throw new Error('Invalid Solana Pay URL format');
  }

  // Remove "solana:" scheme prefix
  const withoutScheme = url.substring(7); // Remove 'solana:'

  // Split on '?' to separate address from query params
  const [recipient, queryString] = withoutScheme.split('?');

  if (!recipient) {
    throw new Error('Invalid URL: Missing recipient address');
  }

  // Parse query parameters
  const params: ParsedSolanaPayURL = {
    recipient,
    amount: null,
    splToken: null,
    reference: null,
    label: null,
    message: null,
  };

  if (queryString) {
    const searchParams = new URLSearchParams(queryString);

    params.amount = searchParams.get('amount');
    params.splToken = searchParams.get('spl-token');
    params.reference = searchParams.get('reference');
    params.label = searchParams.get('label');
    params.message = searchParams.get('message');
  }

  return params;
}
