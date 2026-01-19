/**
 * Solana POC Frontend
 *
 * Key Sharding Implementation:
 * - Shard 1: Stored in browser sessionStorage
 * - Shard 2: Encrypted and stored in backend RAM
 * - Full key: Never stored, only combined temporarily for signing
 */

// Global managers
let api;
let tabManager;
let paymentManager;

// State
let currentWallet = null;
let currentWalletId = null;
let shard1 = null;

/**
 * Initialize app
 */
async function init() {
  // Initialize API service
  api = new SolanaPOCAPI();

  // Initialize managers
  tabManager = new TabManager(api);
  paymentManager = new PaymentManager(api);

  // Legacy initialization
  updateConnectionStatus();
  setupEventListeners();

  // Check for existing wallet in session
  const savedWalletId = sessionStorage.getItem('walletId');
  const savedShard1 = sessionStorage.getItem('shard1');
  const savedAddress = sessionStorage.getItem('walletAddress');

  if (savedWalletId && savedShard1 && savedAddress) {
    currentWalletId = savedWalletId;
    shard1 = savedShard1;
    currentWallet = {
      publicKey: { toBase58: () => savedAddress },
      secretKey: null // Never stored
    };
    showWalletInfo(savedAddress, savedShard1);
    enableButtons();

    // Load merchants and refresh balances
    await paymentManager.loadMerchants();
    await paymentManager.refreshBalances();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const btnGenerate = document.getElementById('btn-generate');
  const btnClear = document.getElementById('btn-clear');

  if (btnGenerate) {
    btnGenerate.addEventListener('click', generateWallet);
  }

  if (btnClear) {
    btnClear.addEventListener('click', clearAll);
  }

  // Listen for wallet amount input to update button states
  const payAmountInput = document.getElementById('pay-amount');
  if (payAmountInput) {
    payAmountInput.addEventListener('input', () => {
      if (paymentManager) paymentManager.updatePayButtonState();
    });
  }
}

/**
 * Generate new wallet with key sharding
 */
async function generateWallet() {
  try {
    showToast('Generating secure keypair...', 'info');

    // Generate keypair locally
    const keypair = solanaWeb3.Keypair.generate();
    const privateKey = keypair.secretKey;
    const publicKey = keypair.publicKey.toBase58();

    // Generate unique wallet ID
    const walletId = generateWalletId();

    // Create shards (XOR for simplicity - use Shamir's in production)
    const shard1Buffer = crypto.getRandomValues(new Uint8Array(64));
    const shard2Buffer = new Uint8Array(64);

    for (let i = 0; i < 64; i++) {
      shard2Buffer[i] = privateKey[i] ^ shard1Buffer[i];
    }

    const shard1Hex = bufferToHex(shard1Buffer);
    const shard2Hex = bufferToHex(shard2Buffer);

    // Send shard 2 to backend (encrypted over HTTPS)
    const data = await api.storeShard(walletId, shard2Hex);

    if (!data.success) {
      throw new Error(data.error || 'Failed to store shard 2');
    }

    // Store shard 1 in session storage only
    sessionStorage.setItem('walletId', walletId);
    sessionStorage.setItem('shard1', shard1Hex);
    sessionStorage.setItem('walletAddress', publicKey);

    currentWalletId = walletId;
    shard1 = shard1Hex;
    currentWallet = keypair;

    showWalletInfo(publicKey, shard1Hex);
    enableButtons();
    showToast('✓ Wallet generated with key sharding!', 'success');

  } catch (error) {
    console.error('Error generating wallet:', error);
    showToast('Failed to generate wallet: ' + error.message, 'error');
  }
}

/**
 * Show wallet information
 */
function showWalletInfo(address, shard1Hex) {
  const walletInfo = document.getElementById('wallet-info');
  if (walletInfo) {
    walletInfo.classList.remove('hidden');
    document.getElementById('wallet-address').textContent = address;
    document.getElementById('shard-1-preview').textContent =
      shard1Hex.substring(0, 16) + '...' + shard1Hex.substring(shard1Hex.length - 16);
  }

  const walletStatus = document.getElementById('wallet-status');
  if (walletStatus) {
    walletStatus.classList.remove('hidden');
  }
}

/**
 * Enable buttons that require wallet
 */
function enableButtons() {
  // Enable top-up and payment buttons via payment manager
  if (paymentManager) {
    paymentManager.setWalletReady(true);
  }
}

/**
 * Check balance
 */
async function checkBalance() {
  const address = elements.balanceAddress.value.trim();

  if (!address) {
    showToast('Please enter a wallet address', 'warning');
    return;
  }

  try {
    elements.btnCheckBalance.disabled = true;
    showToast('Checking balance...', 'info');

    const response = await fetch(`${API_BASE}/get-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: address })
    });

    const data = await response.json();

    if (data.success) {
      elements.balanceResult.classList.remove('hidden');
      document.getElementById('balance-amount').textContent =
        data.balance.toFixed(4);
      showToast(`Balance: ${data.balance.toFixed(4)} SOL`, 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error checking balance:', error);
    showToast('Failed to check balance: ' + error.message, 'error');
  } finally {
    elements.btnCheckBalance.disabled = false;
  }
}

/**
 * Request airdrop
 */
async function requestAirdrop() {
  if (!currentWallet) {
    showToast('Please generate a wallet first', 'warning');
    return;
  }

  try {
    elements.btnAirdrop.disabled = true;
    showToast('Requesting airdrop from devnet...', 'info');

    const response = await fetch(`${API_BASE}/request-airdrop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: currentWallet.publicKey.toBase58()
      })
    });

    const data = await response.json();

    if (data.success) {
      elements.airdropResult.classList.remove('hidden');
      elements.airdropResult.innerHTML = `
        <h3>✓ Airdrop Successful!</h3>
        <p>1 SOL has been sent to your wallet.</p>
        <p><a href="${data.explorerUrl || '#'}" target="_blank">View Transaction</a></p>
      `;
      showToast('✓ Airdrop successful!', 'success');

      // Auto-check balance after 2 seconds
      setTimeout(checkBalance, 2000);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    showToast('Airdrop failed: ' + error.message, 'error');
  } finally {
    elements.btnAirdrop.disabled = false;
  }
}

