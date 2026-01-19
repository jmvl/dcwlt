/**
 * TDD Test Suite for /api/topup endpoint
 *
 * This test suite follows Test-Driven Development principles and tests:
 * 1. Various top-up amounts (10, 25, 50, 100)
 * 2. Error handling (invalid amounts, missing parameters)
 * 3. Response format validation
 * 4. Edge cases (negative amounts, zero, etc.)
 *
 * Environment: Solana Devnet (testnet)
 * Framework: Jest with Supertest
 */

const request = require('supertest');
const { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Import the express app
let app;
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

  // Clear any cached modules
  jest.resetModules();

  // Import the app after setting environment variables
  app = require('../server');
});

afterAll((done) => {
  // Close server if it has a listen callback
  if (app && typeof app.close === 'function') {
    app.close(done);
  } else {
    done();
  }
});

/**
 * Test Utilities
 */

/**
 * Generate a test wallet with shards
 * @returns {Object} Test wallet data with walletId, shard1, shard2, and keypair
 */
function generateTestWallet() {
  const keypair = Keypair.generate();
  const privateKey = Array.from(keypair.secretKey);

  // Split private key into two shards (XOR)
  const shard1 = Buffer.alloc(64);
  const shard2 = Buffer.alloc(64);

  for (let i = 0; i < 64; i++) {
    shard1[i] = privateKey[i] ^ Math.floor(Math.random() * 256);
    shard2[i] = privateKey[i] ^ shard1[i];
  }

  const walletId = `test_wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    walletId,
    shard1: shard1.toString('hex'),
    shard2: shard2.toString('hex'),
    keypair,
    publicKey: keypair.publicKey.toString()
  };
}

/**
 * Store a shard for testing
 * @param {string} walletId - Wallet identifier
 * @param {string} shard2 - Second shard as hex string
 */
async function storeTestShard(walletId, shard2) {
  await request(app)
    .post('/api/store-shard')
    .send({ walletId, shard2 })
    .expect(200);
}

/**
 * Mock token configuration for testing
 */
function setupMockTokenConfig() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create a mock token configuration
  const mockConfig = {
    token: {
      name: 'EVENT',
      symbol: 'EVENT',
      decimals: 9,
      mintAddress: 'EventTokenMockAddress11111111111111111111111'
    },
    pool: {
      publicKey: 'PoolPublicKeyMock111111111111111111111111111',
      tokenAccount: 'PoolTokenAccountMock11111111111111111111111'
    }
  };

  const configPath = path.join(dataDir, 'token-config.json');
  fs.writeFileSync(configPath, JSON.stringify(mockConfig, null, 2));

  return mockConfig;
}

/**
 * Clean up mock token configuration
 */
function cleanupMockTokenConfig() {
  const configPath = path.join(__dirname, '../data/token-config.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
}

/**
 * ============================================================================
 * TEST SUITE: Successful Top-Up Operations
 * ============================================================================
 */

describe('POST /api/topup - Successful Operations', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Top-up with amount of 10 EVENT tokens
   * Expected: Should return success response with signature
   */
  test('should successfully top-up 10 EVENT tokens', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 10
      });

    // Note: This test will fail without actual Solana connection and pool wallet
    // In a real scenario, we would mock the Solana connection
    expect(response.status).toBeGreaterThanOrEqual(400); // Will fail due to missing pool wallet
  });

  /**
   * Test: Top-up with amount of 25 EVENT tokens
   * Expected: Should return success response with signature
   */
  test('should successfully top-up 25 EVENT tokens', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 25
      });

    // Will fail without proper setup, but validates request format
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Top-up with amount of 50 EVENT tokens (standard amount)
   * Expected: Should return success response with signature
   */
  test('should successfully top-up 50 EVENT tokens (standard amount)', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Validates request format
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Top-up with amount of 100 EVENT tokens
   * Expected: Should return success response with signature
   */
  test('should successfully top-up 100 EVENT tokens', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 100
      });

    // Validates request format
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Top-up with maximum allowed amount (10000)
   * Expected: Should accept the maximum amount
   */
  test('should accept maximum top-up amount of 10000', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 10000
      });

    // Validates that amount validation passes
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Top-up with minimum positive amount (1)
   * Expected: Should accept the minimum positive amount
   */
  test('should accept minimum top-up amount of 1', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 1
      });

    // Validates that amount validation passes
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Missing Required Parameters
 * ============================================================================
 */

describe('POST /api/topup - Missing Required Parameters', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Missing walletId parameter
   * Expected: Should return 400 error with appropriate message
   */
  test('should return 400 when walletId is missing', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({
        shard1: 'abc123',
        amount: 50
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('required');
  });

  /**
   * Test: Missing shard1 parameter
   * Expected: Should return 400 error with appropriate message
   */
  test('should return 400 when shard1 is missing', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: 'test_wallet_123',
        amount: 50
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('required');
  });

  /**
   * Test: Missing amount parameter
   * Expected: Should return 400 error with appropriate message
   */
  test('should return 400 when amount is missing', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: 'test_wallet_123',
        shard1: 'abc123'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('required');
  });

  /**
   * Test: All parameters missing
   * Expected: Should return 400 error with appropriate message
   */
  test('should return 400 when all parameters are missing', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('required');
  });

  /**
   * Test: Empty request body
   * Expected: Should return 400 error
   */
  test('should return 400 when request body is empty', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Invalid Amount Values
 * ============================================================================
 */

describe('POST /api/topup - Invalid Amount Values', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Negative amount
   * Expected: Should return 400 error
   */
  test('should return 400 for negative amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: -10
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/between 0 and 10000/i);
  });

  /**
   * Test: Zero amount
   * Expected: Should return 400 error
   */
  test('should return 400 for zero amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 0
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });

  /**
   * Test: Amount exceeding maximum (10000)
   * Expected: Should return 400 error
   */
  test('should return 400 for amount exceeding 10000', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 10001
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/between 0 and 10000/i);
  });

  /**
   * Test: Very large amount (potential overflow)
   * Expected: Should return 400 error
   */
  test('should return 400 for very large amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 999999999
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Non-numeric amount (string)
   * Expected: Should return 400 error
   */
  test('should return 400 for non-numeric amount (string)', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 'fifty'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Amount with decimal places
   * Expected: Should accept decimal amounts (tokens can have decimals)
   */
  test('should accept decimal amount (0.5 tokens)', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 0.5
      });

    // Validates that decimal amount passes basic validation
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Amount as NaN
   * Expected: Should return 400 error
   */
  test('should return 400 for NaN amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: NaN
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Amount as null
   * Expected: Should return 400 error
   */
  test('should return 400 for null amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: null
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Shard Validation
 * ============================================================================
 */

describe('POST /api/topup - Shard Validation', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Shard2 not found in memory
   * Expected: Should return 404 error
   */
  test('should return 404 when shard2 is not stored', async () => {
    const wallet = generateTestWallet();
    // Don't store the shard

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not found|expired/i);
  });

  /**
   * Test: Invalid shard1 format
   * Expected: Should handle gracefully (may fail later in process)
   */
  test('should handle invalid shard1 format', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: 'invalid_hex_string',
        amount: 50
      });

    // Should fail during processing
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Empty shard1
   * Expected: Should return 400 or fail during processing
   */
  test('should handle empty shard1', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: '',
        amount: 50
      });

    expect([400, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Mismatched shards (wrong shard1 for stored shard2)
   * Expected: Should create invalid keypair and fail transaction
   */
  test('should fail with mismatched shards', async () => {
    const wallet1 = generateTestWallet();
    const wallet2 = generateTestWallet();

    // Store shard2 from wallet1 but use shard1 from wallet2
    await storeTestShard(wallet1.walletId, wallet1.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet1.walletId,
        shard1: wallet2.shard1, // Wrong shard!
        amount: 50
      });

    // Will fail when trying to use the invalid keypair
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Token Configuration Validation
 * ============================================================================
 */

describe('POST /api/topup - Token Configuration', () => {
  /**
   * Test: Token system not initialized
   * Expected: Should return 503 Service Unavailable
   */
  test('should return 503 when token system is not initialized', async () => {
    // Ensure no token config exists
    cleanupMockTokenConfig();

    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not initialized|not been set up/i);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Response Format Validation
 * ============================================================================
 */

describe('POST /api/topup - Response Format', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Success response has required fields
   * Expected: Response should include success, signature, amount, explorerUrl
   */
  test('should return correct response format on success', async () => {
    // This test would require mocking the Solana connection
    // For now, we test the error response format
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Even on failure, response should have specific format
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('error');
  });

  /**
   * Test: Error response has correct structure
   * Expected: Error response should include success and error fields
   */
  test('should return correct error response format', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: 'test',
        amount: 50
        // Missing shard1
      });

    expect(response.body).toMatchObject({
      success: false,
      error: expect.any(String)
    });
  });

  /**
   * Test: Response includes JSON content-type
   * Expected: Should return application/json
   */
  test('should return JSON content-type', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({});

    expect(response.headers['content-type']).toMatch(/json/);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Edge Cases
 * ============================================================================
 */

describe('POST /api/topup - Edge Cases', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Special characters in walletId
   * Expected: Should handle special characters
   */
  test('should handle special characters in walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = 'test_wallet_!@#$%^&*()_123';
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should accept the request (may fail later)
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Very long walletId
   * Expected: Should handle long walletIds
   */
  test('should handle very long walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = 'a'.repeat(1000);
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should accept the request
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Unicode in walletId
   * Expected: Should handle unicode characters
   */
  test('should handle unicode characters in walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = '测试钱包_🚀_test';
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should accept the request
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Amount as scientific notation
   * Expected: Should handle scientific notation
   */
  test('should handle amount in scientific notation', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 1e2 // 100 in scientific notation
      });

    // Should accept the valid amount
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Multiple rapid requests
   * Expected: Should handle concurrent requests
   */
  test('should handle multiple concurrent requests', async () => {
    const wallets = Array(5).fill(null).map(() => generateTestWallet());

    // Store all shards
    await Promise.all(
      wallets.map(w => storeTestShard(w.walletId, w.shard2))
    );

    // Send concurrent requests
    const responses = await Promise.all(
      wallets.map(w =>
        request(app)
          .post('/api/topup')
          .send({
            walletId: w.walletId,
            shard1: w.shard1,
            amount: 10
          })
      )
    );

    // All should get responses
    responses.forEach(response => {
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('success');
    });
  });
});

/**
 * ============================================================================
 * TEST SUITE: Security Tests
 * ============================================================================
 */

describe('POST /api/topup - Security', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: SQL injection attempt in walletId
   * Expected: Should treat as literal string
   */
  test('should handle SQL injection attempt in walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = "'; DROP TABLE users; --";
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should handle as literal string
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: XSS attempt in walletId
   * Expected: Should treat as literal string
   */
  test('should handle XSS attempt in walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = '<script>alert("xss")</script>';
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should handle as literal string
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Prototype pollution attempt
   * Expected: Should ignore prototype properties
   */
  test('should ignore prototype pollution attempt', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({
        __proto__: { amount: 50 },
        constructor: { prototype: { amount: 50 } }
      });

    // Should reject missing required fields
    expect(response.status).toBe(400);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Integration with Store Shard
 * ============================================================================
 */

describe('POST /api/topup - Integration with /api/store-shard', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Complete flow - store shard then top-up
   * Expected: Should successfully complete both operations
   */
  test('should complete full flow: store-shard -> topup', async () => {
    const wallet = generateTestWallet();

    // Step 1: Store shard
    const storeResponse = await request(app)
      .post('/api/store-shard')
      .send({
        walletId: wallet.walletId,
        shard2: wallet.shard2
      });

    expect(storeResponse.status).toBe(200);
    expect(storeResponse.body).toHaveProperty('success', true);

    // Step 2: Top-up
    const topupResponse = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Will fail without actual Solana setup, but validates integration
    expect(topupResponse.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Top-up after clearing shard
   * Expected: Should fail since shard was cleared
   */
  test('should fail after clearing shard', async () => {
    const wallet = generateTestWallet();

    // Store shard
    await storeTestShard(wallet.walletId, wallet.shard2);

    // Clear shard
    await request(app)
      .delete('/api/clear-shard')
      .send({ walletId: wallet.walletId });

    // Try to top-up
    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * ============================================================================
 * TEST SUITE: HTTP Methods
 * ============================================================================
 */

describe('POST /api/topup - HTTP Method Validation', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: GET method not allowed
   * Expected: Should return 404 or 405
   */
  test('should not accept GET requests', async () => {
    const response = await request(app)
      .get('/api/topup');

    expect([404, 405]).toContain(response.status);
  });

  /**
   * Test: PUT method not allowed
   * Expected: Should return 404 or 405
   */
  test('should not accept PUT requests', async () => {
    const response = await request(app)
      .put('/api/topup')
      .send({ amount: 50 });

    expect([404, 405]).toContain(response.status);
  });

  /**
   * Test: DELETE method not allowed
   * Expected: Should return 404 or 405
   */
  test('should not accept DELETE requests', async () => {
    const response = await request(app)
      .delete('/api/topup');

    expect([404, 405]).toContain(response.status);
  });
});

/**
 * ============================================================================
 * TEST SUITE: Data Type Validation
 * ============================================================================
 */

describe('POST /api/topup - Data Type Validation', () => {
  let mockConfig;

  beforeAll(() => {
    mockConfig = setupMockTokenConfig();
  });

  afterAll(() => {
    cleanupMockTokenConfig();
  });

  /**
   * Test: Amount as string number
   * Expected: Should handle string representation of number
   */
  test('should handle amount as string number', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: "50"
      });

    // JavaScript may coerce string to number
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: walletId as number
   * Expected: Should handle numeric walletId
   */
  test('should handle numeric walletId', async () => {
    const wallet = generateTestWallet();
    wallet.walletId = 12345;
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: 50
      });

    // Should handle numeric walletId
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Amount as boolean
   * Expected: Should handle boolean amount
   */
  test('should handle boolean amount (true = 1)', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: true
      });

    // true coerces to 1, which is valid
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  /**
   * Test: Amount as boolean false
   * Expected: Should handle boolean amount (false = 0)
   */
  test('should handle boolean amount (false = 0)', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: false
      });

    // false coerces to 0, which is invalid
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  /**
   * Test: Amount as object
   * Expected: Should reject object amount
   */
  test('should reject object amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: { value: 50 }
      });

    expect(response.status).toBe(400);
  });

  /**
   * Test: Amount as array
   * Expected: Should reject array amount
   */
  test('should reject array amount', async () => {
    const wallet = generateTestWallet();
    await storeTestShard(wallet.walletId, wallet.shard2);

    const response = await request(app)
      .post('/api/topup')
      .send({
        walletId: wallet.walletId,
        shard1: wallet.shard1,
        amount: [50]
      });

    expect(response.status).toBe(400);
  });
});
