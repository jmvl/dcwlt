# Solana POC UI Update Plan

## Overview
Update the key sharding POC to demonstrate a token-based payment system with merchant management.

## Architecture Changes

### Token System
```
Previous: SOL only
New: EVENT Token (SPL Token) + SOL for gas

Pool Account (Bank)
    ├── Holds all EVENT tokens
    ├── Distributes via top-up
    └── Receives payments from merchants
```

### New Features
1. **Top-Up** - Request EVENT tokens from pool (not SOL airdrop)
2. **Pay Merchant** - Send EVENT tokens to merchant wallets
3. **Merchant Management** - CRUD interface for merchant wallets
4. **Transaction History** - Per-merchant payment history

---

## Phase 1: Backend Updates

### 1.1 SPL Token Setup

**Create EVENT Token Structure**

```javascript
// backend/tokenConfig.js
module.exports = {
  TOKEN_MINT_ADDRESS: 'EVENT_TOKEN_MINT_ADDRESS_HERE', // From spl-token create-token
  TOKEN_DECIMALS: 9,
  POOL_WALLET_KEYPAIR: require('./pool-wallet.json'), // Bank wallet
  POOL_PUBLIC_KEY: 'POOL_WALLET_PUBLIC_KEY_HERE'
};
```

**New Endpoints Required:**

```javascript
// POST /api/setup-token
// Initialize EVENT token mint and pool account
// - Create SPL token mint
// - Create pool account
// - Mint initial supply to pool
// - Return: { mintAddress, poolAddress, totalSupply }

// POST /api/topup
// Transfer EVENT tokens from pool to user
// - { walletAddress, amount }
// - Uses pool keypair to sign transfer
// - Returns: { signature, amount, explorerUrl }

// POST /api/merchant/create
// Create new merchant wallet
// - { name, description }
// - Generates new keypair
// - Airdrops SOL for gas
// - Returns: { merchantId, publicKey, name }

// GET /api/merchant/list
// Get all merchants
// - Returns: [{ merchantId, name, publicKey, balance, createdAt }]

// PUT /api/merchant/:id
// Update merchant details
// - { name, description }
// - Returns: updated merchant

// DELETE /api/merchant/:id
// Delete merchant
// - Returns: { success, message }

// GET /api/merchant/:id/transactions
// Get transaction history for merchant
// - Returns: [{ timestamp, from, amount, signature }]

// POST /api/pay
// Pay merchant
// - { merchantId, amount, userWalletId, userShard1 }
// - Transfers EVENT tokens from user to merchant
// - Returns: { signature, amount, merchant, explorerUrl }
```

### 1.2 Seed 10 Merchants

**File: `backend/seed-merchants.js`**

```javascript
const MERCHANTS = [
  { id: 'm1', name: 'Coffee Shop #1', description: 'Downtown location' },
  { id: 'm2', name: 'Coffee Shop #2', description: 'Uptown location' },
  { id: 'm3', name: 'Book Store', description: 'Main Street' },
  { id: 'm4', name: 'Electronics Store', description: 'Mall location' },
  { id: 'm5', name: 'Restaurant', description: 'Fine dining' },
  { id: 'm6', name: 'Gas Station', description: 'Highway exit 5' },
  { id: 'm7', name: 'Grocery Store', description: 'Organic foods' },
  { id: 'm8', name: 'Pharmacy', description: '24/7 open' },
  { id: 'm9', name: 'Gym', description: 'Fitness center' },
  { id: 'm10', name: 'Movie Theater', description: 'Cinema complex' }
];

// Generate keypairs for each merchant
// Store in backend/data/merchants.json
// Each merchant gets:
// - Keypair (private key)
// - Public key
// - Initial 0 EVENT tokens
// - 0.1 SOL for gas fees
```

### 1.3 Transaction Tracking

**File: `backend/data/transactions.json`**

```json
{
  "transactions": [
    {
      "id": "tx_1234567890",
      "type": "TOPUP",
      "from": "POOL",
      "to": "USER_WALLET_ADDRESS",
      "amount": 50,
      "timestamp": "2024-01-15T12:00:00Z",
      "signature": "SIGNATURE_HERE"
    },
    {
      "id": "tx_1234567891",
      "type": "PAYMENT",
      "from": "USER_WALLET_ADDRESS",
      "to": "MERCHANT_PUBLIC_KEY",
      "amount": 5,
      "merchantId": "m1",
      "merchantName": "Coffee Shop #1",
      "timestamp": "2024-01-15T12:05:00Z",
      "signature": "SIGNATURE_HERE"
    }
  ]
}
```

