const cosmosDB = require('../services/cosmosDB');

async function testDeleteFixed() {
  console.log('🧪 Testing Fixed DELETE Functionality');
  console.log('=====================================');
  
  try {
    // The service is already connected as a singleton
    console.log('✅ Using CosmosDB service singleton');

    // Step 1: Create a test post
    const testPost = {
      id: `test-delete-${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Post for Fixed Delete',
      content: 'This post will be deleted to test the fixed delete functionality.',
      slug: `test-delete-fixed-${Date.now()}`,
      type: 'post',
      status: 'published',
      authorSlug: 'sumit-malik',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['test', 'delete'],
      category: 'testing',
      excerpt: 'Test post for delete functionality',
      views: 0,
      likes: 0
    };

    console.log('\n📝 Creating test post...');
    const createdPost = await cosmosDB.createPost(testPost);
    console.log(`✅ Test post created with ID: ${createdPost.id}`);

    // Step 2: Verify post exists
    console.log('\n🔍 Verifying post exists...');
    const fetchedPost = await cosmosDB.getPost(createdPost.id);
    if (fetchedPost) {
      console.log(`✅ Post exists: ${fetchedPost.title}`);
    } else {
      throw new Error('❌ Created post not found');
    }

    // Step 3: Get initial count of all posts
    console.log('\n📊 Getting initial post count...');
    const initialCount = await cosmosDB.getPostCount();
    console.log(`Initial post count: ${initialCount}`);

    // Step 4: Test delete functionality
    console.log('\n🗑️ Testing delete functionality...');
    const deleteResult = await cosmosDB.deletePost(createdPost.id);
    console.log('Delete result:', deleteResult);
    
    if (deleteResult.success) {
      console.log('✅ Delete operation reported success');
      if (deleteResult.method === 'soft-delete') {
        console.log('ℹ️ Post was soft-deleted (marked as deleted)');
      } else {
        console.log('ℹ️ Post was hard-deleted (removed from database)');
      }
    } else {
      throw new Error('❌ Delete operation failed');
    }

    // Step 5: Verify post is no longer accessible via getPost
    console.log('\n🔍 Verifying post is no longer accessible...');
    try {
      const deletedPost = await cosmosDB.getPost(createdPost.id);
      if (deletedPost && deletedPost.status === 'deleted') {
        console.log('✅ Post is soft-deleted (marked as deleted but still in database)');
      } else if (!deletedPost) {
        console.log('✅ Post is hard-deleted (completely removed from database)');
      } else {
        throw new Error('❌ Post still exists and is not marked as deleted');
      }
    } catch (error) {
      if (error.message.includes('Post not found')) {
        console.log('✅ Post is hard-deleted (completely removed from database)');
      } else {
        throw error;
      }
    }

    // Step 6: Verify post count decreased or post is filtered from getAllPosts
    console.log('\n📊 Checking if post count decreased or post is filtered...');
    const finalCount = await cosmosDB.getPostCount();
    console.log(`Final post count: ${finalCount}`);
    
    if (finalCount < initialCount) {
      console.log('✅ Post count decreased - hard delete successful');
    } else {
      console.log('ℹ️ Post count unchanged - checking if post is filtered from getAllPosts...');
      
      // Get all posts and check if our deleted post is excluded
      const allPosts = await cosmosDB.getAllPosts({ limit: 1000 });
      const deletedPostInList = allPosts.find(post => post.id === createdPost.id);
      
      if (!deletedPostInList) {
        console.log('✅ Deleted post is properly filtered from getAllPosts');
      } else {
        throw new Error('❌ Deleted post is still appearing in getAllPosts');
      }
    }

    // Step 7: Test admin functionality by getting all posts including deleted ones
    console.log('\n👨‍💼 Testing admin view (should include deleted posts if soft-deleted)...');
    try {
      // For admin, we might want to see deleted posts - let's create a method for this
      const adminQuery = `SELECT * FROM c WHERE c.type = @type AND c.id = @id`;
      const adminParameters = [
        { name: '@type', value: 'post' },
        { name: '@id', value: createdPost.id }
      ];
      
      const { resources } = await cosmosDB.container.items.query({
        query: adminQuery,
        parameters: adminParameters
      }).fetchAll();
      
      if (resources.length > 0 && resources[0].status === 'deleted') {
        console.log('✅ Admin can still access soft-deleted post for recovery');
        console.log(`Deleted post status: ${resources[0].status}, deletedAt: ${resources[0].deletedAt}`);
      } else if (resources.length === 0) {
        console.log('✅ Post was hard-deleted - not recoverable');
      } else {
        console.log('⚠️ Unexpected: Post exists but not marked as deleted');
      }
    } catch (error) {
      console.log(`Admin query error: ${error.message}`);
    }

    console.log('\n🎉 DELETE FUNCTIONALITY TEST COMPLETED SUCCESSFULLY!');
    console.log('=================================================');
    console.log('✅ All delete functionality tests passed');
    console.log('✅ Posts are properly removed from public view');
    console.log('✅ Delete operation works without entity errors');
    
  } catch (error) {
    console.error('\n❌ DELETE FUNCTIONALITY TEST FAILED');
    console.error('===================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testDeleteFixed().catch(console.error);
