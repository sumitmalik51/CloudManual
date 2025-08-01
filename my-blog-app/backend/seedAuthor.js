const cosmosDB = require('./services/cosmosDB');

const createSumitAuthor = async () => {
  try {
    console.log('Creating Sumit Malik author profile...');

    const authorData = {
      name: 'Sumit Malik',
      email: 'sumitmalik51@example.com',
      bio: 'Cloud Architect and DevOps Expert specializing in Azure, Kubernetes, and AI-powered development workflows. Passionate about sharing knowledge through technical writing and building scalable cloud solutions.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      jobTitle: 'Senior Cloud Architect',
      company: 'CloudManual',
      location: 'India',
      website: 'https://cloudmanual.dev',
      socialLinks: {
        twitter: 'https://twitter.com/sumitmalik51',
        linkedin: 'https://linkedin.com/in/sumitmalik51',
        github: 'https://github.com/sumitmalik51',
        youtube: 'https://youtube.com/@cloudmanual',
        instagram: ''
      },
      expertise: [
        'Azure Cloud Architecture',
        'Kubernetes & Container Orchestration',
        'DevOps & CI/CD Pipelines',
        'AI & Machine Learning Integration',
        'Infrastructure as Code',
        'Microservices Architecture',
        'Docker & Containerization',
        'GitHub Copilot & AI Development'
      ],
      isActive: true
    };

    // Check if author already exists
    const existingAuthor = await cosmosDB.getAuthorBySlug('sumit-malik');
    if (existingAuthor) {
      console.log('Author already exists:', existingAuthor.name);
      return existingAuthor;
    }

    const author = await cosmosDB.createAuthor(authorData);
    console.log('✅ Author created successfully:', author.name);
    
    // Update stats for this author
    await cosmosDB.updateAuthorStats(author.slug);
    console.log('✅ Author stats updated');
    
    return author;
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
};

const updateExistingPostsWithAuthor = async () => {
  try {
    console.log('Updating existing posts with author information...');
    
    // Get all posts that don't have an author
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.type = @type AND (NOT IS_DEFINED(c.authorSlug) OR c.authorSlug = null OR c.authorSlug = "")',
      parameters: [{ name: '@type', value: 'post' }]
    };

    const { resources: posts } = await cosmosDB.container.items.query(querySpec).fetchAll();
    console.log(`Found ${posts.length} posts without author information`);

    for (const post of posts) {
      try {
        const updatedPost = {
          ...post,
          author: 'Sumit Malik',
          authorSlug: 'sumit-malik',
          updatedAt: new Date().toISOString()
        };

        await cosmosDB.container.item(post.id).replace(updatedPost);
        console.log(`✅ Updated post: ${post.title}`);
      } catch (error) {
        console.error(`❌ Failed to update post ${post.title}:`, error.message);
      }
    }

    console.log('✅ Finished updating posts with author information');
  } catch (error) {
    console.error('Error updating posts with author:', error);
    throw error;
  }
};

const seedAuthor = async () => {
  try {
    await cosmosDB.connect();
    console.log('Connected to CosmosDB');

    // Create the author
    const author = await createSumitAuthor();
    
    // Update existing posts
    await updateExistingPostsWithAuthor();
    
    // Update author stats again after assigning posts
    await cosmosDB.updateAuthorStats(author.slug);
    
    console.log('🎉 Author seeding completed successfully!');
    console.log(`Author profile: ${author.name} (${author.slug})`);
    console.log(`Posts count: ${author.postCount || 0}`);
    
  } catch (error) {
    console.error('❌ Error during author seeding:', error);
  } finally {
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  seedAuthor();
}

module.exports = { createSumitAuthor, updateExistingPostsWithAuthor };
