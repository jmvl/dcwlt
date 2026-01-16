/**
 * SolanaPOCAPI - API Service Layer
 *
 * Provides a clean interface to all backend endpoints for the Solana POC frontend.
 * Handles token operations, merchant management, payments, and existing wallet operations.
 *
 * @class SolanaPOCAPI
 * @example
 * const api = new SolanaPOCAPI();
 * const balance = await api.getTokenBalance('walletAddress');
 */
class SolanaPOCAPI {
  /**
   * Creates an instance of SolanaPOCAPI
   * @param {string} baseURL - The base URL for the API (default: localhost:3002)
   */
  constructor(baseURL = 'http://localhost:3002/api') {
    this.baseURL = baseURL;
  }

  /**
   * Generic request handler with error handling
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options (method, body, headers)
   * @returns {Promise<Object>} Response data
   * @throws {Error} API request errors
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Handle non-JSON responses (if any)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Unexpected response type: ${contentType}`);
      }

      const data = await response.json();

      // Check for API-level errors
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Check for business logic errors
      if (data.success === false) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      // Re-throw with more context
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to backend at ${this.baseURL}. Is the server running?`);
      }
      throw error;
    }
  }

  // ============================================================
  // WALLET OPERATIONS
  // ============================================================

  /**
   * Store shard 2 on backend during wallet generation
   * @param {string} walletId - Wallet identifier
   * @param {string} shard2 - Second shard of private key (hex)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async storeShard(walletId, shard2) {
    if (!walletId || !shard2) {
      throw new Error('walletId and shard2 are required');
    }

    const response = await this.request('/store-shard', {
      method: 'POST',
      body: JSON.stringify({ walletId, shard2 })
    });

    return response;
  }

  /**
   * Refresh balances in the UI from stored session wallet
   * Gets wallet address from sessionStorage and updates balance displays
   * @returns {Promise<{tokenBalance: number, solBalance: number}>}
   */
  async refreshBalances() {
    const walletAddress = sessionStorage.getItem('walletAddress');
    if (!walletAddress) {
      return { tokenBalance: 0, solBalance: 0 };
    }

    const response = await this.getTokenBalance(walletAddress);

    // Update UI elements
    const tokenBalance = document.getElementById('token-balance');
    const solBalance = document.getElementById('sol-balance');

    if (tokenBalance) {
      tokenBalance.textContent = (response.tokenBalance || 0).toFixed(2);
    }
    if (solBalance) {
      solBalance.textContent = (response.balance || 0).toFixed(4);
    }

    return {
      tokenBalance: response.tokenBalance || 0,
      solBalance: response.balance || 0
    };
  }

  // ============================================================
  // TOKEN OPERATIONS
  // ============================================================

  /**
   * Get token balance for a wallet address
   * Returns both SOL and EVENT token balances
   * @param {string} address - Solana wallet address
   * @returns {Promise<{balance: number, tokenBalance: number, network: string}>}
   * @example
   * const { balance, tokenBalance } = await api.getTokenBalance('7xKX...');
   */
  async getTokenBalance(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Valid wallet address is required');
    }

    const response = await this.request('/token-balance', {
      method: 'POST',
      body: JSON.stringify({ address })
    });

