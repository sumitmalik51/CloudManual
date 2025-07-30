const { CosmosClient } = require('@azure/cosmos');

class CosmosDBService {
  constructor() {
    this.client = null;
    this.database = null;
    this.container = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Initialize Cosmos client
      this.client = new CosmosClient({
        endpoint: process.env.COSMOS_ENDPOINT,
        key: process.env.COSMOS_KEY,
      });

      // Get or create database
      const { database } = await this.client.databases.createIfNotExists({
        id: process.env.COSMOS_DATABASE_ID || 'cloudmanual-blog'
      });
      this.database = database;

      // Get or create container (collection)
      const { container } = await this.database.containers.createIfNotExists({
        id: process.env.COSMOS_CONTAINER_ID || 'posts',
        partitionKey: '/type'
      });
      this.container = container;

      this.isConnected = true;
      console.log(`Connected to Azure Cosmos DB: ${process.env.COSMOS_DATABASE_ID}`);
      
      return this.container;
    } catch (error) {
      console.error('Azure Cosmos DB connection error:', error);
      throw error;
    }
  }

  getContainer() {
    if (!this.container) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.container;
  }

  async createPost(postData) {
    try {
      const post = {
        id: postData._id || this.generateId(),
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        author: postData.author,
        status: postData.status || 'draft',
        slug: postData.slug,
        tags: postData.tags || [],
        views: postData.views || 0,
        metaTitle: postData.metaTitle || '',
        metaDescription: postData.metaDescription || '',
        featuredImage: postData.featuredImage || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'post' // Add type for easier querying
      };

      const { resource } = await this.container.items.create(post);
      return resource;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPost(id) {
    try {
      console.log(`Fetching post with id: ${id} using query approach`);
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.id = @id AND c.type = @type',
        parameters: [
          { name: '@id', value: id },
          { name: '@type', value: 'post' }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      
      if (resources.length > 0) {
        console.log(`Successfully fetched post: ${resources[0].title}`);
        return resources[0];
      }
      
      console.log(`Post not found: ${id}`);
      return null;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  async getPostBySlug(slug) {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.slug = @slug AND c.type = @type',
        parameters: [
          { name: '@slug', value: slug },
          { name: '@type', value: 'post' }
        ]
      };

      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources.length > 0 ? resources[0] : null;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      throw error;
    }
  }

  async getAllPosts(options = {}) {
    try {
      const {
        status = null,
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = null
      } = options;

      let query = 'SELECT * FROM c WHERE c.type = @type';
      const parameters = [{ name: '@type', value: 'post' }];

      // Add status filter
      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      // Add search filter
      if (search) {
        query += ' AND (CONTAINS(LOWER(c.title), LOWER(@search)) OR CONTAINS(LOWER(c.content), LOWER(@search)))';
        parameters.push({ name: '@search', value: search });
      }

      // Add sorting
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;

      // Add pagination
      query += ` OFFSET ${offset} LIMIT ${limit}`;

      const querySpec = { query, parameters };
      const { resources } = await this.container.items.query(querySpec).fetchAll();

      return resources;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  async updatePost(id, updateData) {
    try {
      console.log(`Attempting to update post with id: ${id}`);
      
      const existingPost = await this.getPost(id);
      if (!existingPost) {
        console.log(`Post not found during getPost: ${id}`);
        throw new Error('Post not found');
      }

      console.log(`Found post to update: ${existingPost.title}`);
      console.log(`Document keys: ${Object.keys(existingPost)}`);
      console.log(`Document id field: ${existingPost.id}`);
      console.log(`Document _rid field: ${existingPost._rid}`);
      console.log(`Document _self field: ${existingPost._self}`);

      const updatedPost = {
        ...existingPost,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Try to use the _rid or _self from the document for the update
      // First, let's see all the internal Cosmos DB fields
      console.log(`All document fields: ${JSON.stringify(existingPost, null, 2)}`);

      // Use the document's internal Cosmos DB id from the fetched document
      const cosmosId = existingPost.id; // This should be the internal Cosmos DB id
      console.log(`Using Cosmos DB internal id for update: ${cosmosId}`);

      const { resource } = await this.container.item(cosmosId, existingPost.type).replace(updatedPost);
      console.log(`Successfully updated post: ${cosmosId}`);
      return resource;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error.message);
      if (error.message === 'Post not found') {
        throw error;
      }
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  async deletePost(id) {
    try {
      console.log(`Attempting to delete post with id: ${id}`);
      
      // First, find the post to get its full structure (including partition key info)
      const postToDelete = await this.getPost(id);
      if (!postToDelete) {
        console.log(`Post not found during getPost: ${id}`);
        throw new Error('Post not found');
      }
      
      console.log(`Found post to delete: ${postToDelete.title}, partition key: ${postToDelete.type}`);
      console.log(`Full post object keys: ${Object.keys(postToDelete)}`);
      console.log(`Post internal id: ${postToDelete.id}, Post custom id: ${postToDelete.id}`);
      
      // Use the document's internal id from Cosmos DB, not our custom id field
      const cosmosId = postToDelete.id; // This should be the internal Cosmos DB id
      console.log(`Using Cosmos DB internal id for deletion: ${cosmosId}`);
      
      await this.container.item(cosmosId, postToDelete.type).delete();
      console.log(`Successfully deleted post: ${cosmosId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error.message, error.stack);
      if (error.message === 'Post not found') {
        throw error;
      }
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  async getPostCount(status = null) {
    try {
      let query = 'SELECT VALUE COUNT(1) FROM c WHERE c.type = @type';
      const parameters = [{ name: '@type', value: 'post' }];

      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      const querySpec = { query, parameters };
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      
      return resources[0] || 0;
    } catch (error) {
      console.error('Error getting post count:', error);
      throw error;
    }
  }

  async incrementViews(id) {
    try {
      const post = await this.getPost(id);
      if (post) {
        post.views = (post.views || 0) + 1;
        await this.updatePost(id, { views: post.views });
        return post.views;
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
}

module.exports = new CosmosDBService();
