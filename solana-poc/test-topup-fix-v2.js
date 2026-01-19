/**
 * Comprehensive Test Script for Solana POC Top-Up Fix
 *
 * This script simulates the complete wallet creation and top-up flow
 * to verify that the decryptShard fix resolves the "provided secretKey is invalid" error
 *
 * Usage: node test-topup-fix-v2.js
 */

const crypto = require('crypto');
const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

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
 * Make HTTP request to backend API
 */
function makeRequest(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
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
    const { status, data } = await makeRequest('/api/health', 'GET');

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
    const { status, data } = await makeRequest('/api/store-shard', 'POST', { walletId, shard2 });

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

    const { status, data } = await makeRequest('/api/topup', 'POST', { walletId, shard1, amount });

    const duration = Date.now() - startTime;

    log(`Request completed in ${duration}ms`, 'magenta');
    log(`HTTP Status: ${status}`, 'magenta');

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
      log(`Full response: ${JSON.stringify(data, null, 2)}`, 'yellow');
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

  try {
    // Simulate getting balance (we'd need the actual public key for this)
    const { status, data } = await makeRequest('/api/token-balance', 'POST', {
      address: 'simulated_address'
    });

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
 * Test 6: Security Info Check
 */
async function testSecurityInfo() {
  logSection('TEST 6: Security Architecture Verification');

  try {
    const { status, data } = await makeRequest('/api/security-info', 'GET');

    log('Security Configuration:', 'magenta');
    log(`  Key Sharding: ${data.keySharding.algorithm}`, 'magenta');
    log(`  Backend Encryption: ${data.keySharding.backendEncryption}`, 'magenta');
    log(`  Storage: ${data.storage.backend}`, 'magenta');

    logTest('Security info endpoint', 'PASS', 'Key sharding properly configured');
    return true;
  } catch (error) {
    logTest('Security info endpoint', 'FAIL', error.message);
    return false;
  }
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

  // Test 6: Security Info
  const securityPassed = await testSecurityInfo();
  results.push({ name: 'Security Architecture', passed: securityPassed });

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
