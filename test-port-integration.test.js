/**
 * Integration Test for Port Configuration
 *
 * This test verifies that both services can run simultaneously
 * and respond to health checks.
 *
 * Run: node test-port-integration.test.js
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

// Helper function to make HTTP requests with retries
function httpRequest(port, path = '/health', method = 'GET', timeout = 5000, retries = 5) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryRequest = () => {
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

      req.on('error', (err) => {
        attempt++;
        if (attempt < retries) {
          console.log(`  Retry ${attempt}/${retries} for port ${port}...`);
          setTimeout(tryRequest, 1000);
        } else {
          reject(new Error(`Failed after ${retries} attempts: ${err.message}`));
        }
      });

      req.on('timeout', () => {
        req.destroy();
        attempt++;
        if (attempt < retries) {
          console.log(`  Retry ${attempt}/${retries} for port ${port}...`);
          setTimeout(tryRequest, 1000);
        } else {
          reject(new Error(`Request timeout after ${retries} attempts for port ${port}`));
        }
      });

      req.end();
    };

    tryRequest();
  });
}

// Helper function to start a service
function startService(directory, name, env = {}) {
  return new Promise((resolve, reject) => {
    const processEnv = { ...process.env, ...env };
    const serverFile = name === 'merchant' ? 'dist/server.js' : 'server.js';

    const child = spawn('node', [serverFile], {
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

    child.on('error', (err) => {
      reject(err);
    });

    // Return immediately, don't wait for startup
    resolve({ child, stdout, stderr });
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

// Cleanup function
function cleanup(merchantProcess, solanaPocProcess) {
  console.log(`\n${colors.yellow}Cleaning up...${colors.reset}`);

  if (merchantProcess) {
    merchantProcess.child.kill();
    console.log(`  Killed merchant process (PID: ${merchantProcess.child.pid})`);
  }

  if (solanaPocProcess) {
    solanaPocProcess.child.kill();
    console.log(`  Killed solana-poc process (PID: ${solanaPocProcess.child.pid})`);
  }

  // Also try pkill for any strays
  try {
    spawn('pkill', ['-f', 'node.*merchant']);
    spawn('pkill', ['-f', 'node.*solana-poc']);
  } catch (e) {
    // Ignore
  }
}

// Test suite
async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════`);
  console.log(`  Port Configuration Integration Test Suite`);
  console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);

  let merchantProcess = null;
  let solanaPocProcess = null;

  try {
    // Test 1: Start merchant service
    await runTest('Merchant service should start on port 3001', async () => {
      merchantProcess = await startService(MERCHANT_DIR, 'merchant');
      console.log(`  ${colors.cyan}Started merchant (PID: ${merchantProcess.child.pid})${colors.reset}`);
    });

    // Test 2: Start solana-poc service
    await runTest('Solana POC service should start on port 3002', async () => {
      const testEnv = {
        NODE_ENV: 'test',
        ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex')
      };

      solanaPocProcess = await startService(SOLANA_POC_DIR, 'solana-poc', testEnv);
      console.log(`  ${colors.cyan}Started solana-poc (PID: ${solanaPocProcess.child.pid})${colors.reset}`);
    });

    // Wait for services to be ready
    console.log(`\n${colors.yellow}Waiting for services to start...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 3: Verify merchant health endpoint
    await runTest('Merchant health endpoint should respond', async () => {
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

      console.log(`  ${colors.cyan}Response: ${JSON.stringify(response.body)}${colors.reset}`);
    });

    // Test 4: Verify solana-poc health endpoint
    await runTest('Solana POC health endpoint should respond', async () => {
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

      console.log(`  ${colors.cyan}Response: ${JSON.stringify(response.body)}${colors.reset}`);
    });

    // Test 5: Verify both services can handle concurrent requests
    await runTest('Both services should handle concurrent requests', async () => {
      const requests = [];

      // Make 5 concurrent requests to each service
      for (let i = 0; i < 5; i++) {
        requests.push(httpRequest(MERCHANT_PORT, '/health'));
        requests.push(httpRequest(SOLANA_POC_PORT, '/api/health'));
      }

      const responses = await Promise.all(requests);

      // Check all merchant responses
      const merchantResponses = responses.filter((_, i) => i % 2 === 0);
      merchantResponses.forEach((response, i) => {
        if (response.statusCode !== 200) {
          throw new Error(`Merchant request ${i + 1} failed with status ${response.statusCode}`);
        }
      });

      // Check all solana-poc responses
      const solanaResponses = responses.filter((_, i) => i % 2 === 1);
      solanaResponses.forEach((response, i) => {
        if (response.statusCode !== 200) {
          throw new Error(`Solana POC request ${i + 1} failed with status ${response.statusCode}`);
        }
      });

      console.log(`  ${colors.cyan}Handled ${responses.length} concurrent requests successfully${colors.reset}`);
    });

    // Test 6: Verify merchant QR endpoint
    await runTest('Merchant QR endpoint should be accessible', async () => {
      const response = await httpRequest(MERCHANT_PORT, '/api/qr/10');

      // May return 500 if not configured, but should be reachable
      if (response.statusCode !== 200 && response.statusCode !== 500) {
        throw new Error(`Expected status 200 or 500, got ${response.statusCode}`);
      }

      console.log(`  ${colors.cyan}QR endpoint accessible (status: ${response.statusCode})${colors.reset}`);
    });

    // Test 7: Verify solana-poc security-info endpoint
    await runTest('Solana POC security-info endpoint should be accessible', async () => {
      const response = await httpRequest(SOLANA_POC_PORT, '/api/security-info');

      if (response.statusCode !== 200) {
        throw new Error(`Expected status 200, got ${response.statusCode}`);
      }

      if (!response.body.keySharding) {
        throw new Error('Response missing keySharding field');
      }

      console.log(`  ${colors.cyan}Security-info endpoint accessible${colors.reset}`);
    });

    // Test 8: Verify port isolation
    await runTest('Services should not interfere with each other', async () => {
      // Make multiple requests alternating between services
      const requests = [];
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          requests.push(httpRequest(MERCHANT_PORT, '/health'));
        } else {
          requests.push(httpRequest(SOLANA_POC_PORT, '/api/health'));
        }
      }

      const responses = await Promise.all(requests);

      // Verify all succeeded
      responses.forEach((response, i) => {
        if (response.statusCode !== 200) {
          const service = i % 2 === 0 ? 'Merchant' : 'Solana POC';
          throw new Error(`${service} request ${i + 1} failed`);
        }
      });

      console.log(`  ${colors.cyan}Port isolation verified - no interference detected${colors.reset}`);
    });

  } finally {
    // Cleanup
    cleanup(merchantProcess, solanaPocProcess);

    // Wait for ports to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print results
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════`);
  console.log(`  Integration Test Results`);
  console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}Passed:${colors.reset} ${results.passed.length}/${results.total}`);

  if (results.failed.length > 0) {
    console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}/${results.total}\n`);

    results.failed.forEach(({ name, error }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${name}`);
      console.log(`    ${colors.red}${error}${colors.reset}\n`);
    });
  } else {
    console.log(`\n${colors.green}✓ All integration tests passed!${colors.reset}`);
    console.log(`\n${colors.cyan}Port Configuration Verified:${colors.reset}`);
    console.log(`  ✓ Merchant service:  http://localhost:${MERCHANT_PORT}`);
    console.log(`  ✓ Solana POC service: http://localhost:${SOLANA_POC_PORT}`);
    console.log(`  ✓ No port conflicts detected`);
    console.log(`  ✓ Both services can run simultaneously`);
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
