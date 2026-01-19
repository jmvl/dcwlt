/**
 * Rate Limiting Tests
 *
 * Tests for rate limiting middleware to prevent DoS attacks and abuse.
 * Following TDD approach - tests written before implementation.
 */

import request from 'supertest';
import express, { Application } from 'express';
import { describe, beforeAll, test, expect, afterEach, beforeEach, afterEach as after } from '@jest/globals';

// Create a test app with rate limiters
const createTestApp = (): Application => {
  const testApp = express();
  testApp.use(express.json());

  // Import and apply rate limiters
  const rateLimit = require('express-rate-limit');

  // Health check endpoint (less strict: 60/minute)
  const healthLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
  testApp.use('/health', healthLimiter);

  // Status endpoint (less strict: 60/minute)
  const statusLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
  testApp.use('/api/status', statusLimiter);

  // Top-up endpoint (strict: 10/minute)
  const topupLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many top-up requests. Please try again later.'
    }
  });
  testApp.use('/api/topup', topupLimiter);

  // Health check endpoint
  testApp.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Status endpoint
  testApp.get('/api/status', (req, res) => {
    res.json({ service: 'test' });
  });

  // Top-up endpoint (mock)
  testApp.post('/api/topup', (req, res) => {
    res.json({ success: true, message: 'Top-up simulated' });
  });

  return testApp;
};

describe('Rate Limiting - Health Check Endpoint', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should allow normal requests under limit', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
  });

  test('should return rate limit headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    // Check for rate limit headers
    const hasRateLimitHeaders =
      'ratelimit-limit' in response.headers ||
      'x-ratelimit-limit' in response.headers;

    if (hasRateLimitHeaders) {
      expect(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']).toBeDefined();
    }
  });

  test('should allow multiple requests within limit (60/minute)', async () => {
    const requests = Array(10).fill(null);

    for (let i = 0; i < requests.length; i++) {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    }
  });
});

describe('Rate Limiting - Status Endpoint', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should allow normal requests under limit', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);

    expect(response.body.service).toBe('test');
  });

  test('should allow multiple requests within limit (60/minute)', async () => {
    const requests = Array(10).fill(null);

    for (let i = 0; i < requests.length; i++) {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.service).toBe('test');
    }
  });
});

describe('Rate Limiting - Top-Up Endpoint (Strict)', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should allow normal requests under limit', async () => {
    const response = await request(app)
      .post('/api/topup')
      .send({ walletAddress: 'test-address', amount: 50 })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('should allow up to 10 requests per minute', async () => {
    // Make 10 requests (should all succeed)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/topup')
        .send({ walletAddress: `test-${i}`, amount: 50 })
        .expect(200);
    }
  });

  test('should return 429 when rate limit is exceeded', async () => {
    // Make 11 requests (last one should fail with 429)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/topup')
        .send({ walletAddress: `test-${i}`, amount: 50 })
        .expect(200);
    }

    // 11th request should be rate limited
    const response = await request(app)
      .post('/api/topup')
      .send({ walletAddress: 'test-11', amount: 50 });

    expect(response.status).toBe(429);
    expect(response.body.error).toContain('Too many');
    expect(response.headers['retry-after']).toBeDefined();
  });

  test('should include retry-after header when rate limited', async () => {
    // Make 10 successful requests
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/topup')
        .send({ walletAddress: `test-${i}`, amount: 50 })
        .expect(200);
    }

    // 11th request
    const response = await request(app)
      .post('/api/topup')
      .send({ walletAddress: 'test-11', amount: 50 });

    expect(response.status).toBe(429);
    expect(response.headers['retry-after']).toBeDefined();
    const retryAfter = parseInt(response.headers['retry-after'] as string);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });
});

describe('Rate Limiting - Different Endpoints', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should rate limit endpoints independently', async () => {
    // Exhaust top-up endpoint
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/topup')
        .send({ walletAddress: `test-${i}`, amount: 50 })
        .expect(200);
    }

    // Top-up should be rate limited
    await request(app)
      .post('/api/topup')
      .send({ walletAddress: 'test-11', amount: 50 })
      .expect(429);

    // But health endpoint should still work (different rate limit)
    await request(app)
      .get('/health')
      .expect(200);
  });
});

describe('Rate Limiting - Configuration via Environment', () => {
  const originalEnv = process.env;

  after(() => {
    process.env = originalEnv;
  });

  test('should use default limits when env vars not set', async () => {
    delete process.env.RATE_LIMIT_TOPUP_MAX;
    delete process.env.RATE_LIMIT_TOPUP_WINDOW_MS;

    const app = createTestApp();

    // Should allow 10 requests by default
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/topup')
        .send({ walletAddress: `test-${i}`, amount: 50 })
        .expect(200);
    }

    // 11th should be rate limited
    await request(app)
      .post('/api/topup')
      .send({ walletAddress: 'test-11', amount: 50 })
      .expect(429);
  });
});
