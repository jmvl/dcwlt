/**
 * Jest Configuration for Solana POC Backend Tests
 *
 * This configuration is optimized for testing the Express API
 * with proper handling of environment variables, timeouts, and coverage.
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/test'],

  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!test/**',
    '!coverage/**',
    '!jest.config.js'
  ],

  // Coverage thresholds (adjust based on project requirements)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Coverage report formats
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Timeout for tests (increased for blockchain operations)
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests (important for Express apps)
  resetModules: true,

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Global variables
  globals: {
    'test-environment': 'jest'
  },

  // Transform files (if needed)
  transform: {},

  // Coverage directory
  coverageDirectory: 'coverage',

  // Maximum number of parallel tests
  maxWorkers: '50%',

  // Display test results
  reporters: [
    'default'
    // Uncomment if jest-junit is installed:
    // ['jest-junit', {
    //   outputDirectory: 'test-results',
    //   outputName: 'junit.xml'
    // }]
  ]
};
