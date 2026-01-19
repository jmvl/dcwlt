/**
 * In-memory data store for merchants, transactions, and user balances.
 * This is a simple implementation suitable for development/POC.
 * In production, you'd want to use a proper database like PostgreSQL or MongoDB.
 */

class DataStore {
  constructor() {
    // Map<merchantId, merchantData>
    this.merchants = new Map();

    // Array of transaction objects
    this.transactions = [];

    // Map<userAddress, balance>
    this.userBalances = new Map();
  }

  /**
   * Add a new merchant to the store
   * @param {Object} merchant - Merchant object with id, name, walletAddress, etc.
   * @returns {Object} The added merchant
   */
  addMerchant(merchant) {
    if (!merchant.id) {
      throw new Error('Merchant must have an id');
    }
    if (this.merchants.has(merchant.id)) {
      throw new Error(`Merchant with id ${merchant.id} already exists`);
    }
    this.merchants.set(merchant.id, {
      ...merchant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return this.merchants.get(merchant.id);
  }

  /**
   * Get a merchant by ID
   * @param {string} id - Merchant ID
   * @returns {Object|null} Merchant object or null if not found
   */
  getMerchant(id) {
    return this.merchants.get(id) || null;
  }

  /**
   * Update an existing merchant
   * @param {string} id - Merchant ID
   * @param {Object} data - Updated merchant data
   * @returns {Object|null} Updated merchant or null if not found
   */
  updateMerchant(id, data) {
    const merchant = this.merchants.get(id);
    if (!merchant) {
      return null;
    }
    const updated = {
      ...merchant,
      ...data,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };
    this.merchants.set(id, updated);
    return updated;
  }

  /**
   * Delete a merchant from the store
   * @param {string} id - Merchant ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteMerchant(id) {
    return this.merchants.delete(id);
  }

  /**
   * Get all merchants
   * @returns {Array} Array of all merchant objects
   */
  listMerchants() {
    return Array.from(this.merchants.values());
  }

  /**
   * Add a transaction to the store
   * @param {Object} tx - Transaction object
   * @returns {Object} The added transaction with generated ID and timestamp
   */
  addTransaction(tx) {
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tx,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Get all transactions for a specific merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Array} Array of transactions for the merchant
   */
  getTransactions(merchantId) {
    return this.transactions.filter(tx => tx.merchantId === merchantId);
  }

  /**
   * Update or set a user's EVENT token balance
   * @param {string} address - User's wallet address
   * @param {number} amount - New balance amount
   * @returns {number} The updated balance
   */
  updateUserBalance(address, amount) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Balance must be a non-negative number');
    }
    this.userBalances.set(address, amount);
    return amount;
  }

  /**
   * Get a user's EVENT token balance
   * @param {string} address - User's wallet address
   * @returns {number} User's balance (0 if not found)
   */
  getUserBalance(address) {
    return this.userBalances.get(address) || 0;
  }

  /**
   * Get all user balances
   * @returns {Object} Object mapping addresses to balances
   */
  getAllUserBalances() {
    return Object.fromEntries(this.userBalances);
  }

  /**
   * Clear all data from the store (useful for testing)
   */
  clear() {
    this.merchants.clear();
    this.transactions = [];
    this.userBalances.clear();
  }

  /**
   * Get store statistics
   * @returns {Object} Statistics about the stored data
   */
  getStats() {
    return {
      merchantCount: this.merchants.size,
      transactionCount: this.transactions.length,
      userCount: this.userBalances.size,
      totalBalance: Array.from(this.userBalances.values()).reduce((sum, bal) => sum + bal, 0)
    };
  }
}

// Export a singleton instance
module.exports = new DataStore();

// Also export the class for testing purposes
module.exports.DataStore = DataStore;