### 1.4 Database/Storage

**In-Memory Storage (for POC):**

```javascript
// backend/store.js
class DataStore {
  constructor() {
    this.merchants = new Map(); // merchantId -> merchant data
    this.transactions = new Map(); // transactionId -> transaction
    this.userBalances = new Map(); // walletAddress -> balance
  }

  addMerchant(merchant) { /* ... */ }
  getMerchant(id) { /* ... */ }
  updateMerchant(id, data) { /* ... */ }
  deleteMerchant(id) { /* ... */ }
  listMerchants() { /* ... */ }

  addTransaction(tx) { /* ... */ }
  getTransactions(merchantId) { /* ... */ }

  updateUserBalance(address, amount) { /* ... */ }
  getUserBalance(address) { /* ... */ }
}
```

---

## Phase 2: Frontend Updates

### 2.1 New Navigation Structure

**Replace single-page layout with Tab Navigation:**

```html
<!-- public/index.html -->
<div class="tab-navigation">
  <button class="tab-btn active" data-tab="wallet">
    💼 Wallet
  </button>
  <button class="tab-btn" data-tab="merchants">
    🏪 Merchants
  </button>
</div>

<div class="tab-content">
  <!-- Wallet Tab -->
  <div id="tab-wallet" class="tab-pane active">
    <!-- Current wallet operations -->
  </div>

  <!-- Merchants Tab -->
  <div id="tab-merchants" class="tab-pane">
    <!-- Merchant CRUD + History -->
  </div>
</div>
```

### 2.2 Wallet Tab Updates

**Section 1: Wallet Info** (unchanged)
- Generate/Import wallet
- Show address and sharding info

**Section 2: Token Balance** (updated)
```html
<section class="card">
  <h2>Token Balance</h2>
  <div class="balance-display">
    <div class="balance-item">
      <span class="label">EVENT Tokens</span>
      <span id="token-balance" class="amount">0.00</span>
    </div>
    <div class="balance-item">
      <span class="label">SOL (Gas)</span>
      <span id="sol-balance" class="amount">0.00</span>
    </div>
  </div>
  <button id="btn-refresh-balances">🔄 Refresh Balances</button>
</section>
```

**Section 3: Top-Up** (replaces Airdrop)
```html
<section class="card">
  <h2>Top-Up EVENT Tokens</h2>
  <p class="hint">
    Get EVENT tokens from the pool account.
    SOL is used only for gas fees.
  </p>

  <div class="topup-options">
    <label>Select Amount:</label>
    <div class="amount-buttons">
      <button class="amount-btn" data-amount="10">10</button>
      <button class="amount-btn" data-amount="25">25</button>
      <button class="amount-btn" data-amount="50">50</button>
      <button class="amount-btn" data-amount="100">100</button>
    </div>

    <div class="custom-amount">
      <input type="number" id="custom-amount" placeholder="Custom amount" min="1" max="10000">
    </div>

    <button id="btn-topup" class="btn btn-success" disabled>
      <span class="icon">💰</span> Top-Up EVENT Tokens
    </button>
  </div>

  <div id="topup-result" class="result-box hidden"></div>
</section>
```

**Section 4: Pay Merchant** (replaces Transfer)
```html
<section class="card">
  <h2>Pay Merchant</h2>
  <p class="hint">
    Pay merchants with EVENT tokens. Select from available merchants below.
  </p>

  <div class="merchant-selector">
    <label>Choose Merchant:</label>
    <select id="pay-merchant-select" class="merchant-dropdown">
      <option value="">-- Select Merchant --</option>
      <!-- Populated dynamically -->
    </select>
  </div>

  <div class="merchant-info" id="selected-merchant-info">
    <div class="info-row">
      <span class="label">Name:</span>
      <span id="merchant-name-display">-</span>
    </div>
    <div class="info-row">
      <span class="label">Description:</span>
      <span id="merchant-desc-display">-</span>
    </div>
    <div class="info-row">
      <span class="label">Wallet:</span>
      <span id="merchant-wallet-display" class="wallet-truncate">-</span>
    </div>
  </div>

  <div class="payment-inputs">
    <div class="input-group">
      <label>Amount to Pay:</label>
      <input type="number" id="pay-amount" placeholder="0.00" step="0.01" min="0.01">
      <span class="currency">EVENT</span>
    </div>

    <button id="btn-pay" class="btn btn-primary" disabled>
      <span class="icon">→</span> Pay Merchant
    </button>
  </div>

  <div id="pay-result" class="result-box hidden"></div>
</section>
```

