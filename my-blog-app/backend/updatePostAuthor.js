const cosmosDB = require('./services/cosmosDB');

async function updateSinglePostWithAuthor() {
  try {
    console.log('Fetching posts...');
    const posts = await cosmosDB.getAllPosts({ limit: 1 });
    
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    const post = posts[0];
    console.log(`Updating post: ${post.title}`);
    
    const updatedPost = {
      ...post,
      authorSlug: 'sumit-malik'
    };

    await cosmosDB.updatePost(post.id, updatedPost);
    console.log('✅ Post updated with author information');
    console.log(`Title: ${post.title}`);
    console.log(`Author slug added: sumit-malik`);
    
  } catch (error) {
    console.error('Error updating post:', error);
  }
}

updateSinglePostWithAuthor();
