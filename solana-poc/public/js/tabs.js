/**
 * Tab Navigation Manager
 * Handles tab navigation (Wallet/Merchants) and sub-tab navigation (Merchant List/Create)
 */

class TabManager {
  constructor(api) {
    this.api = api;
    this.currentTab = 'wallet';
    this.currentSubTab = 'list';
    this.merchants = [];
    this.setupMainTabs();
    this.setupSubTabs();
    this.setupModalHandlers();
  }

  /**
   * Setup main tab switching (Wallet/Merchants)
   */
  setupMainTabs() {
    const walletTab = document.getElementById('walletTab');
    const merchantsTab = document.getElementById('merchantsTab');

    if (walletTab) {
      walletTab.addEventListener('click', () => {
        this.switchMainTab('wallet');
      });
    }

    if (merchantsTab) {
      merchantsTab.addEventListener('click', () => {
        this.switchMainTab('merchants');
      });
    }
  }

  /**
   * Switch between main tabs
   */
  switchMainTab(tab) {
    this.currentTab = tab;

    // Update tab button states
    const walletTab = document.getElementById('walletTab');
    const merchantsTab = document.getElementById('merchantsTab');

    if (walletTab && merchantsTab) {
      if (tab === 'wallet') {
        walletTab.classList.add('active');
        merchantsTab.classList.remove('active');
      } else {
        merchantsTab.classList.add('active');
        walletTab.classList.remove('active');
      }
    }

    // Show/hide content sections
    const walletSection = document.getElementById('walletSection');
    const merchantsSection = document.getElementById('merchantsSection');

    if (walletSection && merchantsSection) {
      if (tab === 'wallet') {
        walletSection.classList.remove('hidden');
        merchantsSection.classList.add('hidden');
      } else {
        merchantsSection.classList.remove('hidden');
        walletSection.classList.add('hidden');
        // Load merchants when switching to merchants tab
        this.loadMerchantList();
      }
    }
  }

  /**
   * Setup sub-tab switching (Merchant List/Create)
   */
  setupSubTabs() {
    const listTab = document.getElementById('merchantListTab');
    const createTab = document.getElementById('merchantCreateTab');

    if (listTab) {
      listTab.addEventListener('click', () => {
        this.switchSubTab('list');
      });
    }

    if (createTab) {
      createTab.addEventListener('click', () => {
        this.switchSubTab('create');
      });
    }
  }

  /**
   * Switch between sub-tabs
   */
  switchSubTab(tab) {
    this.currentSubTab = tab;

    // Update sub-tab button states
    const listTab = document.getElementById('merchantListTab');
    const createTab = document.getElementById('merchantCreateTab');

    if (listTab && createTab) {
      if (tab === 'list') {
        listTab.classList.add('active');
        createTab.classList.remove('active');
      } else {
        createTab.classList.add('active');
        listTab.classList.remove('active');
      }
    }

    // Show/hide sub-content sections
    const merchantList = document.getElementById('merchantList');
    const merchantCreate = document.getElementById('merchantCreate');

    if (merchantList && merchantCreate) {
      if (tab === 'list') {
        merchantList.classList.remove('hidden');
        merchantCreate.classList.add('hidden');
      } else {
        merchantCreate.classList.remove('hidden');
        merchantList.classList.add('hidden');
      }
    }
  }

