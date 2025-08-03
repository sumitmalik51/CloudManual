const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  constructor() {
    // Validate JWT secret on startup
    this.validateJWTSecret();
    
    // Token blacklist for basic session management
    this.blacklistedTokens = new Set();
    
    // Rate limiting store for login attempts
    this.loginAttempts = new Map();
    
    // Clean up expired attempts every hour
    setInterval(() => this.cleanupLoginAttempts(), 60 * 60 * 1000);
  }

  /**
   * Validate JWT secret strength
   */
  validateJWTSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (secret.length < 32) {
      console.warn('⚠️  JWT_SECRET should be at least 32 characters for better security');
    }
    if (secret === 'your-super-secret-jwt-key-here-change-in-production') {
      throw new Error('JWT_SECRET must be changed from default value in production');
    }
  }

  /**
   * Hash password securely
   * @param {string} password 
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param {string} password 
   * @param {string} hash 
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   * @param {Object} payload 
   * @param {string} expiresIn 
   * @returns {string}
   */
  generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn,
      issuer: 'cloudmanual-blog',
      audience: 'cloudmanual-admin'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token 
   * @returns {Object|null}
   */
  verifyToken(token) {
    try {
      // Check if token is blacklisted
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been revoked');
      }

      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'cloudmanual-blog',
        audience: 'cloudmanual-admin'
      });
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Blacklist a token (for logout/session invalidation)
   * @param {string} token 
   */
  blacklistToken(token) {
    this.blacklistedTokens.add(token);
    
    // Clean up old tokens periodically to prevent memory leak
    if (this.blacklistedTokens.size > 1000) {
      this.cleanupBlacklistedTokens();
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  cleanupBlacklistedTokens() {
    const tokensToRemove = [];
    
    for (const token of this.blacklistedTokens) {
      try {
        // Try to decode without verification to check expiry
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp && decoded.exp < Date.now() / 1000) {
          tokensToRemove.push(token);
        }
      } catch (error) {
        // If we can't decode, remove it
        tokensToRemove.push(token);
      }
    }
    
    tokensToRemove.forEach(token => this.blacklistedTokens.delete(token));
    console.log(`Cleaned up ${tokensToRemove.length} expired blacklisted tokens`);
  }

  /**
   * Check rate limiting for login attempts
   * @param {string} identifier - IP address or username
   * @returns {boolean} - true if rate limit exceeded
   */
  isRateLimited(identifier) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    if (!this.loginAttempts.has(identifier)) {
      this.loginAttempts.set(identifier, { count: 0, resetTime: now + windowMs });
      return false;
    }

    const attempts = this.loginAttempts.get(identifier);
    
    if (now > attempts.resetTime) {
      // Reset the counter
      this.loginAttempts.set(identifier, { count: 0, resetTime: now + windowMs });
      return false;
    }

    return attempts.count >= maxAttempts;
  }

  /**
   * Record a login attempt
   * @param {string} identifier - IP address or username
   * @param {boolean} success - whether the attempt was successful
   */
  recordLoginAttempt(identifier, success) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    if (!this.loginAttempts.has(identifier)) {
      this.loginAttempts.set(identifier, { count: 0, resetTime: now + windowMs });
    }

    const attempts = this.loginAttempts.get(identifier);
    
    if (now > attempts.resetTime) {
      // Reset the counter
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }

    if (!success) {
      attempts.count++;
    } else {
      // Reset on successful login
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }
  }

  /**
   * Clean up expired login attempts
   */
  cleanupLoginAttempts() {
    const now = Date.now();
    const toDelete = [];
    
    for (const [identifier, attempts] of this.loginAttempts) {
      if (now > attempts.resetTime) {
        toDelete.push(identifier);
      }
    }
    
    toDelete.forEach(identifier => this.loginAttempts.delete(identifier));
    console.log(`Cleaned up ${toDelete.length} expired login attempt records`);
  }

  /**
   * Validate password strength
   * @param {string} password 
   * @returns {Object} - validation result
   */
  validatePasswordStrength(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common weak passwords
    const weakPasswords = [
      'password', 'admin123', '123456', 'qwerty', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'admin'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Log authentication events for audit
   * @param {string} event 
   * @param {string} identifier 
   * @param {Object} metadata 
   */
  logAuthEvent(event, identifier, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      identifier,
      ip: metadata.ip || 'unknown',
      userAgent: metadata.userAgent || 'unknown',
      success: metadata.success || false,
      ...(metadata.error && { error: metadata.error })
    };

    console.log('🔐 AUTH EVENT:', JSON.stringify(logEntry));
    
    // In a production environment, you would send this to a proper logging service
    // like Winston, Elasticsearch, or a cloud logging service
  }
}

module.exports = new AuthService();