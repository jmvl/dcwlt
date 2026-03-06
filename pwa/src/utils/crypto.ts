/**
 * Cryptographic utilities for HMAC-based signatures using Web Crypto API
 */

/**
 * Sign a message using HMAC-SHA256
 * @param message - The message to sign
 * @param secret - The signing secret (from server via Convex query)
 * @returns Hex signature string
 */
export async function signHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(message)
  );

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify an HMAC signature
 * @param message - Original message
 * @param signature - Expected signature (hex string)
 * @param secret - The signing secret
 * @returns true if signature is valid
 */
export async function verifyHMAC(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await signHMAC(message, secret);
  return expectedSignature === signature;
}
