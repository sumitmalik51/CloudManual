const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { 
  authRateLimit, 
  validateLogin, 
  validatePasswordChange,
  authenticateToken 
} = require('../middleware/auth');

// Store admin credentials (in production, this should be in a database)
let adminCredentials = {
  username: 'admin',
  // This will be set during first setup or password change
  passwordHash: null
};

/**
 * POST /api/auth/login - Admin login
 */
router.post('/login', authRateLimit, validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    // Check if this is first-time setup
    if (!adminCredentials.passwordHash) {
      authService.logAuthEvent('FIRST_TIME_SETUP_REQUIRED', username, {
        ip: clientIP,
        userAgent,
        success: false
      });
      
      return res.status(403).json({
        message: 'First-time setup required. Please set admin password.',
        code: 'SETUP_REQUIRED',
        setupEndpoint: '/api/auth/setup'
      });
    }

    // Verify credentials
    if (username !== adminCredentials.username) {
      authService.recordLoginAttempt(clientIP, false);
      authService.logAuthEvent('LOGIN_FAILED', username, {
        ip: clientIP,
        userAgent,
        success: false,
        error: 'Invalid username'
      });
      
      return res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isValidPassword = await authService.verifyPassword(password, adminCredentials.passwordHash);
    if (!isValidPassword) {
      authService.recordLoginAttempt(clientIP, false);
      authService.logAuthEvent('LOGIN_FAILED', username, {
        ip: clientIP,
        userAgent,
        success: false,
        error: 'Invalid password'
      });
      
      return res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Successful login
    authService.recordLoginAttempt(clientIP, true);
    
    const token = authService.generateToken({ 
      username: adminCredentials.username,
      type: 'admin'
    });

    authService.logAuthEvent('LOGIN_SUCCESS', username, {
      ip: clientIP,
      userAgent,
      success: true
    });

    // Set httpOnly cookie for web app
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      token, // Also return for API clients that prefer headers
      user: { 
        username: adminCredentials.username,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    authService.logAuthEvent('LOGIN_ERROR', req.body.username || 'unknown', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      error: error.message
    });
    
    res.status(500).json({ 
      message: 'Login error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/setup - First-time admin setup
 */
router.post('/setup', validatePasswordChange, async (req, res) => {
  try {
    // Only allow setup if no password is set
    if (adminCredentials.passwordHash) {
      return res.status(403).json({
        message: 'Admin account already configured',
        code: 'ALREADY_CONFIGURED'
      });
    }

    const { newPassword } = req.body;

    // Validate password strength
    const validation = authService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        errors: validation.errors
      });
    }

    // Hash and store password
    adminCredentials.passwordHash = await authService.hashPassword(newPassword);

    authService.logAuthEvent('SETUP_COMPLETE', 'admin', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Admin account configured successfully',
      code: 'SETUP_COMPLETE'
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      message: 'Setup error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout - Logout
 */
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Get token from header or cookie
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (token) {
      // Blacklist the token
      authService.blacklistToken(token);
    }

    // Clear the cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    authService.logAuthEvent('LOGOUT', req.user.username, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Logged out successfully',
      code: 'LOGOUT_SUCCESS'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/change-password - Change admin password
 */
router.post('/change-password', authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    if (!adminCredentials.passwordHash) {
      return res.status(400).json({
        message: 'No password set',
        code: 'NO_PASSWORD'
      });
    }

    const isValidPassword = await authService.verifyPassword(currentPassword, adminCredentials.passwordHash);
    if (!isValidPassword) {
      authService.logAuthEvent('PASSWORD_CHANGE_FAILED', req.user.username, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        error: 'Invalid current password'
      });
      
      return res.status(401).json({
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Validate new password strength
    const validation = authService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'New password does not meet requirements',
        code: 'WEAK_PASSWORD',
        errors: validation.errors
      });
    }

    // Hash and store new password
    adminCredentials.passwordHash = await authService.hashPassword(newPassword);

    authService.logAuthEvent('PASSWORD_CHANGED', req.user.username, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Password changed successfully',
      code: 'PASSWORD_CHANGED'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      message: 'Password change error',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      username: req.user.username,
      type: req.user.type || 'admin'
    },
    authenticated: true
  });
});

/**
 * GET /api/auth/status - Check authentication status
 */
router.get('/status', (req, res) => {
  const setupRequired = !adminCredentials.passwordHash;
  
  res.json({
    setupRequired,
    configured: !setupRequired,
    version: '2.0.0'
  });
});

module.exports = router;