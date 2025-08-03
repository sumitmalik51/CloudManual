const axios = require('axios');

async function testAuth() {
  try {
    // First, login to get a token
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/posts/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // Then test the admin endpoint with the token
    console.log('\n2. Testing admin endpoint with token...');
    const adminResponse = await axios.get('http://localhost:5000/api/posts/admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin endpoint successful. Posts found:', adminResponse.data.posts?.length || 0);
    
    // Test specific params like frontend uses
    console.log('\n3. Testing with frontend params...');
    const frontendResponse = await axios.get('http://localhost:5000/api/posts/admin?limit=10&page=1', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Frontend-style request successful. Posts found:', frontendResponse.data.posts?.length || 0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAuth();
