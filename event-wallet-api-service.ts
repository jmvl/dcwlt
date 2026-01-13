// API service for Event Wallet backend integration

const API_BASE = 'http://localhost:3000'; // Update with your backend URL

export interface TopUpResponse {
  success: boolean;
  signature?: string;
  amount?: number;
  message?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Simulate Visa top-up by transferring Event Tokens from bank wallet
 * @param walletAddress - User's Solana wallet address
 * @param amount - Amount of tokens to transfer (default: 50)
 * @returns Promise with top-up result
 */
export async function topUpWallet(
  walletAddress: string,
  amount: number = 50
): Promise<TopUpResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Top-up API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to backend',
    };
  }
}

/**
 * Check backend health/status
 * @returns Promise with health status
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  bankWalletConfigured: boolean;
  tokenAddressConfigured: boolean;
  bankWalletAddress?: string;
  network: string;
} | null> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Health check error:', error);
    return null;
  }
}

/**
 * Get backend service status and available endpoints
 */
export async function getBackendStatus(): Promise<{
  service: string;
  version: string;
  endpoints: Record<string, string>;
  configuration: {
    bankWalletConfigured: boolean;
    tokenAddressConfigured: boolean;
    network: string;
  };
} | null> {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Status check error:', error);
    return null;
  }
}
