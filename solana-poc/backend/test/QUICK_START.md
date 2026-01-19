# Test Suite Quick Start Guide

## Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Stop any running backend server
pkill -f "node.*server.js" 2>/dev/null || true
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests for CI/CD
npm run test:ci
```

### Using the Test Runner Script

```bash
# Automated test runner with environment checks
./test/run-tests.sh

# With additional Jest options
./test/run-tests.sh -- --coverage
```

### Filter Tests

```bash
# Run tests matching a pattern
npm test -- --testNamePattern="should return 400"

# Run tests in a specific file
npm test -- topup.test.js

# Run tests with a specific keyword
npm test -- --testNamePattern="Security"
```

## Expected Results

### Without Token Setup

**Passing:** 39/46 tests (85%)

**Failing:** 7 tests (due to missing token configuration)

These failures are expected and return 503 errors.

### With Token Setup

```bash
# Setup token system first
npm run setup:token

# Then run tests
npm test
```

**Expected:** All parameter validation and security tests should pass (100%)

## Understanding Test Results

### Success Output

```
PASS  test/topup.test.js
  POST /api/topup - Successful Operations
    ✓ should successfully top-up 10 EVENT tokens (XX ms)
    ✓ should successfully top-up 50 EVENT tokens (XX ms)
  ...

Test Suites: 1 passed, 1 total
Tests:       39 passed, 7 total
```

### Failure Output

```
✕ should return 404 when shard2 is not stored

  Expected: 404
  Received: 503
```

This means the token system is not initialized.

## Common Issues

### Issue: Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Stop the backend server
pkill -f "node.*server.js"
# Or
lsof -t -i:3001 | xargs kill -9
```

### Issue: Token Not Configured

```
Expected: 400/404
Received: 503
Error: Token system not initialized
```

**Solution:**
```bash
npm run setup:token
```

### Issue: Module Not Found

```
Error: Cannot find module 'supertest'
```

**Solution:**
```bash
npm install
```

## Test Categories

### 1. Parameter Validation (17 tests)
Tests all required and optional parameters.

### 2. Security Tests (3 tests)
Tests against SQL injection, XSS, and prototype pollution.

### 3. Edge Cases (6 tests)
Tests special characters, unicode, and boundary conditions.

### 4. Integration Tests (2 tests)
Tests complete flows with other endpoints.

### 5. Data Type Tests (7 tests)
Tests various input data types.

## Coverage Report

```bash
npm run test:coverage
```

Output includes:
- Percentage coverage for lines, branches, functions, statements
- HTML report in `coverage/` directory
- Files not covered

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Writing New Tests

1. Open `test/topup.test.js`
2. Find appropriate `describe` block
3. Add new test following existing patterns:

```javascript
test('should do something specific', async () => {
  // Arrange
  const wallet = generateTestWallet();

  // Act
  const response = await request(app)
    .post('/api/topup')
    .send({ /* test data */ });

  // Assert
  expect(response.status).toBe(200);
});
```

## Test Utilities

Available in `test/setup.js`:

```javascript
// Generate random wallet ID
global.testUtils.generateWalletId()

// Generate random amount
global.testUtils.generateAmount(min, max)

// Wait for specified time
global.testUtils.wait(ms)
```

## Getting Help

1. **README.md** - Comprehensive documentation
2. **EXAMPLES.md** - Test patterns and templates
3. **TEST_SUMMARY.md** - Detailed test coverage
4. **Inline comments** - Test explanations

## Quick Checklist

Before running tests:
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server stopped
- [ ] `.env` file exists (auto-created if missing)
- [ ] Token setup optional (for integration tests)

After running tests:
- [ ] Check test count (expected: 46 tests)
- [ ] Review any failures
- [ ] Check coverage if needed
- [ ] Fix issues or update expectations

## Performance

- **Typical runtime:** 1-3 seconds
- **With coverage:** 5-10 seconds
- **Watch mode:** Re-runs on file changes
- **Parallel execution:** Up to 50% CPU cores

## Next Steps

1. Run `npm test` to see current status
2. Review `test/README.md` for detailed documentation
3. Check `test/EXAMPLES.md` for test patterns
4. Implement new tests following existing structure
5. Update documentation when adding features

## Support

For detailed information:
- Full documentation: `test/README.md`
- Test examples: `test/EXAMPLES.md`
- Test summary: `test/TEST_SUMMARY.md`