    return {
      balance: response.balance,
      tokenBalance: response.tokenBalance,
      network: response.network
    };
  }

  /**
   * Top up wallet with EVENT tokens from the pool
   * Simulates a Visa card top-up by transferring tokens from pool to user
   * @param {string} walletId - Wallet identifier from session
   * @param {string} shard1 - First shard of private key (hex)
   * @param {number} amount - Amount to top up (0-10000)
   * @returns {Promise<{signature: string, amount: number, explorerUrl: string}>}
   * @example
   * const result = await api.topUp(walletId, shard1, 50);
   */
  async topUp(walletId, shard1, amount) {
    if (!walletId || !shard1) {
      throw new Error('walletId and shard1 are required');
    }
    if (!amount || amount <= 0 || amount > 10000) {
      throw new Error('Amount must be between 0 and 10000');
    }

    const response = await this.request('/topup', {
      method: 'POST',
      body: JSON.stringify({ walletId, shard1, amount })
    });

    return {
      success: response.success,
      signature: response.signature,
      amount: response.amount,
      explorerUrl: response.explorerUrl
    };
  }

  // ============================================================
  // MERCHANT OPERATIONS
  // ============================================================

  /**
   * Get all registered merchants
   * @returns {Promise<Array<{id: string, name: string, description: string, publicKey: string}>>}
   * @example
   * const merchants = await api.getMerchants();
   */
  async getMerchants() {
    const response = await this.request('/merchant/list', {
      method: 'GET'
    });

    return response.merchants;
  }

  /**
   * Create a new merchant
   * @param {string} name - Merchant name
   * @param {string} description - Merchant description
   * @returns {Promise<Object>} Created merchant object
   * @example
   * const merchant = await api.createMerchant('Coffee Shop', 'Best coffee in town');
   */
  async createMerchant(name, description = '') {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Merchant name is required');
    }

    const response = await this.request('/merchant/create', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), description: description.trim() })
    });

    return response.merchant;
  }

  /**
   * Update an existing merchant
   * @param {string} id - Merchant ID
   * @param {string} name - New merchant name
   * @param {string} description - New merchant description
   * @returns {Promise<Object>} Updated merchant object
   * @example
   * const updated = await api.updateMerchant('merchant-123', 'New Name', 'New description');
   */
  async updateMerchant(id, name, description) {
    if (!id) {
      throw new Error('Merchant ID is required');
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Merchant name is required');
    }

    const response = await this.request(`/merchant/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: name.trim(), description: description?.trim() || '' })
    });

    return response.merchant;
  }

  /**
   * Delete a merchant
   * @param {string} id - Merchant ID
   * @returns {Promise<{success: boolean, message: string}>}
   * @example
   * await api.deleteMerchant('merchant-123');
   */
  async deleteMerchant(id) {
    if (!id) {
      throw new Error('Merchant ID is required');
    }

    const response = await this.request(`/merchant/${id}`, {
      method: 'DELETE'
    });

    return response;
  }

  /**
   * Get transaction history for a merchant
   * @param {string} id - Merchant ID
   * @returns {Promise<Array<Object>>} Array of transactions
   * @example
   * const transactions = await api.getMerchantTransactions('merchant-123');
   */
  async getMerchantTransactions(id) {
    if (!id) {
      throw new Error('Merchant ID is required');
    }

    const response = await this.request(`/merchant/${id}/transactions`, {
      method: 'GET'
    });

    return response.transactions;
  }

  // ============================================================
  // PAYMENT
  // ============================================================

  /**
   * Pay a merchant with EVENT tokens
   * @param {string} walletId - Wallet identifier from session
   * @param {string} shard1 - First shard of private key (hex)
   * @param {string} merchantId - Merchant ID to pay
   * @param {number} amount - Amount to pay (0-10000)
   * @returns {Promise<{signature: string, amount: number, merchant: string, explorerUrl: string}>}
   * @example
   * const result = await api.payMerchant(walletId, shard1, 'merchant-123', 25);
   */
  async payMerchant(walletId, shard1, merchantId, amount) {
    if (!walletId || !shard1 || !merchantId) {
      throw new Error('walletId, shard1, and merchantId are required');
    }
    if (!amount || amount <= 0 || amount > 10000) {
      throw new Error('Amount must be between 0 and 10000');
    }

    const response = await this.request('/pay', {
      method: 'POST',
      body: JSON.stringify({ walletId, shard1, merchantId, amount })
    });

    return {
      success: response.success,
      signature: response.signature,
      amount: response.amount,
      merchant: response.merchant,
      explorerUrl: response.explorerUrl
    };
  }

  // ============================================================
  // EXISTING OPERATIONS (for compatibility)
  // ============================================================

  /**
   * Get SOL balance for a public key
   * @deprecated Use getTokenBalance() instead to get both SOL and token balances
   * @param {string} publicKey - Solana public key
   * @returns {Promise<{balance: number, lamports: number, network: string}>}
   */
  async getBalance(publicKey) {
    if (!publicKey || typeof publicKey !== 'string') {
      throw new Error('Valid public key is required');
    }

    const response = await this.request('/get-balance', {
      method: 'POST',
      body: JSON.stringify({ publicKey })
    });

    return {
      balance: response.balance,
      lamports: response.lamports,
      network: response.network
    };
  }

  /**
   * Request SOL airdrop on devnet
   * @param {string} publicKey - Solana public key to receive airdrop
   * @returns {Promise<{signature: string, message: string}>}
   */
  async requestAirdrop(publicKey) {
    if (!publicKey || typeof publicKey !== 'string') {
      throw new Error('Valid public key is required');
    }

    const response = await this.request('/request-airdrop', {
      method: 'POST',
      body: JSON.stringify({ publicKey })
    });

    return {
      signature: response.signature,
      message: response.message
    };
  }

  /**
   * Transfer SOL to another address
   * @param {string} walletId - Wallet identifier from session
   * @param {string} shard1 - First shard of private key (hex)
   * @param {string} toAddress - Recipient address
   * @param {number} amount - Amount to transfer (0-10000 SOL)
   * @returns {Promise<{signature: string, explorerUrl: string}>}
   */
  async transfer(walletId, shard1, toAddress, amount) {
    if (!walletId || !shard1 || !toAddress) {
      throw new Error('walletId, shard1, and toAddress are required');
    }
    if (!amount || amount <= 0 || amount > 10000) {
      throw new Error('Amount must be between 0 and 10000 SOL');
    }

    const response = await this.request('/transfer', {
      method: 'POST',
      body: JSON.stringify({ walletId, shard1, toAddress, amount })
    });

    return {
      success: response.success,
      signature: response.signature,
      explorerUrl: response.explorerUrl
    };
  }

  /**
   * Clear shard from memory (logout)
   * @param {string} walletId - Wallet identifier to clear
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async clearShard(walletId) {
    if (!walletId) {
      throw new Error('walletId is required');
    }

    const response = await this.request('/clear-shard', {
      method: 'DELETE',
      body: JSON.stringify({ walletId })
    });

    return response;
  }

  /**
   * Health check endpoint
   * @returns {Promise<{status: string, network: string, activeWallets: number, security: string}>}
   */
  async healthCheck() {
    const response = await this.request('/health', {
      method: 'GET'
    });

    return {
      status: response.status,
      network: response.network,
      activeWallets: response.activeWallets,
      security: response.security
    };
  }

  /**
   * Get security information about the architecture
   * @returns {Promise<Object>} Security configuration details
   */
  async getSecurityInfo() {
    const response = await this.request('/security-info', {
      method: 'GET'
    });

    return response;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SolanaPOCAPI;
}
