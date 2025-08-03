#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 CloudManual Security Setup Helper');
console.log('====================================\n');

// Generate JWT Secret
console.log('1. JWT Secret Generation:');
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(`   JWT_SECRET=${jwtSecret}\n`);

// Generate Session Secret
console.log('2. Session Secret Generation:');
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(`   SESSION_SECRET=${sessionSecret}\n`);

// Security Recommendations
console.log('3. Security Recommendations:');
console.log('   ✅ Use the generated secrets in your .env file');
console.log('   ✅ Never commit these secrets to version control');
console.log('   ✅ Use different secrets for different environments');
console.log('   ✅ Rotate secrets periodically');
console.log('   ✅ Set NODE_ENV=production in production');
console.log('   ✅ Set COOKIE_SECURE=true when using HTTPS');
console.log('   ✅ Set TRUST_PROXY=true if behind a reverse proxy\n');

// Environment Template
console.log('4. Complete .env Template:');
console.log('   Copy this to your .env file and update the values:');
console.log('   ================================================');
console.log(`
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blogdb
# For Azure Cosmos DB, use your connection string

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=https://yourdomain.com

# Authentication & Security (GENERATED)
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# Security Settings
COOKIE_SECURE=true
TRUST_PROXY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5
`);

console.log('\n🔒 Security Setup Complete!');
console.log('   Next steps:');
console.log('   1. Copy the secrets to your .env file');
console.log('   2. Start the server: npm start');
console.log('   3. Navigate to /admin/setup to create admin account');
console.log('   4. Test the authentication flow');

// Password strength checker
console.log('\n5. Password Strength Requirements:');
console.log('   When setting up your admin password, ensure it has:');
console.log('   ✅ At least 8 characters');
console.log('   ✅ At least one uppercase letter (A-Z)');
console.log('   ✅ At least one lowercase letter (a-z)');
console.log('   ✅ At least one number (0-9)');
console.log('   ✅ At least one special character (!@#$%^&*()_+-=[]{}|;:"\\,.<>?)');
console.log('   ❌ Not a common password (password, admin123, etc.)');

module.exports = {
  generateJWTSecret: () => crypto.randomBytes(64).toString('hex'),
  generateSessionSecret: () => crypto.randomBytes(32).toString('hex')
};