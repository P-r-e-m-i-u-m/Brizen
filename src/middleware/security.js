/**
 * @file security.js
 * @description Security headers middleware (replaces helmet for fine-grained control)
 * @updated 2026-05-02
 */
const securityHeaders = (req, res, next) => {
  const headers = req.headers || {};
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'");
  res.setHeader("X-Request-ID", headers["x-request-id"] || Date.now().toString(36));
  next();
};

module.exports = { securityHeaders };
// build: 1777719080
