# CloudManual Blog - Security Enhanced Version

A secure, modern blog platform with enterprise-level authentication and security features.

## 🚀 Quick Start

### 1. Setup Security Secrets
```bash
node generate-secrets.js
```
Copy the generated secrets to your `.env` files.

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Environment
Create `.env` files in both `my-blog-app/backend/` and `my-blog-app/frontend/` directories using the provided `.env.example` templates.

### 4. Start the Application
```bash
# Start backend (development)
npm run backend:dev

# Start frontend (in another terminal)
npm run frontend:start
```

### 5. Initial Setup
1. Navigate to `http://localhost:5173/admin/setup`
2. Create your secure admin password
3. Login at `http://localhost:5173/admin/login`

## 🔒 Security Features

### ✅ **Authentication Security**
- Bcrypt password hashing (12 rounds)
- JWT token-based authentication
- HttpOnly cookies for secure token storage
- Token blacklisting for secure logout
- Rate limiting (5 attempts per 15 minutes)
- Password strength validation

### ✅ **Input Security**
- Comprehensive input validation
- SQL injection prevention
- XSS protection with security headers
- CSRF protection

### ✅ **Session Security**
- Secure session management
- Automatic token expiry
- Server-side token invalidation
- Memory-efficient cleanup

### ✅ **Infrastructure Security**
- Security headers (CSP, XSS, etc.)
- Environment validation
- Production security checks
- Audit logging

## 📁 Project Structure

```
CloudManual/
├── my-blog-app/
│   ├── backend/           # Node.js Express API
│   │   ├── services/      # Authentication & database services
│   │   ├── middleware/    # Security middleware
│   │   ├── routes/        # API routes
│   │   └── test/          # Backend tests
│   └── frontend/          # React TypeScript app
│       ├── src/           # Source code
│       └── public/        # Static assets
├── generate-secrets.js    # Security setup helper
├── test-auth-flow.js     # Authentication testing script
└── AUTHENTICATION_SECURITY_IMPROVEMENTS.md
```

## 🧪 Testing

### Backend Tests
```bash
npm run backend:test
```

### Frontend Tests
```bash
npm run frontend:test
```

### Authentication Flow Test
```bash
npm run test-auth
```

## 🛠️ Development Scripts

```bash
# Setup
npm run setup                 # Generate security secrets
npm run install-all          # Install all dependencies

# Backend
npm run backend:start        # Start production server
npm run backend:dev          # Start development server
npm run backend:test         # Run backend tests

# Frontend
npm run frontend:start       # Start development server
npm run frontend:build       # Build for production
npm run frontend:test        # Run frontend tests

# Testing
npm run test-auth           # Test authentication flow
```

## 📋 Environment Configuration

### Backend Environment Variables

```bash
# Required
JWT_SECRET=your-64-char-secret-from-generate-secrets
MONGODB_URI=your-database-connection

# Optional (with defaults)
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
TRUST_PROXY=false
```

### Frontend Environment Variables

```bash
VITE_API_URL=http://localhost:5000/api
```

## 🔧 Production Deployment

### 1. Security Checklist
- [ ] Generate strong JWT secrets (`npm run setup`)
- [ ] Set `NODE_ENV=production`
- [ ] Set `COOKIE_SECURE=true` (requires HTTPS)
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/cloudflare)
- [ ] Set up monitoring and logging

### 2. Build & Deploy
```bash
# Build frontend
npm run frontend:build

# Start production backend
npm run backend:start
```

## 🔍 Security Improvements Summary

### Issues Fixed ✅
- **Password Storage**: Replaced plain text with bcrypt hashing
- **Token Security**: Moved from localStorage to httpOnly cookies
- **Session Management**: Added server-side token blacklisting
- **Rate Limiting**: Implemented authentication-specific rate limiting
- **Input Validation**: Added comprehensive validation with express-validator
- **Default Credentials**: Removed hardcoded passwords, added setup flow
- **Duplicate Systems**: Consolidated to single JWT-based authentication
- **Security Headers**: Added CSP, XSS protection, and more

### New Features ✅
- First-time admin setup with password strength validation
- Real-time password strength checking
- Comprehensive audit logging
- Automatic token cleanup
- Enhanced error handling with specific codes
- Production security validation

## 📖 Documentation

- [Complete Security Improvements Guide](./AUTHENTICATION_SECURITY_IMPROVEMENTS.md)
- [API Documentation](./AUTHENTICATION_SECURITY_IMPROVEMENTS.md#-api-endpoints)
- [Testing Guide](./AUTHENTICATION_SECURITY_IMPROVEMENTS.md#-testing)

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if JWT_SECRET is set
node -e "console.log(process.env.JWT_SECRET ? 'JWT_SECRET is set' : 'JWT_SECRET missing')"

# Regenerate secrets
npm run setup
```

**Authentication not working:**
```bash
# Test the auth flow
npm run test-auth
```

**Frontend build errors:**
```bash
# Install with legacy peer deps
cd my-blog-app/frontend && npm install --legacy-peer-deps
```

## 📝 Version History

### Version 2.0.0 - Security Overhaul
- Complete authentication system rewrite
- Enterprise-level security features
- Comprehensive testing suite
- Production-ready configuration

### Version 1.x - Legacy
- Basic authentication
- Simple password system
- Limited security features

---

**⚠️ Important:** This is a major security update. Test thoroughly before deploying to production.

**🔒 Security:** Report security issues responsibly through appropriate channels.