### 2.3 Merchants Tab (NEW)

**Sub-Tab Navigation:**
```html
<div id="tab-merchants" class="tab-pane">
  <div class="sub-tabs">
    <button class="sub-tab-btn active" data-subtab="list">
      📋 Merchant List
    </button>
    <button class="sub-tab-btn" data-subtab="create">
      ➕ Add Merchant
    </button>
  </div>

  <!-- Sub-tab: Merchant List -->
  <div id="subtab-list" class="sub-tab-pane active">
    <section class="card">
      <h2>All Merchants</h2>
      <div id="merchant-list" class="merchant-grid">
        <!-- Merchant cards populated here -->
      </div>
    </section>
  </div>

  <!-- Sub-tab: Create Merchant -->
  <div id="subtab-create" class="sub-tab-pane">
    <section class="card">
      <h2>Add New Merchant</h2>
      <form id="create-merchant-form">
        <div class="field">
          <label>Merchant Name *</label>
          <input type="text" name="name" required placeholder="e.g., Coffee Shop">
        </div>

        <div class="field">
          <label>Description</label>
          <textarea name="description" rows="3" placeholder="Location, hours, etc."></textarea>
        </div>

        <button type="submit" class="btn btn-success">
          <span class="icon">➕</span> Create Merchant
        </button>
      </form>
    </section>
  </div>
</div>
```

**Merchant List Card Template:**
```html
<div class="merchant-card">
  <div class="merchant-header">
    <h3>☕ Coffee Shop #1</h3>
    <div class="merchant-actions">
      <button class="icon-btn" data-action="edit" title="Edit">✏️</button>
      <button class="icon-btn" data-action="history" title="History">📊</button>
      <button class="icon-btn" data-action="delete" title="Delete">🗑️</button>
    </div>
  </div>

  <div class="merchant-body">
    <div class="info-row">
      <span class="label">Address:</span>
      <code class="wallet-short">7xKX...gAsU</code>
    </div>
    <div class="info-row">
      <span class="label">Location:</span>
      <span>Downtown location</span>
    </div>
    <div class="info-row">
      <span class="label">Balance:</span>
      <span class="balance">0.00 EVENT</span>
    </div>
    <div class="info-row">
      <span class="label">Created:</span>
      <span>Jan 15, 2024</span>
    </div>
  </div>

  <div class="merchant-footer">
    <button class="btn-pay-merchant" data-merchant-id="m1">
      💳 Pay This Merchant
    </button>
  </div>
</div>
```

### 2.4 Transaction History Modal

```html
<div id="history-modal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Transaction History</h2>
      <button class="close-modal">×</button>
    </div>

    <div class="modal-body">
      <div class="merchant-summary">
        <h3 id="history-merchant-name">Coffee Shop #1</h3>
        <div class="summary-stats">
          <div class="stat">
            <span class="label">Total Payments:</span>
            <span id="total-payments" class="value">0</span>
          </div>
          <div class="stat">
            <span class="label">Total Received:</span>
            <span id="total-received" class="value">0 EVENT</span>
          </div>
        </div>
      </div>

      <div class="transaction-list">
        <table class="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>Amount</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody id="tx-table-body">
            <!-- Transactions loaded here -->
          </tbody>
        </table>

        <div id="no-transactions" class="empty-state hidden">
          <p>No transactions yet</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2.5 Edit Merchant Modal

```html
<div id="edit-modal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Edit Merchant</h2>
      <button class="close-modal">×</button>
    </div>

    <div class="modal-body">
      <form id="edit-merchant-form">
        <input type="hidden" name="merchantId">

        <div class="field">
          <label>Merchant Name *</label>
          <input type="text" name="name" required>
        </div>

        <div class="field">
          <label>Description</label>
          <textarea name="description" rows="3"></textarea>
        </div>

        <div class="wallet-display">
          <label>Wallet Address:</label>
          <code id="edit-wallet-address">...</code>
          <small>Cannot be changed</small>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary close-modal-btn">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
```

---

## Phase 3: CSS Updates

### 3.1 Tab Navigation Styles

```css
/* public/css/style.css - Additions */

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: var(--card-bg);
  padding: 10px;
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: rgba(153, 69, 255, 0.1);
}

