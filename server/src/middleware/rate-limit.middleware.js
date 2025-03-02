const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Parse environment variables
const WINDOW_MS = eval(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // Default: 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX) || 100; // Default: 100 requests per window

// Create a standard limiter
const standardLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
});

// Create a stricter limiter for sensitive routes (auth, etc.)
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 20, // Much lower limit for sensitive operations
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = {
  standardLimiter,
  authLimiter,
}; 