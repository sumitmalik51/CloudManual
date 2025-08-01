const cosmosDB = require('./services/cosmosDB');

async function updateAllPostsWithAuthor() {
  try {
    console.log('🔄 Starting to update all posts with author information...\n');
    
    // Get all posts
    const posts = await cosmosDB.getAllPosts({ limit: 100 });
    console.log(`📚 Found ${posts.length} posts to update\n`);
    
    let updateCount = 0;
    let errorCount = 0;
    
    for (const post of posts) {
      try {
        console.log(`📝 Updating: "${post.title}"`);
        
        // Update the post with author information
        const updatedPost = {
          ...post,
          authorSlug: 'sumit-malik'
        };
        
        // Remove any fields that shouldn't be updated
        delete updatedPost._rid;
        delete updatedPost._self;
        delete updatedPost._etag;
        delete updatedPost._attachments;
        delete updatedPost._ts;
        
        await cosmosDB.updatePost(post.id, updatedPost);
        
        console.log(`   ✅ Successfully updated "${post.title}"`);
        updateCount++;
        
      } catch (error) {
        console.log(`   ❌ Failed to update "${post.title}": ${error.message}`);
        errorCount++;
      }
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
    console.error('💥 Error updating posts:', error);
  }
}

// Run the update
updateAllPostsWithAuthor();
