const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

async function setupCosmosDB() {
  try {
    console.log('Setting up Cosmos DB database and container...');

    // Create database if it doesn't exist
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: process.env.COSMOS_DATABASE_ID
    });
    console.log(`Database created/exists: ${database.id}`);

    // Create container if it doesn't exist
    const containerDef = {
      id: process.env.COSMOS_CONTAINER_ID,
      partitionKey: {
        paths: ['/type']
      },
      indexingPolicy: {
        includedPaths: [
          {
            path: '/*'
          }
        ],
        excludedPaths: [
          {
            path: '/content/?'
          }
        ]
      }
    };

    const { container } = await database.containers.createIfNotExists(containerDef);
    console.log(`Container created/exists: ${container.id}`);

    // Create some sample data if container is empty
    const { resources: items } = await container.items.query('SELECT * FROM c').fetchAll();
    
    if (items.length === 0) {
      console.log('Creating sample blog posts...');
      
      const samplePosts = [
        {
          id: '1',
          title: 'Getting Started with Azure Cosmos DB',
          content: 'Azure Cosmos DB is a globally distributed, multi-model database service. It provides turnkey global distribution across any number of Azure regions...',
          excerpt: 'Learn how to get started with Azure Cosmos DB, a globally distributed database service.',
          author: 'Admin',
          status: 'published',
          slug: 'getting-started-azure-cosmos-db',
          tags: ['azure', 'database', 'cosmos-db'],
          views: 156,
          metaTitle: 'Getting Started with Azure Cosmos DB - CloudManual',
          metaDescription: 'Complete guide to getting started with Azure Cosmos DB for modern applications.',
          featuredImage: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'post'
        },
        {
          id: '2',
          title: 'Building Modern Web Applications',
          content: 'Modern web applications require scalable, flexible, and globally distributed data solutions. In this post, we explore best practices...',
          excerpt: 'Discover best practices for building modern, scalable web applications.',
          author: 'Admin',
          status: 'published',
          slug: 'building-modern-web-applications',
          tags: ['web-development', 'best-practices', 'scalability'],
          views: 89,
          metaTitle: 'Building Modern Web Applications - CloudManual',
          metaDescription: 'Learn best practices for building modern, scalable web applications.',
          featuredImage: '',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'post'
        },
        {
          id: '3',
          title: 'Cloud Architecture Patterns',
          content: 'Understanding cloud architecture patterns is crucial for building resilient and scalable applications. This comprehensive guide covers...',
          excerpt: 'Essential cloud architecture patterns for building resilient applications.',
          author: 'Admin',
          status: 'published',
          slug: 'cloud-architecture-patterns',
          tags: ['cloud', 'architecture', 'patterns'],
          views: 234,
          metaTitle: 'Cloud Architecture Patterns - CloudManual',
          metaDescription: 'Comprehensive guide to essential cloud architecture patterns.',
          featuredImage: '',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          type: 'post'
        }
      ];

      for (const post of samplePosts) {
        await container.items.create(post);
        console.log(`Created sample post: ${post.title}`);
      }
      
      console.log('Sample data created successfully!');
    } else {
      console.log(`Container already has ${items.length} items`);
    }

    console.log('Cosmos DB setup completed!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run setup
setupCosmosDB();
