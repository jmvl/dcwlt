// CRITICAL: Lazy-load @solana/web3.js to avoid Buffer access during module evaluation
// This prevents "Cannot read property 'slice' of undefined" errors
// import { Keypair, PublicKey } from '@solana/web3.js';

import { Buffer } from 'react-native-buffer';

/**
 * Derive Solana address from private key
 * Used to get wallet address from Web3Auth private key
 */
export async function deriveSolanaAddress(privateKey: string): Promise<string> {
  try {
    // Lazy-load Solana SDK to avoid Buffer initialization issues
    const { Keypair } = await import('@solana/web3.js');

    // Convert hex private key to keypair
    const keypair = Keypair.fromSecretKey(
      Buffer.from(privateKey, 'hex')
    );
    return keypair.publicKey.toBase58();
  } catch (error) {
    console.error('Error deriving address:', error);
    throw error;
  }
}

/**
 * Get Keypair from private key
 * Used for signing transactions
 */
export async function getKeypairFromPrivateKey(privateKey: string): Promise<any> {
  // Lazy-load Solana SDK to avoid Buffer initialization issues
  const { Keypair } = await import('@solana/web3.js');

  return Keypair.fromSecretKey(
    Buffer.from(privateKey, 'hex')
  );
}

/**
 * Validate Solana address format
 */
export async function isValidSolanaAddress(address: string): Promise<boolean> {
  try {
    // Lazy-load Solana SDK to avoid Buffer initialization issues
    const solanaModule = await import('@solana/web3.js');
    new solanaModule.PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format token amount for display (convert from smallest unit)
 */
export function formatTokenAmount(amount: number, decimals: number = 9): string {
  const divisor = Math.pow(10, decimals);
  return (amount / divisor).toFixed(2);
}

/**
 * Convert display amount to smallest unit
 */
export function toSmallestUnit(amount: number, decimals: number = 9): number {
  return Math.floor(amount * Math.pow(10, decimals));
}
