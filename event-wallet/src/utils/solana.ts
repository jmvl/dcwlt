import { Keypair, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

/**
 * Derive Solana address from private key
 * Used to get wallet address from Web3Auth private key
 */
export async function deriveSolanaAddress(privateKey: string): Promise<string> {
  try {
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
export function getKeypairFromPrivateKey(privateKey: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(privateKey, 'hex')
  );
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
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
