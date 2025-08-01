// Direct test of the deletePost method without authentication
const cosmosDB = require('../services/cosmosDB');

async function testDirectDelete() {
  try {
    console.log('🧪 Testing Direct Delete Method');
    console.log('===============================');

    // Get the current posts to find one to delete
    console.log('📋 Getting current posts...');
    const allPosts = await cosmosDB.getAllPosts({ limit: 1000 });
    console.log(`Found ${allPosts.length} posts`);
    
    if (allPosts.length === 0) {
      console.log('❌ No posts found to test delete functionality');
      return;
    }

    // Find the last post (newest) to delete
    const postToDelete = allPosts[allPosts.length - 1];
    console.log(`\n🎯 Selected post to delete: "${postToDelete.title}" (ID: ${postToDelete.id})`);
    console.log(`Post status: ${postToDelete.status}`);
    console.log(`Post type: ${postToDelete.type}`);

    // Test the delete method directly
    console.log('\n🗑️ Calling cosmosDB.deletePost() directly...');
    const deleteResult = await cosmosDB.deletePost(postToDelete.id);
    
    console.log('Delete result:', deleteResult);
    
    if (deleteResult.success) {
      if (deleteResult.method === 'hard-delete') {
        console.log('✅ SUCCESS: Post was hard-deleted (permanently removed)');
      } else if (deleteResult.method === 'soft-delete') {
        console.log('⚠️ WARNING: Post was soft-deleted (marked as deleted)');
        console.log('🔧 This means all hard delete strategies failed');
      }
    }

    // Verify the result
    console.log('\n🔍 Verifying delete result...');
    
    // Try to get the post directly
    try {
      const deletedPost = await cosmosDB.getPost(postToDelete.id);
      if (deletedPost) {
        if (deletedPost.status === 'deleted') {
          console.log('📋 Post found but marked as deleted (soft delete confirmed)');
        } else {
          console.log('❌ Post still exists and not marked as deleted');
        }
      } else {
        console.log('✅ Post not found (hard delete confirmed)');
      }
    } catch (error) {
      if (error.message.includes('Post not found')) {
        console.log('✅ Post not found (hard delete confirmed)');
      } else {
        console.log('❌ Error checking post:', error.message);
      }
    }

    // Check if it appears in getAllPosts
    console.log('\n📊 Checking if post appears in getAllPosts...');
    const updatedPosts = await cosmosDB.getAllPosts({ limit: 1000 });
    const deletedPostInList = updatedPosts.find(p => p.id === postToDelete.id);
    
    if (!deletedPostInList) {
      console.log('✅ Post does not appear in getAllPosts (properly filtered)');
    } else {
      console.log('❌ Post still appears in getAllPosts');
    }

    console.log(`\n📈 Post count: ${allPosts.length} → ${updatedPosts.length}`);

    console.log('\n🎉 Direct delete test completed');

  } catch (error) {
    console.error('❌ Direct delete test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDirectDelete();