  /**
   * Setup modal open/close handlers
   */
  setupModalHandlers() {
    // Edit modal close button
    const editCloseBtn = document.getElementById('editCloseBtn');
    if (editCloseBtn) {
      editCloseBtn.addEventListener('click', () => this.closeAllModals());
    }

    // Create form submit
    const createForm = document.getElementById('createForm');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateSubmit(e));
    }

    // Edit form submit
    const editForm = document.getElementById('editForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    }

    // Delete confirmation buttons
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    if (deleteConfirmBtn) {
      deleteConfirmBtn.addEventListener('click', () => {
        const merchantId = deleteConfirmBtn.dataset.merchantId;
        if (merchantId) {
          this.deleteMerchant(merchantId);
        }
      });
    }

    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener('click', () => this.closeAllModals());
    }

    // Pay from history modal
    const historyPayBtn = document.getElementById('historyPayBtn');
    if (historyPayBtn) {
      historyPayBtn.addEventListener('click', () => {
        const merchantData = historyPayBtn.dataset.merchant;
        if (merchantData) {
          const merchant = JSON.parse(merchantData);
          this.payMerchantFromList(merchant);
          this.closeAllModals();
        }
      });
    }

    const historyCloseBtn = document.getElementById('historyCloseBtn');
    if (historyCloseBtn) {
      historyCloseBtn.addEventListener('click', () => this.closeAllModals());
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });
  }

  /**
   * Load and display merchants from API
   */
  async loadMerchantList() {
    const listContainer = document.getElementById('merchantListContainer');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = '<p class="loading">Loading merchants...</p>';

      const merchants = await this.api.getMerchants();
      this.merchants = merchants;

      if (merchants.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <p>No merchants yet. Create your first merchant to get started!</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = '';
      merchants.forEach(merchant => {
        const card = this.createMerchantCard(merchant);
        listContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading merchants:', error);
      listContainer.innerHTML = `
        <div class="error-state">
          <p>Failed to load merchants. Please try again.</p>
        </div>
      `;
    }
  }

  /**
   * Create merchant card element
   */
  createMerchantCard(merchant) {
    const card = document.createElement('div');
    card.className = 'merchant-card';
    card.dataset.merchantId = merchant.id;

    const icon = this.getMerchantIcon(merchant.name);
    const shortenedAddress = this.shortenAddress(merchant.address);

    card.innerHTML = `
      <div class="merchant-card-header">
        <div class="merchant-icon">${icon}</div>
        <div class="merchant-info">
          <h3 class="merchant-name">${this.escapeHtml(merchant.name)}</h3>
          <p class="merchant-address" title="${this.escapeHtml(merchant.address)}">${shortenedAddress}</p>
        </div>
      </div>
      <div class="merchant-card-actions">
        <button class="btn-pay" data-action="pay">Pay</button>
        <button class="btn-edit" data-action="edit">Edit</button>
        <button class="btn-history" data-action="history">History</button>
        <button class="btn-delete" data-action="delete">Delete</button>
      </div>
    `;

    this.attachCardListeners(card, merchant);
    return card;
  }

  /**
   * Attach event listeners to merchant card buttons
   */
  attachCardListeners(card, merchant) {
    const payBtn = card.querySelector('[data-action="pay"]');
    const editBtn = card.querySelector('[data-action="edit"]');
    const historyBtn = card.querySelector('[data-action="history"]');
    const deleteBtn = card.querySelector('[data-action="delete"]');

    if (payBtn) {
      payBtn.addEventListener('click', () => this.payMerchantFromList(merchant));
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => this.openEditModal(merchant));
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', () => this.openHistoryModal(merchant));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.confirmDeleteMerchant(merchant));
    }
  }

  /**
   * Open edit modal with merchant data
   */
  openEditModal(merchant) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');

    if (modal && form) {
      document.getElementById('editMerchantId').value = merchant.id;
      document.getElementById('editName').value = merchant.name;
      document.getElementById('editAddress').value = merchant.address;
      document.getElementById('editDescription').value = merchant.description || '';

      modal.classList.remove('hidden');
    }
  }

  /**
   * Open transaction history modal
   */
  openHistoryModal(merchant) {
    const modal = document.getElementById('historyModal');

    if (modal) {
      const merchantName = document.getElementById('historyMerchantName');
      const merchantAddress = document.getElementById('historyMerchantAddress');
      const historyPayBtn = document.getElementById('historyPayBtn');

      if (merchantName) merchantName.textContent = merchant.name;
      if (merchantAddress) {
        merchantAddress.textContent = this.shortenAddress(merchant.address);
        merchantAddress.title = merchant.address;
      }
      if (historyPayBtn) {
        historyPayBtn.dataset.merchant = JSON.stringify(merchant);
      }

      modal.classList.remove('hidden');

      // Load transaction history
      this.loadMerchantHistory(merchant.id);
    }
  }

  /**
   * Load transaction history for a merchant
   */
  async loadMerchantHistory(merchantId) {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return;

    try {
      historyContainer.innerHTML = '<p class="loading">Loading history...</p>';
      const transactions = await this.api.getTransactions(merchantId);

      if (transactions.length === 0) {
        historyContainer.innerHTML = `
          <div class="empty-history">
            <p>No payment history yet.</p>
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = transactions.map(tx => `
        <div class="history-item">
          <div class="history-item-header">
            <span class="history-amount">${tx.amount} SOL</span>
            <span class="history-date">${new Date(tx.timestamp).toLocaleString()}</span>
          </div>
          <div class="history-item-details">
            <span class="history-status ${tx.status}">${tx.status}</span>
            ${tx.signature ? `
              <a href="https://explorer.solana.com/tx/${tx.signature}?cluster=devnet"
                 target="_blank"
                 class="history-link">View on Explorer</a>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading history:', error);
      historyContainer.innerHTML = `
        <div class="error-state">
          <p>Failed to load history.</p>
        </div>
      `;
    }
  }

  /**
   * Show delete confirmation modal
   */
  confirmDeleteMerchant(merchant) {
    const modal = document.getElementById('deleteModal');
    const merchantName = document.getElementById('deleteMerchantName');
    const confirmBtn = document.getElementById('deleteConfirmBtn');

    if (modal && merchantName && confirmBtn) {
      merchantName.textContent = merchant.name;
      confirmBtn.dataset.merchantId = merchant.id;
      modal.classList.remove('hidden');
    }
  }

  /**
   * Delete a merchant
   */
  async deleteMerchant(merchantId) {
    try {
      await this.api.deleteMerchant(merchantId);
      this.closeAllModals();
      await this.loadMerchantList();
    } catch (error) {
      console.error('Error deleting merchant:', error);
      alert('Failed to delete merchant. Please try again.');
    }
  }

  /**
   * Pay a merchant from the list
   */
  async payMerchantFromList(merchant) {
    try {
      const amount = prompt(`Enter amount to pay ${merchant.name}:`, '0.01');
      if (amount === null) return;

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const result = await this.api.makePayment(merchant.address, amountFloat);

      if (result.success) {
        alert(`Payment of ${amountFloat} SOL to ${merchant.name} successful!`);
        await this.loadMerchantList();

        // Trigger wallet update
        window.walletManager?.updateBalance();
      } else {
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error making payment:', error);
      alert(`Payment error: ${error.message}`);
    }
  }

  /**
   * Handle edit form submission
   */
  async handleEditSubmit(event) {
    event.preventDefault();

    const merchantId = document.getElementById('editMerchantId').value;
    const name = document.getElementById('editName').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const description = document.getElementById('editDescription').value.trim();

    if (!name || !address) {
      alert('Name and address are required');
      return;
    }

    try {
      await this.api.updateMerchant(merchantId, { name, address, description });
      this.closeAllModals();
      await this.loadMerchantList();
    } catch (error) {
      console.error('Error updating merchant:', error);
      alert('Failed to update merchant. Please try again.');
    }
  }

  /**
   * Handle create form submission
   */
  async handleCreateSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('createName').value.trim();
    const address = document.getElementById('createAddress').value.trim();
    const description = document.getElementById('createDescription').value.trim();

    if (!name || !address) {
      alert('Name and address are required');
      return;
    }

    try {
      await this.api.createMerchant({ name, address, description });

      // Clear form
      document.getElementById('createForm').reset();

      // Switch to list view and reload
      this.switchSubTab('list');
      await this.loadMerchantList();
    } catch (error) {
      console.error('Error creating merchant:', error);
      alert('Failed to create merchant. Please try again.');
    }
  }

  /**
   * Close all open modals
   */
  closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
  }

  /**
   * Get emoji icon based on merchant name
   */
  getMerchantIcon(name) {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('coffee') || lowerName.includes('cafe')) return '☕';
    if (lowerName.includes('restaurant') || lowerName.includes('food')) return '🍽️';
    if (lowerName.includes('shop') || lowerName.includes('store')) return '🏪';
    if (lowerName.includes('gas') || lowerName.includes('fuel')) return '⛽';
    if (lowerName.includes('hotel')) return '🏨';
    if (lowerName.includes('parking')) return '🅿️';
    if (lowerName.includes('pharmacy') || lowerName.includes('drug')) return '💊';
    if (lowerName.includes('grocery') || lowerName.includes('market')) return '🛒';

    return '🏪'; // Default icon
  }

  /**
   * Shorten Solana address for display
   */
  shortenAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabManager;
}
