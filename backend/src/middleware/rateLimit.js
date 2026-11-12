const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message) =>
  rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message } } });

module.exports = {
  apiLimiter: make(15 * 60 * 1000, 600, 'Too many requests'),
  authLimiter: make(15 * 60 * 1000, 30, 'Too many attempts, please try later'),
  aiLimiter: make(60 * 1000, 10, 'AI analysis rate limit reached'),
};
