const axios = require('axios');

async function testAuthentication() {
  try {
    console.log('🧪 Testing Authentication System');
    console.log('================================');
    
    // Test 1: Try to login via JWT system (what frontend uses)
    console.log('\n1️⃣ Testing JWT Login (/api/posts/admin/login)...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/posts/admin/login', {
        username: 'admin',
        password: 'admin123'
      });
      console.log('✅ JWT Login successful:', loginResponse.data);
      
      const token = loginResponse.data.token;
      
      // Test 2: Try to access protected admin route with JWT token
      console.log('\n2️⃣ Testing Admin Route Access with JWT token...');
      const adminResponse = await axios.get('http://localhost:5000/api/posts/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Admin route access successful:', adminResponse.data.posts?.length, 'posts found');
      
    } catch (jwtError) {
      console.log('❌ JWT system failed:', jwtError.response?.data || jwtError.message);
      
      // Test 3: Try the simple auth system
      console.log('\n3️⃣ Testing Simple Auth (/api/auth/login)...');
      try {
        const simpleResponse = await axios.post('http://localhost:5000/api/auth/login', {
          password: 'admin123'
        });
        console.log('✅ Simple auth successful:', simpleResponse.data);
      } catch (simpleError) {
        console.log('❌ Simple auth also failed:', simpleError.response?.data || simpleError.message);
      }
    }
    
    // Test 4: Check if server is running
    console.log('\n4️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Server is not responding:', healthError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthentication();