/* Tab Panes */
.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

/* Sub-tabs for Merchants */
.sub-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.sub-tab-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text-muted);
  border-radius: 8px;
  cursor: pointer;
}

.sub-tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Balance Display */
.balance-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.balance-item {
  background: var(--code-bg);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.balance-item .label {
  display: block;
  color: var(--text-muted);
  margin-bottom: 10px;
}

/* Top-up Amount Buttons */
.amount-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.amount-btn {
  padding: 15px;
  border: 2px solid var(--border);
  background: var(--code-bg);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.amount-btn:hover {
  border-color: var(--success);
  background: rgba(20, 241, 149, 0.1);
}

.amount-btn.selected {
  border-color: var(--success);
  background: var(--success);
  color: var(--bg);
}

/* Merchant Grid */
.merchant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.merchant-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.merchant-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
}

.merchant-header {
  padding: 15px;
  background: rgba(153, 69, 255, 0.1);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.merchant-actions {
  display: flex;
  gap: 5px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  opacity: 0.7;
}

.icon-btn:hover {
  opacity: 1;
}

.merchant-body {
  padding: 15px;
}

.merchant-body .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.wallet-short {
  font-family: monospace;
  color: var(--info);
}

.merchant-footer {
  padding: 15px;
  border-top: 1px solid var(--border);
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-modal {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-muted);
}

/* Transaction Table */
.tx-table {
  width: 100%;
  border-collapse: collapse;
}

.tx-table th {
  background: var(--code-bg);
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid var(--border);
}

.tx-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

/* Dropdown Styles */
.merchant-dropdown {
  width: 100%;
  padding: 12px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 1rem;
}
```

---

## Phase 4: JavaScript Updates

### 4.1 New API Service

```javascript
// public/js/api.js
class SolanaPOCAPI {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
  }

  // Token Operations
  async getTokenBalance(address) {
    const res = await fetch(`${this.baseURL}/token-balance`, {
      method: 'POST',
      body: JSON.stringify({ address })
    });
    return res.json();
  }

  async topUp(walletId, shard1, amount) {
    const res = await fetch(`${this.baseURL}/topup`, {
      method: 'POST',
      body: JSON.stringify({ walletId, shard1, amount })
    });
    return res.json();
  }

  // Merchant Operations
  async getMerchants() {
    const res = await fetch(`${this.baseURL}/merchant/list`);
    return res.json();
  }

  async createMerchant(name, description) {
    const res = await fetch(`${this.baseURL}/merchant/create`, {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    return res.json();
  }

  async updateMerchant(id, name, description) {
    const res = await fetch(`${this.baseURL}/merchant/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
    return res.json();
  }

  async deleteMerchant(id) {
    const res = await fetch(`${this.baseURL}/merchant/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }

  async getMerchantTransactions(id) {
    const res = await fetch(`${this.baseURL}/merchant/${id}/transactions`);
    return res.json();
  }

  // Payment
  async payMerchant(walletId, shard1, merchantId, amount) {
    const res = await fetch(`${this.baseURL}/pay`, {
      method: 'POST',
      body: JSON.stringify({ walletId, shard1, merchantId, amount })
    });
    return res.json();
  }
}
```

### 4.2 Tab Navigation Logic

```javascript
// public/js/tabs.js
class TabManager {
  constructor() {
    this.setupMainTabs();
    this.setupSubTabs();
  }

  setupMainTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update buttons
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panes
        panes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `tab-${targetTab}`) {
            pane.classList.add('active');
          }
        });

        // Load data for tab
        if (targetTab === 'merchants') {
          this.loadMerchantList();
        }
      });
    });
  }

  setupSubTabs() {
    const subTabs = document.querySelectorAll('.sub-tab-btn');
    const subPanes = document.querySelectorAll('.sub-tab-pane');

    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetSubTab = tab.dataset.subtab;

        subTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        subPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `subtab-${targetSubTab}`) {
            pane.classList.add('active');
          }
        });
      });
    });
  }

  async loadMerchantList() {
    // TODO: Load merchants from API
  }
}
```

### 4.3 Payment Logic

```javascript
// public/js/payment.js
class PaymentManager {
  constructor(api) {
    this.api = api;
    this.selectedMerchant = null;
    this.setupListeners();
  }

  setupListeners() {
    // Merchant dropdown change
    document.getElementById('pay-merchant-select')
      .addEventListener('change', (e) => this.onMerchantChange(e));

    // Pay button
    document.getElementById('btn-pay')
      .addEventListener('click', () => this.processPayment());
  }

