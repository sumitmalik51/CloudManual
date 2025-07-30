const { CosmosClient } = require('@azure/cosmos');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection (old)
const MONGODB_URI = 'mongodb+srv://sumit:sapna%21love123@app-cosmos.mongocluster.cosmos.azure.com/?tls=true';

// Cosmos DB connection (new)
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

// Define the old MongoDB Post schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  excerpt: String,
  author: String,
  published: Boolean,
  slug: String,
  tags: [String],
  views: { type: Number, default: 0 },
  metaTitle: String,
  metaDescription: String,
  featuredImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

async function migratePosts() {
  try {
    console.log('Starting migration from MongoDB to Cosmos DB...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Connect to Cosmos DB
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_ID);
    const container = database.container(process.env.COSMOS_CONTAINER_ID);
    console.log('Connected to Cosmos DB');

    // Get all posts from MongoDB
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to migrate`);

    // Migrate each post
    for (const post of posts) {
      const cosmosPost = {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        status: post.published ? 'published' : 'draft',
        slug: post.slug,
        tags: post.tags || [],
        views: post.views || 0,
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt,
        featuredImage: post.featuredImage || '',
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        type: 'post'
      };

      try {
        await container.items.create(cosmosPost);
        console.log(`Migrated post: ${post.title}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`Post already exists: ${post.title}`);
        } else {
          console.error(`Error migrating post ${post.title}:`, error.message);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migratePosts();
