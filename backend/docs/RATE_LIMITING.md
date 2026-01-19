# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation for the DCWLT backend API. Rate limiting is used to prevent DoS attacks and abuse of API endpoints.

## Implementation

### Middleware

We use `express-rate-limit` middleware to implement rate limiting on all API endpoints.

### Rate Limits by Endpoint

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `POST /api/topup` | 10 requests | 1 minute | Prevent abuse of top-up functionality |
| `GET /health` | 60 requests | 1 minute | Allow health checks but prevent abuse |
| `GET /api/status` | 60 requests | 1 minute | Allow status checks but prevent abuse |

### Configuration

Rate limits can be configured via environment variables in `.env`:

```bash
# Top-up endpoint (strict - prevents abuse)
RATE_LIMIT_TOPUP_MAX=10
RATE_LIMIT_TOPUP_WINDOW_MS=60000

# Health check endpoint (less strict)
RATE_LIMIT_HEALTH_MAX=60

# Status endpoint (less strict)
RATE_LIMIT_STATUS_MAX=60
```

## Response Headers

When rate limiting is active, the following headers are included in responses:

- `RateLimit-Limit`: The maximum number of requests allowed in the current window
- `RateLimit-Remaining`: The number of requests remaining in the current window
- `RateLimit-Reset`: The timestamp when the current window will reset
- `Retry-After`: The number of seconds to wait before retrying (included in 429 responses)

## Rate Limit Exceeded

When a client exceeds the rate limit, they will receive:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "success": false,
  "error": "Too many top-up requests. Please try again later.",
  "retryAfter": 60
}
```

## Testing

Rate limiting is tested in two ways:

### 1. Unit Tests (`tests/rateLimit.test.ts`)

These tests verify the rate limiting middleware works correctly in isolation:
- Normal requests under limit succeed
- Rate limit headers are returned
- Requests exceeding limit return 429
- Retry-after header is included
- Different endpoints have independent limits

Run with:
```bash
npm test -- tests/rateLimit.test.ts
```

### 2. Integration Tests (`tests/integration/rateLimit.integration.test.ts`)

These tests verify rate limiting works correctly with the actual server implementation:
- Health endpoint rate limiting
- Status endpoint rate limiting
- Top-up endpoint rate limiting (strict)
- Independent rate limits per endpoint

Run with:
```bash
npm test -- tests/integration/rateLimit.integration.test.ts
```

## Security Considerations

1. **IP-based Rate Limiting**: Rate limits are applied per IP address by default
2. **Memory Store**: The default memory store is used (suitable for single-server deployments)
3. **Strict Limits for Sensitive Operations**: Top-up endpoint has stricter limits to prevent token draining
4. **Configurable**: All limits can be adjusted via environment variables

## Production Considerations

For production deployments with multiple servers, consider:

1. **Redis Store**: Use Redis as the rate limit store for distributed systems
   ```bash
   npm install rate-limit-redis
   ```
   ```typescript
   import RedisStore from 'rate-limit-redis';
   import Redis from 'ioredis';

   const limiter = rateLimit({
     store: new RedisStore({
       client: new Redis(),
       prefix: 'rate-limit:'
     }),
     // ... other options
   });
   ```

2. **Higher Limits**: Adjust limits based on your expected traffic
3. **Monitoring**: Monitor rate limit hits to detect abuse patterns
4. **Whitelisting**: Consider whitelisting trusted IPs (e.g., monitoring services)

## Example Usage

### Normal Request (Under Limit)

```bash
curl -X POST http://localhost:3000/api/topup \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU","amount":50}'
```

**Response:**
```json
{
  "success": true,
  "signature": "...",
  "amount": 50,
  "message": "Sent 50 Event Tokens"
}
```

### Rate Limited Request

```bash
# Make 11 requests in quick succession
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/topup \
    -H "Content-Type: application/json" \
    -d "{\"walletAddress\":\"test-$i\",\"amount\":50}"
done
```

**Last Response:**
```json
{
  "success": false,
  "error": "Too many top-up requests. Please try again later.",
  "retryAfter": 60
}
```

**Status Code:** `429`

## Troubleshooting

### Seeing 429 Errors During Development

If you're hitting rate limits during development, you can:

1. **Increase limits temporarily** in `.env`:
   ```bash
   RATE_LIMIT_TOPUP_MAX=100
   RATE_LIMIT_TOPUP_WINDOW_MS=60000
   ```

2. **Wait for the window to reset** (default: 1 minute)

3. **Use different IP addresses** (for testing distributed systems)

### Tests Failing Due to Rate Limits

If tests are failing due to rate limits:

1. **Check test isolation**: Ensure each test creates a fresh app instance
2. **Use unique identifiers**: Make requests with unique parameters per test
3. **Add delays**: Add small delays between requests if needed
4. **Increase limits**: Temporarily increase limits for testing

## Future Enhancements

Potential improvements to the rate limiting system:

1. **User-based Rate Limiting**: Rate limit by user ID instead of IP
2. **Sliding Window**: Use sliding window instead of fixed window for smoother limits
3. **Gradual Retry**: Implement exponential backoff for retry-after
4. **Burst Allowance**: Allow short bursts within the overall limit
5. **Custom Strategies**: Different limits for different user tiers

## References

- [express-rate-limit documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
