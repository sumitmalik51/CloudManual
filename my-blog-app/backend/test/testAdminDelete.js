// Quick test to verify admin delete functionality
const axios = require('axios');

async function testAdminDelete() {
  try {
    console.log('🧪 Testing Admin Delete Functionality');
    console.log('=====================================');

    // First, get the list of current posts
    console.log('📋 Getting current posts...');
    const postsResponse = await axios.get('http://localhost:5000/api/posts');
    const initialPosts = postsResponse.data.posts;
    console.log(`Found ${initialPosts.length} posts initially`);
    
    if (initialPosts.length === 0) {
      console.log('❌ No posts found to test delete functionality');
      return;
    }

    // Pick the first post to delete
    const postToDelete = initialPosts[0];
    console.log(`\n🎯 Selected post to delete: "${postToDelete.title}" (ID: ${postToDelete.id})`);

    // Try to delete it using the admin endpoint (without proper JWT for now)
    console.log('\n🗑️ Attempting to delete post...');
    
    try {
      // Simulate the admin panel delete request
      const deleteResponse = await axios.delete(`http://localhost:5000/api/posts/admin/${postToDelete.id}`, {
        headers: {
          'Authorization': 'Bearer temp-admin-token' // This will fail, but we can check the error
        }
      });
      console.log('✅ Delete request succeeded:', deleteResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔒 Delete request failed due to authentication (expected)');
        console.log('ℹ️  This means the delete endpoint is protected, which is correct');
        
        // Let's try to access the post directly to see if it still exists
        console.log('\n🔍 Checking if post still exists...');
        try {
          const checkResponse = await axios.get(`http://localhost:5000/api/posts/${postToDelete.id}`);
          console.log('✅ Post still exists (delete was not executed due to auth failure)');
        } catch (checkError) {
          if (checkError.response?.status === 404) {
            console.log('❓ Post not found - may have been deleted or not exist');
          } else {
            console.log('❌ Error checking post existence:', checkError.message);
          }
        }
      } else if (error.response?.status === 500) {
        console.log('❌ Delete request failed with 500 Internal Server Error');
        console.log('Error details:', error.response.data);
        console.log('This indicates the delete functionality has issues');
      } else {
        console.log('❌ Delete request failed:', error.message);
        if (error.response) {
          console.log('Response status:', error.response.status);
          console.log('Response data:', error.response.data);
        }
      }
    }

    // Check posts count after delete attempt
    console.log('\n📊 Checking posts count after delete attempt...');
    const finalPostsResponse = await axios.get('http://localhost:5000/api/posts');
    const finalPosts = finalPostsResponse.data.posts;
    console.log(`Found ${finalPosts.length} posts after delete attempt`);
    
    if (finalPosts.length < initialPosts.length) {
      console.log('✅ Post count decreased - hard delete was successful');
    } else if (finalPosts.length === initialPosts.length) {
      // Check if the post is still there but marked as deleted
      const postStillExists = finalPosts.find(p => p.id === postToDelete.id);
      if (postStillExists) {
        if (postStillExists.status === 'deleted') {
          console.log('⚠️ Post was soft-deleted (marked as deleted but still in database)');
        } else {
          console.log('ℹ️ Post still exists unchanged (delete was not executed)');
        }
      } else {
        console.log('🤔 Post was removed from public view but count unchanged (filtered soft delete)');
      }
    }

    console.log('\n✅ Admin delete test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminDelete();
