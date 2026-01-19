/**
 * Rate Limiting Integration Tests
 *
 * Tests for rate limiting on the actual server implementation.
 * These tests verify that rate limiting works correctly in the real application.
 */

import request from 'supertest';
import { describe, beforeAll, afterAll, test, expect, beforeEach } from '@jest/globals';
import { app } from '../../src/server';

// Valid Solana address for testing (a real devnet address)
const VALID_WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

describe('Rate Limiting Integration - Real Server', () => {
  // Test health endpoint rate limiting
  describe('Health Endpoint', () => {
    test('should allow normal requests', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for standard rate limit headers
      const rateLimitInfo = response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit'];
      expect(rateLimitInfo).toBeDefined();
    });
  });

  // Test status endpoint rate limiting
  describe('Status Endpoint', () => {
    test('should allow normal requests', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body.service).toBe('Event Wallet Top-Up Simulation');
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      const rateLimitInfo = response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit'];
      expect(rateLimitInfo).toBeDefined();
    });
  });

  // Test top-up endpoint rate limiting (strict)
  describe('Top-Up Endpoint (Strict)', () => {
    test('should allow normal requests under limit', async () => {
      const response = await request(app)
        .post('/api/topup')
        .send({ walletAddress: VALID_WALLET, amount: 50 });

      // Will either succeed (200) or fail with various errors
      // But should NOT be rate limited (429)
      expect(response.status).not.toBe(429);
    });

    test('should return 429 when rate limit is exceeded', async () => {
      // Make 11 requests with unique identifiers to avoid any caching
      const results = [];
      for (let i = 0; i < 11; i++) {
        const response = await request(app)
          .post('/api/topup')
          .send({ walletAddress: `${VALID_WALLET}-${i}`, amount: 50 });

        results.push({
          index: i,
          status: response.status,
          isRateLimited: response.status === 429
        });
      }

      // At least one request should be rate limited
      const rateLimitedCount = results.filter(r => r.isRateLimited).length;
      expect(rateLimitedCount).toBeGreaterThan(0);

      // Last requests should be rate limited
      expect(results[10].isRateLimited).toBe(true);
    });

    test('should include retry-after header when rate limited', async () => {
      // Make enough requests to trigger rate limiting
      let rateLimitedResponse = null;

      for (let i = 0; i < 15; i++) {
        const response = await request(app)
          .post('/api/topup')
          .send({ walletAddress: `${VALID_WALLET}-retry-${i}`, amount: 50 });

        if (response.status === 429) {
          rateLimitedResponse = response;
          break;
        }
      }

      // Verify we got a rate limited response
      expect(rateLimitedResponse).not.toBeNull();

      // Check retry-after header
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.headers['retry-after']).toBeDefined();

        const retryAfter = parseInt(rateLimitedResponse.headers['retry-after'] as string);
        expect(retryAfter).toBeGreaterThan(0);
        expect(retryAfter).toBeLessThanOrEqual(60);

        // Check error message
        expect(rateLimitedResponse.body.error).toContain('Too many');
      }
    });
  });

  // Test that different endpoints have independent rate limits
  describe('Independent Rate Limits', () => {
    test('should rate limit top-up independently from health', async () => {
      // Make requests to top-up until rate limited
      let topupRateLimited = false;
      for (let i = 0; i < 15; i++) {
        const response = await request(app)
          .post('/api/topup')
          .send({ walletAddress: `${VALID_WALLET}-independent-${i}`, amount: 50 });

        if (response.status === 429) {
          topupRateLimited = true;
          break;
        }
      }

      // Verify top-up is rate limited
      expect(topupRateLimited).toBe(true);

      // But health endpoint should still work
      const healthResponse = await request(app)
        .get('/health');

      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.status).toBe('ok');
    });
  });

  // Test rate limit configuration
  describe('Rate Limit Configuration', () => {
    test('should use configured rate limits', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Verify rate limit headers are present
      const rateLimitLimit = response.headers['ratelimit-limit'];
      const rateLimitRemaining = response.headers['ratelimit-remaining'];

      expect(rateLimitLimit).toBeDefined();
      expect(rateLimitRemaining).toBeDefined();

      // Verify remaining is less than or equal to limit
      const limit = parseInt(rateLimitLimit as string);
      const remaining = parseInt(rateLimitRemaining as string);
      expect(remaining).toBeLessThanOrEqual(limit);
    });
  });
});
