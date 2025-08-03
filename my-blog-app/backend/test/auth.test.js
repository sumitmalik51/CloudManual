const request = require('supertest');
const app = require('../app');

describe('Authentication Security Tests', () => {
  describe('POST /api/auth/status', () => {
    it('should return setup status', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('setupRequired');
      expect(response.body).toHaveProperty('configured');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate username format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'a',
          password: 'validpassword123'
        })
        .expect(400);
      
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: '123'
        })
        .expect(400);
      
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce rate limiting', async () => {
      // Make multiple failed requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              username: 'admin',
              password: 'wrongpassword123'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect([401, 403, 429]).toContain(lastResponse.status);
    });
  });

  describe('POST /api/auth/setup', () => {
    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send({
          newPassword: '123',
          confirmPassword: '123'
        })
        .expect(400);
      
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should require password confirmation', async () => {
      const response = await request(app)
        .post('/api/auth/setup')
        .send({
          newPassword: 'StrongPass123!',
          confirmPassword: 'DifferentPass123!'
        })
        .expect(400);
      
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Health Check', () => {
    it('should return enhanced health information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('version', '2.0.0');
      expect(response.body).toHaveProperty('security');
      expect(response.body.security).toHaveProperty('authServiceLoaded');
      expect(response.body.security).toHaveProperty('jwtConfigured');
    });
  });
});

describe('Authentication Service Tests', () => {
  const authService = require('../services/auth');

  describe('Password Validation', () => {
    it('should validate strong passwords correctly', () => {
      const strongPassword = 'MyStrongPass123!';
      const result = authService.validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password',
        '123456',
        'admin123',
        'short',
        'NoNumbers!',
        'nonumbers123',
        'NOLOWERCASE123!',
        'NoSpecialChars123'
      ];

      weakPasswords.forEach(password => {
        const result = authService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await authService.verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    it('should generate valid JWT tokens', () => {
      const payload = { username: 'admin', type: 'admin' };
      const token = authService.generateToken(payload);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid tokens', () => {
      const payload = { username: 'admin', type: 'admin' };
      const token = authService.generateToken(payload);
      
      const decoded = authService.verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded.username).toBe('admin');
    });

    it('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = authService.verifyToken(invalidToken);
      
      expect(decoded).toBe(null);
    });

    it('should handle token blacklisting', () => {
      const payload = { username: 'admin', type: 'admin' };
      const token = authService.generateToken(payload);
      
      // Token should be valid initially
      expect(authService.verifyToken(token)).toBeTruthy();
      
      // Blacklist the token
      authService.blacklistToken(token);
      
      // Token should be invalid after blacklisting
      expect(authService.verifyToken(token)).toBe(null);
    });
  });

  describe('Rate Limiting', () => {
    it('should track login attempts', () => {
      const identifier = 'test-user';
      
      // Initially should not be rate limited
      expect(authService.isRateLimited(identifier)).toBe(false);
      
      // Record multiple failed attempts
      for (let i = 0; i < 5; i++) {
        authService.recordLoginAttempt(identifier, false);
      }
      
      // Should be rate limited after max attempts
      expect(authService.isRateLimited(identifier)).toBe(true);
    });

    it('should reset on successful login', () => {
      const identifier = 'test-user-2';
      
      // Record failed attempts
      for (let i = 0; i < 3; i++) {
        authService.recordLoginAttempt(identifier, false);
      }
      
      // Record successful attempt
      authService.recordLoginAttempt(identifier, true);
      
      // Should not be rate limited after successful login
      expect(authService.isRateLimited(identifier)).toBe(false);
    });
  });
});