/**
 * TDD Test Suite for Port Configuration
 *
 * This test suite ensures that both backend services can run simultaneously
 * without port conflicts by verifying:
 * 1. Merchant service uses port 3001
 * 2. Solana POC service uses port 3002
 * 3. Both services can start concurrently
 * 4. Health endpoints work on both ports
 *
 * Run: node test-port-configuration.test.js
 */

const http = require('http');
const spawn = require('child_process').spawn;
const crypto = require('crypto');

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
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function httpRequest(port, path = '/health', method = 'GET', timeout = 5000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for port ${port}`));
    });

    req.end();
  });
}

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

// Helper function to start a service
function startService(directory, name, env = {}) {
  return new Promise((resolve, reject) => {
    const processEnv = { ...process.env, ...env };

    const child = spawn('node', ['dist/server.js'], {
      cwd: directory,
      env: processEnv,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for server to start
    setTimeout(() => {
      resolve({ child, stdout, stderr });
    }, 2000);

    child.on('error', (err) => {
      reject(err);
    });
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
  console.log(`  Port Configuration TDD Test Suite`);
  console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Test 1: Verify merchant .env file has PORT=3001
  await runTest('Merchant .env should have PORT=3001', async () => {
    const fs = require('fs');
    const envPath = `${MERCHANT_DIR}/.env`;
    const envContent = fs.readFileSync(envPath, 'utf8');

    if (!envContent.includes('PORT=3001')) {
      throw new Error('PORT=3001 not found in merchant .env file');
    }
  });

  // Test 2: Verify solana-poc server.js uses port 3002
  await runTest('Solana POC server.js should use PORT=3002', async () => {
    const fs = require('fs');
    const serverPath = `${SOLANA_POC_DIR}/server.js`;
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    // Check if PORT is set to 3002 or defaults to 3002
    const hasPort3002 = serverContent.includes('PORT = 3002') ||
                        serverContent.includes('PORT=3002') ||
                        serverContent.includes('const PORT = 3002');

    if (!hasPort3002) {
      throw new Error('PORT=3002 not found in solana-poc server.js');
    }
  });

  // Test 3: Check if merchant port 3001 is available before testing
  await runTest('Port 3001 should be available for merchant', async () => {
    const inUse = await isPortInUse(MERCHANT_PORT);
    if (inUse) {
      throw new Error(`Port ${MERCHANT_PORT} is already in use. Please stop any services running on this port.`);
    }
  });

  // Test 4: Check if solana-poc port 3002 is available before testing
  await runTest('Port 3002 should be available for solana-poc', async () => {
    const inUse = await isPortInUse(SOLANA_POC_PORT);
    if (inUse) {
      throw new Error(`Port ${SOLANA_POC_PORT} is already in use. Please stop any services running on this port.`);
    }
  });

  // Test 5: Build merchant TypeScript server
  await runTest('Merchant server should build successfully', async () => {
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { cwd: MERCHANT_DIR, stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Failed to build merchant server: ${error.message}`);
    }
  });

  // Test 6: Start merchant service on port 3001
  let merchantProcess = null;
  await runTest('Merchant service should start on port 3001', async () => {
    try {
      merchantProcess = await startService(MERCHANT_DIR, 'merchant');

      // Verify it's responding
      const response = await httpRequest(MERCHANT_PORT, '/health');

      if (response.statusCode !== 200) {
        throw new Error(`Health check failed with status ${response.statusCode}`);
      }

      if (!response.body.service) {
        throw new Error('Health check response missing service field');
      }
    } catch (error) {
      throw new Error(`Failed to start merchant service: ${error.message}`);
    }
  });

  // Test 7: Start solana-poc service on port 3002
  let solanaPocProcess = null;
  await runTest('Solana POC service should start on port 3002', async () => {
    // Set test environment variables
    const testEnv = {
      NODE_ENV: 'test',
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex')
    };

    try {
      solanaPocProcess = await startService(SOLANA_POC_DIR, 'solana-poc', testEnv);

      // Verify it's responding
      const response = await httpRequest(SOLANA_POC_PORT, '/api/health');

      if (response.statusCode !== 200) {
        throw new Error(`Health check failed with status ${response.statusCode}`);
      }

      if (!response.body.status) {
        throw new Error('Health check response missing status field');
      }
    } catch (error) {
      throw new Error(`Failed to start solana-poc service: ${error.message}`);
    }
  });

  // Test 8: Verify both services can run simultaneously
  await runTest('Both services should run simultaneously without conflicts', async () => {
    // Make requests to both services
    const merchantResponse = await httpRequest(MERCHANT_PORT, '/health');
    const solanaResponse = await httpRequest(SOLANA_POC_PORT, '/api/health');

    if (merchantResponse.statusCode !== 200) {
      throw new Error('Merchant service not responding');
    }

    if (solanaResponse.statusCode !== 200) {
      throw new Error('Solana POC service not responding');
    }
  });

  // Test 9: Verify merchant health endpoint
  await runTest('Merchant health endpoint should return correct structure', async () => {
    const response = await httpRequest(MERCHANT_PORT, '/health');

    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.status) {
      throw new Error('Response missing status field');
    }

    if (response.body.service !== 'event-wallet-merchant') {
      throw new Error(`Expected service 'event-wallet-merchant', got '${response.body.service}'`);
    }
  });

  // Test 10: Verify solana-poc health endpoint
  await runTest('Solana POC health endpoint should return correct structure', async () => {
    const response = await httpRequest(SOLANA_POC_PORT, '/api/health');

    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.status) {
      throw new Error('Response missing status field');
    }

    if (response.body.status !== 'healthy') {
      throw new Error(`Expected status 'healthy', got '${response.body.status}'`);
    }
  });

  // Test 11: Verify merchant QR endpoint
  await runTest('Merchant QR endpoint should be accessible', async () => {
    const response = await httpRequest(MERCHANT_PORT, '/api/qr/10');

    if (response.statusCode !== 200 && response.statusCode !== 500) {
      throw new Error(`Expected status 200 or 500 (config), got ${response.statusCode}`);
    }

    // May return 500 if not configured, but should be reachable
    if (!response.body.success !== undefined && !response.body.error) {
      throw new Error('Response missing success or error field');
    }
  });

  // Test 12: Verify solana-poc security-info endpoint
  await runTest('Solana POC security-info endpoint should be accessible', async () => {
    const response = await httpRequest(SOLANA_POC_PORT, '/api/security-info');

    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.keySharding) {
      throw new Error('Response missing keySharding field');
    }
  });

  // Cleanup
  console.log(`\n${colors.yellow}Cleaning up...${colors.reset}`);

  if (merchantProcess) {
    merchantProcess.child.kill();
  }

  if (solanaPocProcess) {
    solanaPocProcess.child.kill();
  }

  // Wait a bit for ports to be released
  await new Promise(resolve => setTimeout(resolve, 1000));

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
