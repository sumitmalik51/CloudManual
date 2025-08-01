const axios = require('axios');

async function updateAllPostsViaAPI() {
  try {
    console.log('🔄 Starting to update all posts with author information via API...\n');
    
    // First, let's try to login to get JWT token
    let token = null;
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/posts/admin/login', {
        username: 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      token = loginResponse.data.token;
      console.log('✅ Successfully logged in as admin\n');
    } catch (loginError) {
      console.log('❌ Could not login as admin:', loginError.response?.data?.message || loginError.message);
      return;
    }
    
    // Get all posts
    const postsResponse = await axios.get('http://localhost:5000/api/posts?limit=100');
    const posts = postsResponse.data.posts;
    
    console.log(`📚 Found ${posts.length} posts to update\n`);
    
    let updateCount = 0;
    let errorCount = 0;
    
    for (const post of posts) {
      try {
        console.log(`📝 Updating: "${post.title}"`);
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Use the correct admin endpoint with JWT
        let updateUrl = `http://localhost:5000/api/posts/admin/${post.id}`;
        
        const updateData = {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          author: post.author,
          authorSlug: 'sumit-malik',
          tags: post.tags || [],
          category: post.category,
          status: post.status || 'published',
          featuredImage: post.featuredImage,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription
        };
        
        await axios.put(updateUrl, updateData, { headers });
        
        console.log(`   ✅ Successfully updated "${post.title}"`);
        updateCount++;
        
      } catch (error) {
        console.log(`   ❌ Failed to update "${post.title}": ${error.response?.data?.message || error.message}`);
        errorCount++;
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n🎉 Update Summary:`);
    console.log(`   ✅ Successfully updated: ${updateCount} posts`);
    console.log(`   ❌ Failed to update: ${errorCount} posts`);
    console.log(`   📊 Total processed: ${posts.length} posts`);
    
    if (updateCount > 0) {
      console.log(`\n🚀 Great! Now all your posts will show the author card.`);
      console.log(`Visit any blog post at http://localhost:5173/blog to see your author information!`);
    }
    
  } catch (error) {
    console.error('💥 Error updating posts:', error.response?.data || error.message);
  }
}

// Run the update
updateAllPostsViaAPI();
