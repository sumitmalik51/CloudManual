require('dotenv').config();
const cosmosDB = require('./services/cosmosDB');

async function updateAllPostsWithAuthor() {
  try {
    console.log('🔄 Starting bulk update of all posts with author information...');
    
    // Connect to the database
    await cosmosDB.connect();
    console.log('✅ Connected to CosmosDB');
    
    // Get all posts
    const allPosts = await cosmosDB.getAllPosts();
    console.log(`📝 Found ${allPosts.length} posts to update`);
    
    if (allPosts.length === 0) {
      console.log('ℹ️ No posts found to update');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each post with author information
    for (const post of allPosts) {
      try {
        // Check if post already has authorSlug
        if (post.authorSlug) {
          console.log(`⏭️ Skipping post "${post.title}" - already has authorSlug: ${post.authorSlug}`);
          skippedCount++;
          continue;
        }
        
        // Prepare update data with author information
        const updateData = {
          ...post,
          authorSlug: 'sumit-malik'
        };
        
        // Update the post
        await cosmosDB.updatePost(post.id, updateData);
        console.log(`✅ Updated post: "${post.title}" with authorSlug: sumit-malik`);
        updatedCount++;
        
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error updating post "${post.title}":`, error.message);
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} posts`);
    console.log(`⏭️ Skipped (already had authorSlug): ${skippedCount} posts`);
    console.log(`📝 Total posts processed: ${allPosts.length}`);
    
    if (updatedCount > 0) {
      console.log('\n🎉 Bulk update completed successfully!');
      console.log('📌 All updated posts now have authorSlug: "sumit-malik"');
      console.log('🔗 Author names should now be clickable in blog posts');
    } else {
      console.log('\nℹ️ No posts were updated (all already had author information)');
    }
    
  } catch (error) {
    console.error('❌ Error during bulk update:', error);
    process.exit(1);
  }
}

// Run the update
updateAllPostsWithAuthor()
  .then(() => {
    console.log('\n🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
