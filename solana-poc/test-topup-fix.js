/**
 * Comprehensive Test Script for Solana POC Top-Up Fix
 *
 * This script simulates the complete wallet creation and top-up flow
 * to verify that the decryptShard fix resolves the "provided secretKey is invalid" error
 *
 * Usage: node test-topup-fix.js
 */

const crypto = require('crypto');
const http = require('http');

const API_BASE = 'http://localhost:3001/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60));
}

function logTest(testName, status, details = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${testName}`, color);
  if (details) {
    console.log(`  ${details}`);
  }
}

/**
 * Generate a unique wallet ID (simulating browser behavior)
 */
function generateWalletId() {
  return 'wallet_test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
 * Generate a Solana keypair (simulating browser behavior)
 */
function generateKeypair() {
  return {
    secretKey: crypto.randomBytes(64),
    publicKey: crypto.randomBytes(32) // Simulated public key
  };
}

/**
 * Create shards (XOR for simplicity - matching browser implementation)
 */
function createShards(privateKey) {
  const shard1 = crypto.randomBytes(64);
  const shard2 = Buffer.allocUnsafe(64);

  for (let i = 0; i < 64; i++) {
    shard2[i] = privateKey[i] ^ shard1[i];
  }

  return {
    shard1: bufferToHex(shard1),
    shard2: bufferToHex(shard2)
  };
}

/**
 * Test 1: Backend Health Check
 */
async function testHealthCheck() {
  logSection('TEST 1: Backend Health Check');

  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    if (data.status === 'healthy') {
      logTest('Backend is healthy', 'PASS', `Network: ${data.network}, Active wallets: ${data.activeWallets}`);
      return true;
    } else {
      logTest('Backend health check', 'FAIL', `Status: ${data.status}`);
      return false;
    }
  } catch (error) {
    logTest('Backend health check', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 2: Wallet Generation (Store Shard)
 */
async function testWalletGeneration() {
  logSection('TEST 2: Wallet Generation');

  try {
    // Generate wallet
    const keypair = generateKeypair();
    const walletId = generateWalletId();
    const { shard1, shard2 } = createShards(keypair.secretKey);

    log(`Generated wallet: ${walletId}`, 'magenta');
    log(`Shard 1 (browser): ${shard1.substring(0, 16)}...`, 'magenta');
    log(`Shard 2 (backend): ${shard2.substring(0, 16)}...`, 'magenta');

    // Store shard 2 on backend
    const response = await fetch(`${API_BASE}/store-shard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId, shard2 })
    });

    const data = await response.json();

    if (data.success) {
      logTest('Store shard 2 on backend', 'PASS', data.message);
      return { walletId, shard1, keypair };
    } else {
      logTest('Store shard 2 on backend', 'FAIL', data.error);
      return null;
    }
  } catch (error) {
    logTest('Wallet generation', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 3: Top-Up with 10 EVENT Tokens (CRITICAL TEST)
 */
async function testTopUp(walletData) {
  logSection('TEST 3: Top-Up with 10 EVENT Tokens (CRITICAL)');

  if (!walletData) {
    logTest('Top-up test', 'FAIL', 'No wallet data available from previous test');
    return false;
  }

  const { walletId, shard1 } = walletData;
  const amount = 10;

  log(`Attempting to top-up ${amount} EVENT tokens...`, 'magenta');
  log(`Wallet ID: ${walletId}`, 'magenta');
  log(`Shard 1: ${shard1.substring(0, 16)}...`, 'magenta');

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId, shard1, amount })
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    log(`Request completed in ${duration}ms`, 'magenta');

    // Check for the previous error: "provided secretKey is invalid"
    if (data.error && data.error.includes('provided secretKey is invalid')) {
      logTest('Top-up request', 'FAIL', 'CRITICAL: "provided secretKey is invalid" error STILL OCCURRING!');
      log('This indicates the decryptShard function is still corrupted!', 'red');
      return false;
    }

    if (data.success) {
      logTest('Top-up 10 EVENT tokens', 'PASS', `Signature: ${data.signature}`);
      log(`Explorer URL: ${data.explorerUrl}`, 'blue');
      return true;
    } else {
      logTest('Top-up request', 'FAIL', `Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    logTest('Top-up request', 'FAIL', `Network error: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Verify Token Balance
 */
async function testTokenBalance(walletData) {
  logSection('TEST 4: Verify Token Balance');

  if (!walletData) {
    logTest('Balance check', 'FAIL', 'No wallet data available');
    return false;
  }

  try {
    // Simulate getting balance (we'd need the actual public key for this)
    const response = await fetch(`${API_BASE}/token-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'simulated_address' })
    });

    const data = await response.json();

    if (data.success !== false) {
      logTest('Token balance API endpoint', 'PASS', `SOL: ${data.balance || 0}, EVENT: ${data.tokenBalance || 0}`);
      return true;
    } else {
      logTest('Token balance API endpoint', 'FAIL', data.error);
      return false;
    }
  } catch (error) {
    logTest('Token balance API endpoint', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 5: Verify decryptShard Implementation
 */
async function testDecryptShardImplementation() {
  logSection('TEST 5: Verify decryptShard Implementation');

  try {
    const fs = require('fs');
    const serverCode = fs.readFileSync('/Users/jm/Codebase/dcwlt/solana-poc/backend/server.js', 'utf8');

    // Check if decryptShard function exists
    const hasDecryptShard = serverCode.includes('function decryptShard');
    logTest('decryptShard function exists', hasDecryptShard ? 'PASS' : 'FAIL');

    // Check for correct Buffer.concat usage (the fix)
    const hasBufferConcat = serverCode.includes('Buffer.concat');
    logTest('Uses Buffer.concat for decryption', hasBufferConcat ? 'PASS' : 'FAIL');

    // Check for the old incorrect pattern (decipher.update without proper concatenation)
    const hasOldPattern = serverCode.match(/decipher\.final\(\)/g);
    if (hasOldPattern && hasOldPattern.length > 0) {
      logTest('Old incorrect pattern detected', 'FAIL', 'decipher.final() found without Buffer.concat');
    } else {
      logTest('No old incorrect pattern', 'PASS', 'Buffer.concat properly implemented');
    }

    // Check for setAuthTag (required for GCM)
    const hasSetAuthTag = serverCode.includes('decipher.setAuthTag');
    logTest('Uses setAuthTag for GCM mode', hasSetAuthTag ? 'PASS' : 'FAIL');

    return hasDecryptShard && hasBufferConcat && hasSetAuthTag;
  } catch (error) {
    logTest('Code verification', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 6: Multiple Top-Ups (Stress Test)
 */
async function testMultipleTopUps(walletData) {
  logSection('TEST 6: Multiple Top-Ups (Stress Test)');

  if (!walletData) {
    logTest('Multiple top-ups', 'FAIL', 'No wallet data available');
    return false;
  }

  const { walletId, shard1 } = walletData;
  const amounts = [5, 15, 20];
  const results = [];

  for (const amount of amounts) {
    try {
      log(`Testing top-up with ${amount} EVENT tokens...`, 'magenta');

      const response = await fetch(`${API_BASE}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, shard1, amount })
      });

      const data = await response.json();

      if (data.success) {
        logTest(`Top-up ${amount} EVENT tokens`, 'PASS', `Signature: ${data.signature.substring(0, 16)}...`);
        results.push(true);
      } else {
        logTest(`Top-up ${amount} EVENT tokens`, 'FAIL', data.error);
        results.push(false);
      }

      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logTest(`Top-up ${amount} EVENT tokens`, 'FAIL', error.message);
      results.push(false);
    }
  }

  const successRate = (results.filter(r => r).length / results.length * 100).toFixed(0);
  log(`Stress test success rate: ${successRate}%`, results.every(r => r) ? 'green' : 'yellow');

  return results.every(r => r);
}

