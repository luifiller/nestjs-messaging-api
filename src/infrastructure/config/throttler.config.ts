/**
 * Throttler (Rate Limiting) Configuration
 *
 * Controls the rate at which requests can be made to the API
 * to prevent abuse and ensure fair usage.
 *
 * TTL (Time To Live): defines the time window for rate limiting in milliseconds.
 * LIMIT: defines the maximum number of requests allowed within the TTL.
 */
export const ThrottlerConfig = {
  DEFAULT: {
    TTL: 60000,
    LIMIT: 100,
  },
} as const;
