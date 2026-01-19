/**
 * Jest Test Setup File
 *
 * This file runs before all test suites and sets up:
 * - Test environment variables
 * - Global test utilities
 * - Mock configurations
 * - Test timeout handling
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Generate a test encryption key if not set
if (!process.env.ENCRYPTION_KEY) {
  const crypto = require('crypto');
  process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
}

// Increase timeout for blockchain operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Optionally suppress console output during tests
  // Uncomment the following lines to suppress console output:
  // console.log = jest.fn();
  // console.error = jest.fn();
  // console.warn = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  /**
   * Generate a random wallet ID for testing
   * @returns {string} Random wallet ID
   */
  generateWalletId: () => {
    return `test_wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a random test amount within valid range
   * @param {number} min - Minimum amount (default: 1)
   * @param {number} max - Maximum amount (default: 10000)
   * @returns {number} Random amount
   */
  generateAmount: (min = 1, max = 10000) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Wait for a specified number of milliseconds
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Resolves after timeout
   */
  wait: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Mock Solana connection for faster tests (optional)
// This allows tests to run without actual blockchain connection
// Uncomment and customize if you want to mock Solana operations:
/*
const { Connection } = require('@solana/web3.js');
jest.mock('@solana/web3.js', () => {
  const actual = jest.requireActual('@solana/web3.js');
  return {
    ...actual,
    Connection: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue(1000000),
      getAccountInfo: jest.fn().mockResolvedValue(null),
      sendTransaction: jest.fn().mockResolvedValue('mock-signature'),
      confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    })),
  };
});
*/

console.log('✓ Jest test environment initialized');
console.log('✓ Test utilities loaded');