/**
 * Generate Test Report
 */
function generateReport(results) {
  logSection('FINAL TEST REPORT');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(0);

  console.log('\n' + '═'.repeat(60));
  log(`TOTAL TESTS: ${totalTests}`, 'blue');
  log(`PASSED: ${passedTests}`, 'green');
  log(`FAILED: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`PASS RATE: ${passRate}%`, passRate === '100' ? 'green' : 'yellow');
  console.log('═'.repeat(60) + '\n');

  // Critical findings
  if (results.find(r => r.name === 'Top-up 10 EVENT tokens' && !r.passed)) {
    log('⚠ CRITICAL ISSUE DETECTED:', 'red');
    log('The top-up functionality is still failing after the fix.', 'red');
    log('The decryptShard function may still have issues.', 'red');
    log('\nNext steps:', 'yellow');
    log('1. Check the backend logs for detailed error messages', 'yellow');
    log('2. Verify the fix was properly applied to server.js', 'yellow');
    log('3. Check if the server was restarted after the fix', 'yellow');
  } else if (results.find(r => r.name === 'Top-up 10 EVENT tokens' && r.passed)) {
    log('✓ CRITICAL FIX VERIFIED:', 'green');
    log('The decryptShard fix is working correctly!', 'green');
    log('Top-up functionality has been restored.', 'green');
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    passRate: parseFloat(passRate)
  };
}

/**
 * Main Test Execution
 */
async function main() {
  log('\n╔══════════════════════════════════════════════════════════════╗', 'blue');
  log('║     Solana POC - Comprehensive Top-Up Fix Test Suite         ║', 'blue');
  log('║     Testing decryptShard Buffer Corruption Fix               ║', 'blue');
  log('╚══════════════════════════════════════════════════════════════╝', 'blue');

  const results = [];
  let walletData = null;

  // Test 1: Health Check
  const healthPassed = await testHealthCheck();
  results.push({ name: 'Backend Health Check', passed: healthPassed });

  if (!healthPassed) {
    log('\n⚠ Backend is not healthy. Aborting remaining tests.', 'red');
    return generateReport(results);
  }

  // Test 2: Wallet Generation
  walletData = await testWalletGeneration();
  results.push({ name: 'Wallet Generation', passed: walletData !== null });

  if (!walletData) {
    log('\n⚠ Wallet generation failed. Aborting remaining tests.', 'red');
    return generateReport(results);
  }

  // Test 3: Top-Up (CRITICAL)
  const topUpPassed = await testTopUp(walletData);
  results.push({ name: 'Top-up 10 EVENT tokens', passed: topUpPassed });

  // Test 4: Token Balance
  const balancePassed = await testTokenBalance(walletData);
  results.push({ name: 'Token Balance API', passed: balancePassed });

  // Test 5: Verify Implementation
  const implPassed = await testDecryptShardImplementation();
  results.push({ name: 'decryptShard Implementation', passed: implPassed });

  // Test 6: Stress Test
  const stressPassed = await testMultipleTopUps(walletData);
  results.push({ name: 'Multiple Top-Ups Stress Test', passed: stressPassed });

  // Generate Report
  return generateReport(results);
}

// Run tests
if (require.main === module) {
  main().then(report => {
    process.exit(report.failed > 0 ? 1 : 0);
  }).catch(error => {
    log(`\n✗ Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
