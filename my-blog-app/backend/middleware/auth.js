const authService = require('../services/auth');
const { body, validationResult } = require('express-validator');

/**
 * Enhanced JWT middleware for protected routes
 */
const authenticateToken = (req, res, next) => {
  let token = null;

  // Try to get token from Authorization header first (for API calls)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // If no header token, try to get from httpOnly cookie (for web app)
  if (!token && req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    authService.logAuthEvent('TOKEN_MISSING', req.ip, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      path: req.path
    });
    
    return res.status(401).json({ 
      message: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    authService.logAuthEvent('TOKEN_INVALID', req.ip, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      path: req.path,
      error: 'Invalid or expired token'
    });
    
    // Clear the cookie if it exists
    if (req.cookies && req.cookies.authToken) {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }

  req.user = decoded;
  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (req, res, next) => {
  const identifier = req.ip; // Could also use req.body.username if available
  
  if (authService.isRateLimited(identifier)) {
    authService.logAuthEvent('RATE_LIMITED', identifier, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      path: req.path
    });
    
    return res.status(429).json({
      message: 'Too many login attempts. Please try again later.',
      code: 'RATE_LIMITED',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
  
  next();
};

/**
 * Input validation for login endpoint
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      authService.logAuthEvent('VALIDATION_FAILED', req.body.username || req.ip, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        path: req.path,
        errors: errors.array()
      });
      
      return res.status(400).json({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Input validation for password change endpoint
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .custom((value) => {
      const validation = authService.validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('; '));
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self'"
  );
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * CSRF protection middleware (basic implementation)
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and API token auth
  if (req.method === 'GET' || req.headers['authorization']) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authRateLimit,
  validateLogin,
  validatePasswordChange,
  securityHeaders,
  csrfProtection
};