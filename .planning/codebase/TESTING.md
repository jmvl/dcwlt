# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**
- Jest 30.2.0
- Config: `jest.config.js` (backend, merchant)
- ts-jest for TypeScript compilation

**Assertion Library:**
- Jest built-in assertions (`expect`, `toHaveProperty`, `toBe`)

**Run Commands:**
```bash
# Backend
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Merchant
cd merchant
npm test                # Run all tests

# Event-wallet (mobile)
# No automated tests configured - manual testing required
```

**Configuration:**
- **Backend:** `/Users/jm/Codebase/dcwlt/backend/jest.config.js`
- **Merchant:** `/Users/jm/Codebase/dcwlt/merchant/jest.config.js`

**Jest Config (backend):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 60000 // 60 second timeout for blockchain operations
};
```

## Test File Organization

**Location:**
- **Backend:** `backend/test/` and `backend/tests/` (two directories)
- **Merchant:** `merchant/test/`
- **Event-wallet:** No test directory (manual testing only)

**Naming:**
- Same filename as source with `.test.ts` suffix
- Integration tests in `tests/integration/` subdirectory
- Unit tests co-located with feature tests

**Structure:**
```
backend/
├── src/
│   └── server.ts
├── test/
│   └── topup.test.ts
├── tests/
│   ├── setup.ts
│   ├── rateLimit.test.ts
│   └── integration/
│       └── rateLimit.integration.test.ts

merchant/
├── src/
│   └── server.ts
└── test/
    └── server.test.ts

event-wallet/
└── (no automated tests)
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/server';

describe('POST /api/topup - ATA Auto-Creation Tests', () => {
  let connection: Connection;
  let bankWallet: Keypair;
  let tokenMint: PublicKey;

  beforeAll(() => {
    // One-time setup
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('Scenario 1: User wallet has no ATA', () => {
    test('should automatically create ATA and transfer tokens', async () => {
      // Test implementation
    }, 30000);
  });
});
```

**Patterns:**

**Setup (`beforeAll`):**
- Initialize shared resources (connection, wallets)
- Load environment configuration
- One-time expensive operations

```typescript
beforeAll(() => {
  connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const bankWalletPath = process.env.BANK_WALLET_PATH;
  const secretKey = JSON.parse(fs.readFileSync(bankWalletPath, 'utf8'));
  bankWallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
  testWallet = Keypair.generate();
});
```

**Teardown (`afterEach`):**
- Clean up test data
- Reset rate limiters
- Replenish test accounts

```typescript
afterEach(async () => {
  const balance = await connection.getBalance(testWallet.publicKey);
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    const signature = await connection.requestAirdrop(
      testWallet.publicKey,
      0.5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
  }
});
```

**Assertions:**
- Use `expect()` for all assertions
- Test both success and failure paths
- Verify response status, body structure, and data

```typescript
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body.amount).toBe(topUpAmount);
expect(response.body.signature).toBeDefined();
expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);
```

**Timeout Handling:**
- Default Jest timeout: 5 seconds
- Blockchain tests: 30-60 seconds via `testTimeout` option or individual test timeout
- Specified as second argument to `test()`

```typescript
test('should handle ATA creation', async () => {
  // Test that may take longer
}, 30000); // 30 second timeout
```

## Mocking

**Framework:** No explicit mocking framework detected

**Patterns:**
- **Express app export for testing:** Server exports `app` without starting listener

```typescript
// backend/src/server.ts
export { app };

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => { });
}
```

- **Rate limiting bypass during tests:**
```typescript
// Disable rate limiting during tests
const isTest = process.env.NODE_ENV === 'test';
const passthroughLimiter = (_req: any, _res: any, next: any) => next();

