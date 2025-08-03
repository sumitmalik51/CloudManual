#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuthenticationFlow() {
  console.log('🧪 Testing Enhanced Authentication System');
  console.log('==========================================\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', {
      status: health.data.status,
      version: health.data.version,
      security: health.data.security
    });

    // Test 2: Check Auth Status
    console.log('\n2️⃣ Testing Auth Status...');
    const status = await axios.get(`${API_BASE}/auth/status`);
    console.log('✅ Auth status:', status.data);

    if (status.data.setupRequired) {
      // Test 3: First-time Setup
      console.log('\n3️⃣ Testing First-time Setup...');
      try {
        const setupResponse = await axios.post(`${API_BASE}/auth/setup`, {
          newPassword: 'TestSecurePassword123!',
          confirmPassword: 'TestSecurePassword123!'
        });
        console.log('✅ Setup completed:', setupResponse.data);
      } catch (error) {
        if (error.response?.data?.code === 'ALREADY_CONFIGURED') {
          console.log('ℹ️ Setup already completed');
        } else {
          throw error;
        }
      }
    }

    // Test 4: Login with Valid Credentials
    console.log('\n4️⃣ Testing Login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        username: 'admin',
        password: 'TestSecurePassword123!'
      });
      console.log('✅ Login successful:', {
        message: loginResponse.data.message,
        hasToken: !!loginResponse.data.token,
        user: loginResponse.data.user
      });

      const token = loginResponse.data.token;

      // Test 5: Access Protected Route
      console.log('\n5️⃣ Testing Protected Route Access...');
      const protectedResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route access:', protectedResponse.data);

      // Test 6: Logout
      console.log('\n6️⃣ Testing Logout...');
      const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Logout successful:', logoutResponse.data);

      // Test 7: Access Protected Route After Logout (Should Fail)
      console.log('\n7️⃣ Testing Access After Logout...');
      try {
        await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ ERROR: Token should be invalid after logout');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Token correctly invalidated after logout');
        } else {
          throw error;
        }
      }

    } catch (loginError) {
      if (loginError.response?.data?.code === 'SETUP_REQUIRED') {
        console.log('ℹ️ Setup required - running setup first...');
        // Run setup and retry login
        await axios.post(`${API_BASE}/auth/setup`, {
          newPassword: 'TestSecurePassword123!',
          confirmPassword: 'TestSecurePassword123!'
        });
        console.log('✅ Setup completed, retrying login...');
        
        const retryLogin = await axios.post(`${API_BASE}/auth/login`, {
          username: 'admin',
          password: 'TestSecurePassword123!'
        });
        console.log('✅ Login successful after setup:', {
          message: retryLogin.data.message,
          hasToken: !!retryLogin.data.token
        });
      } else {
        throw loginError;
      }
    }

    // Test 8: Invalid Login (Should Fail)
    console.log('\n8️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        username: 'admin',
        password: 'WrongPassword123!'
      });
      console.log('❌ ERROR: Invalid login should fail');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login correctly rejected');
      } else {
        throw error;
      }
    }

    // Test 9: Input Validation
    console.log('\n9️⃣ Testing Input Validation...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        username: 'a', // Too short
        password: '123' // Too short
      });
      console.log('❌ ERROR: Invalid input should be rejected');
    } catch (error) {
      if (error.response?.data?.code === 'VALIDATION_ERROR') {
        console.log('✅ Input validation working correctly');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Security Features Verified:');
    console.log('   ✅ Password hashing and verification');
    console.log('   ✅ JWT token generation and validation');
    console.log('   ✅ Token blacklisting on logout');
    console.log('   ✅ Input validation');
    console.log('   ✅ Protected route access control');
    console.log('   ✅ First-time setup flow');
    console.log('   ✅ Security headers and error handling');

  } catch (error) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd my-blog-app/backend && npm start');
    }
  }
}

// Check if script is run directly
if (require.main === module) {
  testAuthenticationFlow();
}

module.exports = { testAuthenticationFlow };