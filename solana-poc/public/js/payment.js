/**
 * Payment Logic Manager
 * Handles merchant selection, payment processing, and UI updates
 */

class PaymentManager {
  constructor(api) {
    this.api = api;
    this.selectedMerchant = null;
    this.merchants = [];
    this.selectedAmount = null;
    this.setupListeners();
  }

  /**
   * Set up event listeners for payment-related UI elements
   */
  setupListeners() {
    // Merchant dropdown change
    const merchantSelect = document.getElementById('pay-merchant-select');
    if (merchantSelect) {
      merchantSelect.addEventListener('change', (e) => this.onMerchantChange(e));
    }

    // Top-up amount buttons
    const amountButtons = document.querySelectorAll('.amount-btn');
    amountButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.selectTopUpAmount(e));
    });

    // Process payment button
    const payButton = document.getElementById('btn-pay');
    if (payButton) {
      payButton.addEventListener('click', () => this.processPayment());
    }

    // Top-up button
    const topUpButton = document.getElementById('btn-topup');
    if (topUpButton) {
      topUpButton.addEventListener('click', () => this.processTopUp());
    }

    // Refresh balances button
    const refreshButton = document.getElementById('btn-refresh-balances');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => this.refreshBalances());
    }

    // Pay amount input - update button state on input
    const payAmountInput = document.getElementById('pay-amount');
    if (payAmountInput) {
      payAmountInput.addEventListener('input', () => this.updatePayButtonState());
    }

    // Custom top-up amount input - clear predefined selection and enable button
    const customTopUpInput = document.getElementById('custom-amount');
    if (customTopUpInput) {
      customTopUpInput.addEventListener('input', () => {
        // Clear predefined button selection
        document.querySelectorAll('.amount-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.selectedAmount = null;
        this.updateTopUpButtonState();
      });
    }
  }

  /**
   * Load available merchants from the API
   */
  async loadMerchants() {
    try {
      const response = await this.api.getMerchants();
      this.merchants = response;

      const select = document.getElementById('pay-merchant-select');
      if (!select) return;

      // Clear existing options
      select.innerHTML = '<option value="">-- Select Merchant --</option>';

      // Add merchant options
      this.merchants.forEach(merchant => {
        const option = document.createElement('option');
        option.value = merchant.id;
        option.textContent = merchant.name;
        select.appendChild(option);
      });

      // If there's only one merchant, auto-select it
      if (this.merchants.length === 1) {
        select.value = this.merchants[0].id;
        this.onMerchantChange({ target: select });
      }
    } catch (error) {
      console.error('Failed to load merchants:', error);
      this.showError('Failed to load merchants. Please try again.');
    }
  }

  /**
   * Handle merchant selection change
   */
  onMerchantChange(event) {
    const merchantId = event.target.value;

    if (merchantId) {
      this.selectMerchantFromList(merchantId);
    } else {
      this.clearMerchantInfo();
    }
    this.updatePayButtonState();
  }

  /**
   * Select a merchant from the list
   */
  selectMerchantFromList(merchantId) {
    this.selectedMerchant = this.merchants.find(m => m.id === merchantId);
    if (this.selectedMerchant) {
      this.displayMerchantInfo(this.selectedMerchant);
    }
  }

  /**
   * Display merchant information in the UI
   */
  displayMerchantInfo(merchant) {
    // Update merchant info display
    const nameDisplay = document.getElementById('merchant-name-display');
    const descDisplay = document.getElementById('merchant-desc-display');
    const walletDisplay = document.getElementById('merchant-wallet-display');

    if (nameDisplay) nameDisplay.textContent = merchant.name;
    if (descDisplay) descDisplay.textContent = merchant.description || '-';
    if (walletDisplay) walletDisplay.textContent = this.shortenAddress(merchant.walletAddress);
  }

  /**
   * Clear merchant information display
   */
  clearMerchantInfo() {
    const nameDisplay = document.getElementById('merchant-name-display');
    const descDisplay = document.getElementById('merchant-desc-display');
    const walletDisplay = document.getElementById('merchant-wallet-display');

    if (nameDisplay) nameDisplay.textContent = '-';
    if (descDisplay) descDisplay.textContent = '-';
    if (walletDisplay) walletDisplay.textContent = '-';
    this.selectedMerchant = null;
  }

  /**
   * Select a top-up amount
   */
  selectTopUpAmount(event) {
    // Remove active class from all buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to clicked button
    event.target.classList.add('active');
    this.selectedAmount = parseInt(event.target.dataset.amount);

    // Clear custom amount input when predefined button is clicked
    const customInput = document.getElementById('custom-amount');
    if (customInput) {
      customInput.value = '';
    }

    this.updateTopUpButtonState();
  }

  /**
   * Clear the amount selection
   */
  clearAmountSelection() {
    document.querySelectorAll('.amount-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    this.selectedAmount = null;
    this.updateTopUpButtonState();
  }

  /**
   * Update the top-up button state based on selection
   */
  updateTopUpButtonState() {
    const topUpBtn = document.getElementById('btn-topup');
    const customInput = document.getElementById('custom-amount');
    const customAmount = customInput ? parseFloat(customInput.value) : 0;

    if (topUpBtn) {
      const hasAmount = this.selectedAmount || (customAmount > 0);
      topUpBtn.disabled = !hasAmount || !this.hasActiveWallet();
    }
  }

  /**
   * Update the pay button state based on selection
   */
  updatePayButtonState() {
    const payButton = document.getElementById('btn-pay');
    const customAmount = this.getCustomAmount();

    if (payButton) {
      const hasAmount = this.selectedAmount || customAmount;
      payButton.disabled = !this.selectedMerchant || !hasAmount || !this.hasActiveWallet();
    }
  }

  /**
   * Process a top-up transaction
   */
  async processTopUp() {
    // Get amount from either predefined selection or custom input
    const customInput = document.getElementById('custom-amount');
    const customAmount = customInput ? parseFloat(customInput.value) : 0;
    const amount = this.selectedAmount || customAmount;

    if (!amount || !this.hasActiveWallet()) {
      this.showError('Please select an amount and ensure your wallet is connected.');
      return;
    }

    // Retrieve wallet credentials from sessionStorage
    const walletId = sessionStorage.getItem('walletId');
    const shard1 = sessionStorage.getItem('shard1');

    if (!walletId || !shard1) {
      this.showError('Wallet credentials not found. Please generate a wallet first.');
      return;
    }

    const topUpBtn = document.getElementById('btn-topup');
    topUpBtn.disabled = true;
    topUpBtn.textContent = 'Processing...';

    try {
      const result = await this.api.topUp(walletId, shard1, amount);
      this.showTopUpResult(result);

      // Refresh balances after successful top-up
      if (result.success) {
        await this.refreshBalances();
        this.clearAmountSelection();
        // Also clear custom input
        if (customInput) customInput.value = '';
      }
    } catch (error) {
      console.error('Top-up failed:', error);
      this.showError(`Top-up failed: ${error.message}`);
    } finally {
      topUpBtn.disabled = false;
      topUpBtn.textContent = '💰 Top-Up EVENT Tokens';
    }
  }

  /**
   * Display the result of a top-up transaction
   */
  showTopUpResult(result) {
    if (result.success) {
      this.showSuccess(
        `Top-up successful! ${result.amount} tokens added to your wallet.\n` +
        `Transaction: ${result.signature}`
      );
    } else {
      this.showError(`Top-up failed: ${result.error}`);
    }
  }

  /**
   * Process a payment to the selected merchant
   */
  async processPayment() {
    if (!this.selectedMerchant || !this.hasActiveWallet()) {
      this.showError('Please select a merchant and ensure your wallet is connected.');
      return;
    }

    // Retrieve wallet credentials from sessionStorage
    const walletId = sessionStorage.getItem('walletId');
    const shard1 = sessionStorage.getItem('shard1');

    if (!walletId || !shard1) {
      this.showError('Wallet credentials not found. Please generate a wallet first.');
      return;
    }

    const amount = this.selectedAmount || this.getCustomAmount();
    if (!amount || amount <= 0) {
      this.showError('Please enter a valid amount.');
      return;
    }

    const payButton = document.getElementById('btn-pay');
    payButton.disabled = true;
    payButton.textContent = 'Processing...';

    try {
      const result = await this.api.payMerchant(walletId, shard1, this.selectedMerchant.id, amount);
      this.showPaymentResult(result);

      // Refresh balances after successful payment
      if (result.success) {
        await this.refreshBalances();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      this.showError(`Payment failed: ${error.message}`);
    } finally {
      payButton.disabled = false;
      payButton.textContent = '→ Pay Merchant';
    }
  }

  /**
   * Display the result of a payment transaction
   */
  showPaymentResult(result) {
    if (result.success) {
      this.showSuccess(
        `Payment of ${result.amount} tokens to ${this.selectedMerchant?.name || 'merchant'} successful!\n` +
        `Transaction: ${result.signature}`
      );
    } else {
      this.showError(`Payment failed: ${result.error}`);
    }
  }

  /**
   * Refresh all balances in the UI
   */
  async refreshBalances() {
    try {
      await this.api.refreshBalances();
    } catch (error) {
      console.error('Failed to refresh balances:', error);
      this.showError('Failed to refresh balances. Please try again.');
    }
  }

  /**
   * Get the custom amount from the input field
   */
  getCustomAmount() {
    const customAmountInput = document.getElementById('custom-amount');
    if (!customAmountInput) return null;

    const value = parseFloat(customAmountInput.value);
    return isNaN(value) ? null : value;
  }

  /**
   * Check if there's an active wallet connected
   */
  hasActiveWallet() {
    return this.walletReady === true;
  }

  /**
   * Shorten a wallet address for display
   */
  shortenAddress(address) {
    if (!address) return 'N/A';
    if (address.length <= 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  /**
   * Show a success message
   */
  showSuccess(message) {
    // You could implement a toast notification here
    alert(message);
  }

  /**
   * Show an error message
   */
  showError(message) {
    // You could implement a toast notification here
    alert(message);
  }

  /**
   * Set wallet ready state (called after wallet generation)
   */
  setWalletReady(ready) {
    this.walletReady = ready;
    this.updateTopUpButtonState();
    this.updatePayButtonState();
  }

  /**
   * Reset state (called on logout)
   */
  reset() {
    this.selectedMerchant = null;
    this.selectedAmount = null;
    this.clearMerchantInfo();
    this.clearAmountSelection();
    this.walletReady = false;

    // Reset balance displays
    const tokenBalance = document.getElementById('token-balance');
    const solBalance = document.getElementById('sol-balance');
    if (tokenBalance) tokenBalance.textContent = '0.00';
    if (solBalance) solBalance.textContent = '0.00';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentManager;
}
