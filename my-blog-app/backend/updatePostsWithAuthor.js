const axios = require('axios');

async function updatePostsWithAuthor() {
  try {
    console.log('Fetching recent posts to update with author information...\n');
    
    // Get recent posts
    const response = await axios.get('http://localhost:5000/api/posts?limit=5');
    const posts = response.data.posts;
    
    console.log(`Found ${posts.length} posts to update:`);
    
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const post = posts[i];
      console.log(`\n${i + 1}. Updating: "${post.title}"`);
      
      try {
        // Create admin login payload (you'll need to replace with actual admin credentials)
        const loginResponse = await axios.post('http://localhost:5000/api/posts/admin/login', {
          username: 'admin',
          password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        
        // Update the post with author information
        const updateResponse = await axios.put(
          `http://localhost:5000/api/posts/admin/${post.id}`,
          {
            ...post,
            authorSlug: 'sumit-malik'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log(`   ✅ Successfully updated "${post.title}"`);
        
      } catch (error) {
        console.log(`   ❌ Failed to update "${post.title}": ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n✅ Post updates completed!');
    console.log('\nNow you can:');
    console.log('1. Visit any updated blog post to see the author card');
    console.log('2. Visit http://localhost:3000/authors/sumit-malik to see your profile');
    console.log('3. Click on your name or avatar to navigate between posts and profile');
    
  } catch (error) {
    console.error('❌ Error updating posts:', error.response?.data || error.message);
  }
}

updatePostsWithAuthor();