  async loadMerchants() {
    const data = await this.api.getMerchants();
    const select = document.getElementById('pay-merchant-select');

    select.innerHTML = '<option value="">-- Select Merchant --</option>';

    data.merchants.forEach(merchant => {
      const option = document.createElement('option');
      option.value = merchant.id;
      option.textContent = `${merchant.name} (${merchant.description})`;
      select.appendChild(option);
    });
  }

  onMerchantChange(e) {
    const merchantId = e.target.value;
    const merchant = this.merchants.find(m => m.id === merchantId);

    if (merchant) {
      this.selectedMerchant = merchant;
      this.displayMerchantInfo(merchant);
    }
  }

  displayMerchantInfo(merchant) {
    document.getElementById('merchant-name-display').textContent = merchant.name;
    document.getElementById('merchant-desc-display').textContent = merchant.description;
    document.getElementById('merchant-wallet-display').textContent =
      merchant.publicKey.substring(0, 8) + '...' + merchant.publicKey.substring(merchant.publicKey.length - 8);
  }

  async processPayment() {
    if (!this.selectedMerchant) {
      showToast('Please select a merchant', 'warning');
      return;
    }

    const amount = parseFloat(document.getElementById('pay-amount').value);

    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    // Get user wallet info
    const walletId = sessionStorage.getItem('walletId');
    const shard1 = sessionStorage.getItem('shard1');

    if (!walletId || !shard1) {
      showToast('Please generate a wallet first', 'warning');
      return;
    }

    try {
      showToast('Processing payment...', 'info');

      const result = await this.api.payMerchant(
        walletId,
        shard1,
        this.selectedMerchant.id,
        amount
      );

      if (result.success) {
        showPaymentResult(result);
        await this.refreshBalances();
      } else {
        showToast('Payment failed: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('Payment error: ' + error.message, 'error');
    }
  }
}
```

---

## Phase 5: One-Time Setup

### 5.1 Token Creation Script

**File: `backend/setup-token.js`**

```javascript
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');

async function setupToken() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // 1. Create pool wallet keypair
  const poolWallet = Keypair.generate();

  console.log('Pool Wallet Address:', poolWallet.publicKey.toBase58());
  console.log('Save this private key securely!');

  // 2. Request airdrop for pool wallet (for SOL gas)
  console.log('Requesting SOL airdrop for pool...');
  await connection.requestAirdrop(poolWallet.publicKey, 2 * LAMPORTS_PER_SOL);
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Create EVENT token mint
  console.log('Creating EVENT token mint...');
  const mint = await createMint(
    connection,
    poolWallet,      // Payer
    poolWallet.publicKey, // Mint authority
    9,               // Decimals
    undefined,       // Freeze authority (none)
    TOKEN_PROGRAM_ID
  );

  console.log('Token Mint Address:', mint.toBase58());

  // 4. Create token account for pool
  console.log('Creating token account for pool...');
  const poolTokenAccount = await createAccount(
    connection,
    poolWallet,
    mint,
    TOKEN_PROGRAM_ID
  );

  console.log('Pool Token Account:', poolTokenAccount.toBase58());

  // 5. Mint initial supply (1,000,000 tokens)
  console.log('Minting initial supply...');
  const initialSupply = 1_000_000 * 1e9; // 1 million tokens
  await mintTo(
    connection,
    poolWallet,
    mint,
    poolTokenAccount,
    poolWallet, // Mint authority
    initialSupply,
    [],
    TOKEN_PROGRAM_ID
  );

  console.log('✓ Setup complete!');
  console.log('Save these values to .env:');
  console.log(`TOKEN_MINT=${mint.toBase58()}`);
  console.log(`POOL_TOKEN_ACCOUNT=${poolTokenAccount.toBase58()}`);
  console.log(`POOL_WALLET_SECRET_KEY=${Buffer.from(poolWallet.secretKey).toString('hex')}`);
}

setupToken().catch(console.error);
```

**Run with:**
```bash
cd backend
node setup-token.js
```

### 5.2 Merchant Seed Script

**File: `backend/seed-merchants.js`**

```javascript
const { Keypair, Connection, LAMPORTS_PER_SOC } = require('@solana/web3.js');

const MERCHANTS = [
  { id: 'm1', name: 'Coffee Shop #1', description: 'Downtown location' },
  { id: 'm2', name: 'Coffee Shop #2', description: 'Uptown location' },
  { id: 'm3', name: 'Book Store', description: 'Main Street' },
  { id: 'm4', name: 'Electronics Store', description: 'Mall location' },
  { id: 'm5', name: 'Restaurant', description: 'Fine dining' },
  { id: 'm6', name: 'Gas Station', description: 'Highway exit 5' },
  { id: 'm7', name: 'Grocery Store', description: 'Organic foods' },
  { id: 'm8', name: 'Pharmacy', description: '24/7 open' },
  { id: 'm9', name: 'Gym', description: 'Fitness center' },
  { id: 'm10', name: 'Movie Theater', description: 'Cinema complex' }
];

async function seedMerchants() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const merchants = [];