/**
 * Transfer SOL using sharded key
 */
async function transfer() {
  if (!currentWallet) {
    showToast('Please generate a wallet first', 'warning');
    return;
  }

  const toAddress = elements.transferTo.value.trim();
  const amount = parseFloat(elements.transferAmount.value);

  if (!toAddress) {
    showToast('Please enter recipient address', 'warning');
    return;
  }

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount', 'warning');
    return;
  }

  try {
    elements.btnTransfer.disabled = true;
    showToast('Initiating transfer with sharded key...', 'info');

    const response = await fetch(`${API_BASE}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletId: currentWalletId,
        shard1: shard1,
        toAddress,
        amount
      })
    });

    const data = await response.json();

    if (data.success) {
      elements.transferResult.classList.remove('hidden');
      elements.transferResult.innerHTML = `
        <h3>✓ Transfer Successful!</h3>
        <p>Sent ${amount} SOL to ${toAddress}</p>
        <p><a href="${data.explorerUrl}" target="_blank">View on Solana Explorer</a></p>
      `;
      showToast('✓ Transfer successful!', 'success');

      // Clear inputs
      elements.transferTo.value = '';
      elements.transferAmount.value = '';

      // Auto-check balance after 3 seconds
      setTimeout(checkBalance, 3000);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error transferring:', error);
    showToast('Transfer failed: ' + error.message, 'error');
  } finally {
    elements.btnTransfer.disabled = false;
  }
}

/**
 * Clear all data (logout)
 */
async function clearAll() {
  if (!confirm('Are you sure? This will clear your wallet from browser storage.')) {
    return;
  }

  try {
    // Clear from backend
    if (currentWalletId) {
      await api.clearShard(currentWalletId);
    }

    // Clear from browser
    sessionStorage.removeItem('walletId');
    sessionStorage.removeItem('shard1');
    sessionStorage.removeItem('walletAddress');

    currentWallet = null;
    currentWalletId = null;
    shard1 = null;

    // Hide wallet info section
    const walletInfo = document.getElementById('wallet-info');
    if (walletInfo) walletInfo.classList.add('hidden');

    // Reset balance display
    const tokenBalance = document.getElementById('token-balance');
    const solBalance = document.getElementById('sol-balance');
    if (tokenBalance) tokenBalance.textContent = '0.00';
    if (solBalance) solBalance.textContent = '0.00';

    // Hide wallet status
    const walletStatus = document.getElementById('wallet-status');
    if (walletStatus) walletStatus.classList.add('hidden');

    // Clear payment manager state if exists
    if (paymentManager) {
      paymentManager.reset();
    }

    showToast('✓ All data cleared', 'success');
  } catch (error) {
    console.error('Error clearing data:', error);
    showToast('Failed to clear data: ' + error.message, 'error');
  }
}

/**
 * Update connection status
 */
async function updateConnectionStatus() {
  try {
    const data = await api.healthCheck();
    const connectionStatus = document.getElementById('connection-status');

    if (data.status === 'healthy') {
      connectionStatus.innerHTML =
        '<span class="dot online"></span> Connected to backend (Devnet)';
    } else {
      throw new Error('Backend unhealthy');
    }
  } catch (error) {
    const connectionStatus = document.getElementById('connection-status');
    connectionStatus.innerHTML =
      '<span class="dot offline"></span> Backend disconnected';
    console.error('Backend health check failed:', error);
  }
}

/**
 * Generate unique wallet ID
 */
function generateWalletId() {
  return 'wallet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Convert buffer to hex string
 */
function bufferToHex(buffer) {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Copy to clipboard
 */
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(err => {
    showToast('Failed to copy', 'error');
  });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize on load
init();
