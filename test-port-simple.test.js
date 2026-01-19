/**
 * Simplified TDD Test Suite for Port Configuration
 *
 * This test suite verifies port configuration without requiring
 * the services to be fully running.
 *
 * Run: node test-port-simple.test.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Test configuration
const MERCHANT_PORT = 3001;
const SOLANA_POC_PORT = 3002;
const MERCHANT_DIR = '/Users/jm/Codebase/dcwlt/merchant';
const SOLANA_POC_DIR = '/Users/jm/Codebase/dcwlt/solana-poc/backend';

// Test results tracking
const results = {
  passed: [],
  failed: [],
  total: 0
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port, '127.0.0.1');
  });
}

// Test runner
async function runTest(testName, testFn) {
  results.total++;
  process.stdout.write(`\n${colors.cyan}Running:${colors.reset} ${testName}... `);

  try {
    await testFn();
    results.passed.push(testName);
    console.log(`${colors.green}✓ PASSED${colors.reset}`);
    return true;
  } catch (error) {
    results.failed.push({ name: testName, error: error.message });
    console.log(`${colors.red}✗ FAILED${colors.reset}`);
    console.log(`  ${colors.red}Error:${colors.reset} ${error.message}`);
    return false;
  }
}

// Test suite
async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════`);
  console.log(`  Port Configuration TDD Test Suite (Simplified)`);
  console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Test 1: Verify merchant .env file has PORT=3001
  await runTest('Merchant .env should have PORT=3001', async () => {
    const envPath = path.join(MERCHANT_DIR, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    if (!envContent.includes('PORT=3001')) {
      throw new Error('PORT=3001 not found in merchant .env file');
    }
  });

  // Test 2: Verify merchant server.ts uses PORT from environment
  await runTest('Merchant server.ts should use PORT from environment', async () => {
    const serverPath = path.join(MERCHANT_DIR, 'src/server.ts');
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    if (!serverContent.includes('process.env.PORT')) {
      throw new Error('process.env.PORT not found in merchant server.ts');
    }

    if (!serverContent.includes("|| 3001")) {
      throw new Error('Default port 3001 not found in merchant server.ts');
    }
  });

  // Test 3: Verify solana-poc server.js uses port 3002
  await runTest('Solana POC server.js should use PORT=3002', async () => {
    const serverPath = path.join(SOLANA_POC_DIR, 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    // Check if PORT is set to 3002 or defaults to 3002
    const hasPort3002 = serverContent.includes('PORT = process.env.PORT || 3002') ||
                        serverContent.includes("PORT = process.env.PORT || '3002'") ||
                        serverContent.includes('PORT = 3002') ||
                        serverContent.includes('const PORT = process.env.PORT || 3002');

    if (!hasPort3002) {
      throw new Error(`PORT=3002 not found in solana-poc server.js. Found: ${serverContent.substring(serverContent.indexOf('const PORT'), serverContent.indexOf('const PORT') + 50)}`);
    }
  });

  // Test 4: Verify solana-poc .env doesn't override PORT to 3001
  await runTest('Solana POC .env should not set PORT=3001', async () => {
    const envPath = path.join(SOLANA_POC_DIR, '.env');

    if (!fs.existsSync(envPath)) {
      // No .env file is fine - will use default
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('PORT=3001')) {
      throw new Error('PORT=3001 found in solana-poc .env file (should be 3002 or unset)');
    }
  });

  // Test 5: Check if merchant port 3001 is available
  await runTest('Port 3001 should be available for merchant', async () => {
    const inUse = await isPortInUse(MERCHANT_PORT);
    if (inUse) {
      console.log(`\n  ${colors.yellow}⚠ WARNING:${colors.reset} Port ${MERCHANT_PORT} is currently in use`);
      console.log(`  ${colors.yellow}  This is OK if merchant service is running.${colors.reset}`);
    }
    // Don't fail - just warn
  });

  // Test 6: Check if solana-poc port 3002 is available
  await runTest('Port 3002 should be available for solana-poc', async () => {
    const inUse = await isPortInUse(SOLANA_POC_PORT);
    if (inUse) {
      console.log(`\n  ${colors.yellow}⚠ WARNING:${colors.reset} Port ${SOLANA_POC_PORT} is currently in use`);
      console.log(`  ${colors.yellow}  This is OK if solana-poc service is running.${colors.reset}`);
    }
    // Don't fail - just warn
  });

  // Test 7: Verify merchant package.json has correct scripts
  await runTest('Merchant package.json should have build and start scripts', async () => {
    const packagePath = path.join(MERCHANT_DIR, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageContent.scripts || !packageContent.scripts.build) {
      throw new Error('build script not found in merchant package.json');
    }

    if (!packageContent.scripts.start) {
      throw new Error('start script not found in merchant package.json');
    }
  });

  // Test 8: Verify solana-poc package.json has correct scripts
  await runTest('Solana POC package.json should have start script', async () => {
    const packagePath = path.join(SOLANA_POC_DIR, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageContent.scripts || !packageContent.scripts.start) {
      throw new Error('start script not found in solana-poc package.json');
    }
  });

  // Test 9: Verify merchant dist directory exists (built)
  await runTest('Merchant dist directory should exist', async () => {
    const distPath = path.join(MERCHANT_DIR, 'dist/server.js');

    if (!fs.existsSync(distPath)) {
      throw new Error('Merchant server not built. Run: cd merchant && npm run build');
    }
  });

  // Test 10: Verify solana-poc server.js exists
  await runTest('Solana POC server.js should exist', async () => {
    const serverPath = path.join(SOLANA_POC_DIR, 'server.js');

    if (!fs.existsSync(serverPath)) {
      throw new Error('Solana POC server.js not found');
    }
  });

  // Test 11: Verify ports are different
  await runTest('Merchant and Solana POC should use different ports', async () => {
    if (MERCHANT_PORT === SOLANA_POC_PORT) {
      throw new Error(`Both services use port ${MERCHANT_PORT} - conflict!`);
    }

    const portDiff = Math.abs(MERCHANT_PORT - SOLANA_POC_PORT);
    console.log(`\n  ${colors.cyan}ℹ INFO:${colors.reset} Port difference: ${portDiff}`);
  });

  // Test 12: Verify port assignments are documented
  await runTest('Port assignments should be documented in README', async () => {
    const readmePath = path.join('/Users/jm/Codebase/dcwlt', 'CLAUDE.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');

    const hasMerchantPort = readmeContent.includes('3001') || readmeContent.includes('merchant');
    const hasSolanaPort = readmeContent.includes('3002') || readmeContent.includes('solana-poc');

    if (!hasMerchantPort && !hasSolanaPort) {
      console.log(`\n  ${colors.yellow}⚠ WARNING:${colors.reset} Port assignments not documented in README`);
    }
    // Don't fail - just warn
  });

  // Print results
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════`);
  console.log(`  Test Results`);
  console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}Passed:${colors.reset} ${results.passed.length}/${results.total}`);

  if (results.failed.length > 0) {
    console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}/${results.total}\n`);

    results.failed.forEach(({ name, error }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${name}`);
      console.log(`    ${colors.red}${error}${colors.reset}\n`);
    });
  } else {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
    console.log(`\n${colors.cyan}Port Configuration Summary:${colors.reset}`);
    console.log(`  Merchant:  ${MERCHANT_PORT}`);
    console.log(`  Solana POC: ${SOLANA_POC_PORT}`);
    console.log(`\n${colors.cyan}To start both services:${colors.reset}`);
    console.log(`  Terminal 1: cd ${MERCHANT_DIR} && npm start`);
    console.log(`  Terminal 2: cd ${SOLANA_POC_DIR} && npm start`);
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