const topupLimiter = isTest ? passthroughLimiter : rateLimit({
  // Rate limit config
});
```

- **Test environment setup:**
```typescript
// backend/tests/setup.ts
process.env.NODE_ENV = 'test';
console.log('Rate limiting: DISABLED during tests');
```

**What to Mock:**
- External API calls (Solana RPC for unit tests)
- File system operations (in pure unit tests)
- Time (for rate limiting tests)

**What NOT to Mock:**
- Database queries (use test database)
- Express middleware (test real behavior)
- Solana SDK (integration tests should use devnet)

## Fixtures and Factories

**Test Data:**
- Generated programmatically in `beforeAll` or `beforeEach`
- Use Keypair generation for unique test wallets
- Environment-based configuration for shared fixtures

```typescript
beforeAll(() => {
  // Generate a fresh test wallet for each test run
  testWallet = Keypair.generate();

  // Load real configuration from environment
  tokenMint = new PublicKey(process.env.TOKEN_ADDRESS);
});
```

**Location:**
- Fixtures created inline in test files
- No shared fixtures directory
- Test-specific data in `beforeEach`

**Constants for Testing:**
```typescript
// Valid Solana address for testing (a real devnet address)
const VALID_WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
```

## Coverage

**Requirements:** 80% coverage enforced in backend

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

**View Coverage:**
```bash
cd backend
npm run test:coverage
```

**Coverage Collection:**
```javascript
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts'
]
```

**Current Status:**
- Backend: Coverage thresholds configured (80%)
- Merchant: No coverage thresholds configured
- Event-wallet: No coverage (manual testing only)

## Test Types

**Unit Tests:**
- Scope: Individual functions, utility modules
- Location: `backend/tests/rateLimit.test.ts`
- Approach: Isolated logic with minimal dependencies
- Example: Rate limiting middleware tests

```typescript
describe('Rate Limiting - Health Check Endpoint', () => {
  test('should allow normal requests under limit', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    expect(response.body.status).toBe('ok');
  });
});
```

**Integration Tests:**
- Scope: Full endpoint testing with real dependencies
- Location: `backend/tests/integration/rateLimit.integration.test.ts`, `backend/test/topup.test.ts`
- Approach: Test entire request-response cycle
- Uses: Real Solana devnet, real Express app

```typescript
describe('Rate Limiting Integration - Real Server', () => {
  test('should allow normal requests', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    expect(response.body.status).toBe('ok');
  });
});
```

**Blockchain Integration Tests:**
- Scope: Real blockchain transactions on devnet
- Location: `backend/test/topup.test.ts`
- Approach: Live testing against Solana devnet
- Timeout: Extended to 60 seconds for blockchain confirmations

```typescript
describe('Scenario 1: User wallet has no ATA', () => {
  test('should automatically create ATA and transfer tokens', async () => {
    const freshWallet = Keypair.generate();

    // Verify ATA does not exist before top-up
    const ataAddress = await getAssociatedTokenAddress(tokenMint, freshWallet.publicKey);
    let ataExists = false;
    try {
      await getAccount(connection, ataAddress);
      ataExists = true;
    } catch (error) {
      // ATA doesn't exist, which is expected
    }
    expect(ataExists).toBe(false);

    // Make top-up request
    const response = await request(app)
      .post('/api/topup')
      .send({
        walletAddress: freshWallet.publicKey.toBase58(),
        amount: topUpAmount
      });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify ATA was created
    const ataAccount = await getAccount(connection, ataAddress);
    expect(ataAccount.owner.toBase58()).toBe(freshWallet.publicKey.toBase58());
    expect(Number(ataAccount.amount)).toBe(topUpAmount * 1e9);
  }, 30000);
});
```

**E2E Tests:**
- Framework: Not used
- Mobile testing: Manual only
- Reason: React Native requires physical device/emulator

## Common Patterns

**Async Testing:**
```typescript
test('should handle async operations', async () => {
  // Use async/await
  const response = await request(app).post('/api/topup').send({ amount: 50 });

  // Wait for blockchain confirmation
  await connection.confirmTransaction(signature);

  // Verify async state change
  const account = await getAccount(connection, ataAddress);
  expect(Number(account.amount)).toBe(50 * 1e9);
});
```

**Error Testing:**
```typescript
test('should reject negative amounts', async () => {
  const response = await request(app)
    .post('/api/topup')
    .send({
      walletAddress: wallet.publicKey.toBase58(),
      amount: -10
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toContain('positive number');
});
```

**Environment-Specific Testing:**
```typescript
// Test environment setup
process.env.NODE_ENV = 'test';

// Environment variable restoration
describe('Configuration via Environment', () => {
  const originalEnv = process.env;

  after(() => {
    process.env = originalEnv;
  });

  test('should use default limits when env vars not set', async () => {
    delete process.env.RATE_LIMIT_TOPUP_MAX;
    // Test with defaults
  });
});
```

**Test Isolation:**
```typescript
// Generate unique wallets to avoid conflicts
const wallet1 = Keypair.generate();
const wallet2 = Keypair.generate();

// Use unique identifiers for rate limit testing
for (let i = 0; i < 11; i++) {
  await request(app)
    .post('/api/topup')
    .send({ walletAddress: `${VALID_WALLET}-${i}`, amount: 50 });
}
```

**Sequential Test Dependencies:**
```typescript
test('should handle multiple sequential top-ups', async () => {
  let expectedBalance = 0;

  for (const amount of [25, 50, 25]) {
    const response = await request(app)
      .post('/api/topup')
      .send({ walletAddress: wallet.publicKey.toBase58(), amount });

    expect(response.status).toBe(200);
    expectedBalance += amount;

    // Wait and verify after each transaction
    await connection.confirmTransaction(response.body.signature);
    const ataAccount = await getAccount(connection, ataAddress);
    expect(Number(ataAccount.amount)).toBe(expectedBalance * 1e9);
  }
});
```

## Test Data Management

**Blockchain Test Accounts:**
- Generated fresh per test run
- Airdropped SOL when balance low
- Cleaned up in `afterEach`

**Environment Variables for Testing:**
```typescript
// Required in .env for tests
TOKEN_ADDRESS=<real devnet token address>
BANK_WALLET_PATH=/path/to/test/wallet.json
```

**Test RPC Endpoints:**
- Primary: `https://api.devnet.solana.com`
- No local RPC for testing

## Mobile Testing (Event-Wallet)

**Approach:** Manual testing only

**Reasons:**
- React Native requires physical device/emulator
- Crypto libraries not compatible with Jest
- Camera QR scanning requires device hardware
- Web3Auth integration requires real OAuth flow

**Manual Testing Checklist:**
1. Gmail login flow
2. Wallet address generation
3. Balance display
4. Top-up functionality
5. QR code scanning
6. Payment execution

**Test Mode Flag:**
```typescript
// TEST_MODE: Skip Web3Auth initialization for UI testing
const TEST_MODE = true;
if (TEST_MODE) {
  console.log('TEST MODE: Skipping Web3Auth initialization');
  setWalletAddress('TestWallet1234');
  setIsLoggedIn(true);
  return;
}
```

## Test Organization by Feature

**Backend Top-Up Tests (`backend/test/topup.test.ts`):**
- ATA auto-creation scenarios
- Existing ATA handling
- Error handling (invalid addresses, missing params)
- Sequential transactions
- Amount validation
- Multiple scenario testing

**Rate Limiting Tests (`backend/tests/rateLimit.test.ts`):**
- Health endpoint limits (60/minute)
- Status endpoint limits (60/minute)
- Top-up endpoint limits (10/minute)
- Independent rate limits per endpoint
- Configuration via environment

**Rate Limiting Integration (`backend/tests/integration/rateLimit.integration.test.ts`):**
- Real server behavior
- Rate limit headers verification
- Retry-after header validation
- Cross-endpoint independence

**Merchant Tests (`merchant/test/server.test.ts`):**
- Health endpoint
- Status endpoint
- QR code generation
- Error handling (invalid amounts)
- 404 handler

## Testing Gotchas

**Blockchain Timing:**
- Transactions take 1-3 seconds to confirm
- Use `connection.confirmTransaction()` before assertions
- Set extended timeouts (30-60 seconds) for integration tests

**Rate Limiting in Tests:**
- Must disable via `NODE_ENV=test`
- Use passthrough middleware during tests
- Don't forget to restore environment after tests

**Test Wallet Funding:**
- Devnet SOL needed for ATA creation
- Airdrop rate limits: 1 request per 2 seconds
- Reuse test wallets to avoid airdrop limits

**Async Cleanup:**
- Always `await` cleanup operations
- Use `afterEach` for test-specific cleanup
- Use `afterAll` for shared resource cleanup

**Import Side Effects:**
- Solana SDK imports access Buffer during module load
- Must lazy-load to avoid polyfill issues
- Already handled in source code with `await import()`

---

*Testing analysis: 2026-01-16*