  for (const merchant of MERCHANTS) {
    // Generate keypair
    const keypair = Keypair.generate();

    // Request airdrop for gas
    console.log(`Creating ${merchant.name}...`);
    await connection.requestAirdrop(keypair.publicKey, 0.1 * LAMPORTS_PER_SOC);
    await new Promise(resolve => setTimeout(resolve, 2000));

    merchants.push({
      id: merchant.id,
      name: merchant.name,
      description: merchant.description,
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Buffer.from(keypair.secretKey).toString('hex'),
      createdAt: new Date().toISOString()
    });

    console.log(`✓ ${merchant.name}: ${keypair.publicKey.toBase58()}`);
  }

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'backend/data/merchants.json',
    JSON.stringify({ merchants }, null, 2)
  );

  console.log('✓ Merchants seeded to backend/data/merchants.json');
}

seedMerchants().catch(console.error);
```

**Run with:**
```bash
cd backend
npm install @solana/spl-token
node seed-merchants.js
```

---

## Phase 6: Implementation Order

### Week 1: Backend Foundation
- [ ] Day 1: Token setup (setup-token.js)
- [ ] Day 2: Merchant seeding (seed-merchants.js)
- [ ] Day 3: New API endpoints (topup, pay, merchant CRUD)
- [ ] Day 4: Transaction tracking
- [ ] Day 5: Testing backend endpoints

### Week 2: Frontend Foundation
- [ ] Day 1: Tab navigation (Wallet, Merchants)
- [ ] Day 2: Wallet tab updates (topup, pay)
- [ ] Day 3: Merchants tab (list, create)
- [ ] Day 4: Modals (edit, history)
- [ ] Day 5: CSS styling

### Week 3: Integration & Polish
- [ ] Day 1: Connect frontend to new APIs
- [ ] Day 2: Token balance display
- [ ] Day 3: Payment flow testing
- [ ] Day 4: Transaction history
- [ ] Day 5: Bug fixes and refinement

---

## File Changes Summary

### New Files
```
backend/
  ├── setup-token.js          # One-time token creation
  ├── seed-merchants.js        # Generate 10 merchants
  ├── data/
  │   ├── merchants.json       # Merchant data store
  │   └── transactions.json   # Transaction history
  └── store.js                # In-memory data store

public/
  ├── js/
  │   ├── api.js              # API service layer
  │   ├── tabs.js             # Tab navigation
  │   └── payment.js          # Payment logic
  └── css/
      └── tabs.css            # Additional tab styles (merge into style.css)
```

### Modified Files
```
public/
  ├── index.html              # Add tabs, remove security section
  └── js/app.js               # Remove security, add payment logic

backend/
  └── server.js               # Add new endpoints, update imports
```

---

## Success Criteria

**Phase 1 Complete When:**
- [x] EVENT token created on Devnet
- [x] Pool wallet funded with initial supply
- [x] 10 merchant wallets generated
- [x] All API endpoints responding

**Phase 2 Complete When:**
- [x] Users can top-up EVENT tokens
- [x] Users can select merchant from dropdown
- [x] Payment transfers tokens to merchant
- [x] Transaction recorded in history

**Phase 3 Complete When:**
- [x] Merchants tab functional
- [x] Can add/edit/delete merchants
- [x] Per-merchant transaction history
- [x] All features working end-to-end

---

## Notes

1. **Gas Fees**: SOL is only used for gas, not for payments
2. **Pool Account**: Holds all EVENT tokens, distributes via top-up
3. **Token Mint**: Create once, save address to .env
4. **Merchant Wallets**: Pre-generated, each gets 0.1 SOL for gas
5. **No Persistence**: All data lost on server restart (POC limitation)

Would you like me to start implementing any specific phase of this plan?
