const { CosmosClient } = require('@azure/cosmos');

class CosmosDBService {
  constructor() {
    this.client = null;
    this.database = null;
    this.container = null;
    this.isConnected = false;
    // Track recent view increments to prevent duplicates
    this.recentViewIncrements = new Map();
    // Track recent like increments separately
    this.recentLikeIncrements = new Map();
    this.viewIncrementCooldown = 5000; // 5 seconds cooldown
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
        category: postData.category || '',
        views: postData.views || 0,
        likes: postData.likes || 0,
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
        query: 'SELECT * FROM c WHERE c.slug = @slug AND c.type = @type ORDER BY c.createdAt DESC',
        parameters: [
          { name: '@slug', value: slug },
          { name: '@type', value: 'post' }
        ]
      };

      console.log(`Executing query: ${querySpec.query}`);
      console.log('With parameters:', querySpec.parameters);

      const { resources } = await this.container.items.query(querySpec).fetchAll();
      console.log('Query response:', { resourceCount: resources.length });
      
      if (resources.length > 0) {
        // If multiple documents exist with same slug, take the most recent one
        const post = resources[0];
        console.log(`Found post by slug '${slug}':`, {
          id: post.id,
          slug: post.slug,
          type: post.type,
          title: post.title,
          views: post.views,
          likes: post.likes,
          createdAt: post.createdAt
        });
        
        // Warn if there are duplicates
        if (resources.length > 1) {
          console.warn(`⚠️  Found ${resources.length} documents with slug '${slug}'. Using most recent one.`);
          console.warn('Duplicate IDs:', resources.map(r => ({ id: r.id, createdAt: r.createdAt })));
        }
        
        return post;
      } else {
        console.log(`No post found with slug: ${slug}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting post by slug:', error);
      throw error;
    }
  }

  async getAllPosts(options = {}) {
    try {
      // Ensure we're connected to the database
      if (!this.isConnected || !this.container) {
        console.log('Database not connected, attempting to connect...');
        await this.connect();
      }

      const {
        status = null,
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = null,
        tag = null,
        category = null
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

      // Add tag filter
      if (tag) {
        query += ' AND ARRAY_CONTAINS(c.tags, @tag)';
        parameters.push({ name: '@tag', value: tag });
      }

      // Add category filter
      if (category) {
        query += ' AND c.category = @category';
        parameters.push({ name: '@category', value: category });
      }

      // Add sorting
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;

      // Add pagination
      query += ` OFFSET ${offset} LIMIT ${limit}`;

      const querySpec = { query, parameters };
      console.log('Executing query:', query);
      console.log('With parameters:', parameters);
      
      const response = await this.container.items.query(querySpec).fetchAll();
      console.log('Query response:', response);
      
      if (!response || !response.resources) {
        console.log('No resources found in response, returning empty array');
        return [];
      }
      
      return response.resources;
    } catch (error) {
      console.error('Error getting posts:', error);
      // Return empty array instead of throwing to prevent the frontend from breaking
      console.log('Returning empty array due to error');
      return [];
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
      // Ensure we're connected to the database
      if (!this.isConnected || !this.container) {
        console.log('Database not connected, attempting to connect...');
        await this.connect();
      }

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
      // Return 0 instead of throwing to prevent breaking pagination
      console.log('Returning 0 due to error');
      return 0;
    }
  }

  async incrementLikes(postSlug) {
    try {
      console.log(`Incrementing likes for post with slug: ${postSlug}`);
      
      // Check if we recently incremented likes for this post
      const now = Date.now();
      const lastIncrement = this.recentLikeIncrements.get(postSlug);
      
      if (lastIncrement && (now - lastIncrement) < this.viewIncrementCooldown) {
        console.log(`Like increment skipped for ${postSlug} - within cooldown period`);
        // Return the current like count without incrementing
        const post = await this.getPostBySlug(postSlug);
        return post ? post.likes || 0 : 0;
      }
      
      // Find the post by slug instead of internal id
      const post = await this.getPostBySlug(postSlug);
      
      if (!post) {
        console.log(`Post with slug ${postSlug} not found for like increment`);
        return 0; // Return 0 instead of throwing error
      }

      // Debug the post details
      await this.debugPost(post);

      const newLikes = (post.likes || 0) + 1;
      console.log(`Current likes: ${post.likes || 0}, incrementing to: ${newLikes}`);
      
      try {
        // Verify the document exists before attempting update
        console.log(`Verifying document exists before like update: ${post.id}`);
        const { resource: existingDoc } = await this.container.item(post.id).read();
        
        if (!existingDoc) {
          console.error(`Document verification failed - document ${post.id} does not exist`);
          return post.likes || 0; // Return current like count without incrementing
        }
        
        console.log(`Document verification successful - proceeding with like update`);
        
        // Update the post directly using Cosmos DB internal id and partition key
        const updatedPost = {
          ...existingDoc, // Use the verified existing document as base
          likes: newLikes,
          updatedAt: new Date().toISOString()
        };

        // Try update without partition key first (since direct read works without it)
        let response;
        try {
          response = await this.container.item(post.id).replace(updatedPost);
        } catch (noPartitionError) {
          console.log('Like update without partition key failed, trying with partition key...');
          response = await this.container.item(post.id, post.type).replace(updatedPost);
        }
        
        // Track this increment
        this.recentLikeIncrements.set(postSlug, now);
        
        console.log(`Successfully incremented likes to ${newLikes} for post: ${post.title}`);
        return newLikes;
        
      } catch (replaceError) {
        console.error(`Failed to update likes for document with id: ${post.id}, partition key: ${post.type}`);
        console.error('Document details:', {
          id: post.id,
          slug: post.slug,
          type: post.type,
          title: post.title
        });
        
        // Check if document exists by trying to read it directly
        try {
          const existingDoc = await this.container.item(post.id, post.type).read();
          console.log('Document exists for likes, but replace failed. This might be a concurrency issue.');
        } catch (readError) {
          console.error('Document not found in CosmosDB for like increment:', postSlug);
          // Document doesn't exist, return current like count without incrementing
          return post.likes || 0;
        }
        
        // Re-throw the original replace error
        throw replaceError;
      }
      
    } catch (error) {
      console.error('Error incrementing likes:', error);
      // For increment failures, return current like count instead of throwing
      try {
        const post = await this.getPostBySlug(postSlug);
        return post ? post.likes || 0 : 0;
      } catch (getError) {
        console.error('Failed to retrieve post for fallback like count:', getError);
        return 0;
      }
    }
  }

  async debugPost(post) {
    console.log('=== DEBUG POST DETAILS ===');
    console.log('Full post object keys:', Object.keys(post));
    console.log('Document ID:', post.id);
    console.log('Document _rid:', post._rid);
    console.log('Document _self:', post._self);
    console.log('Document _etag:', post._etag);
    console.log('Document _attachments:', post._attachments);
    console.log('Document _ts:', post._ts);
    console.log('==============================');
    
    // Try to read directly by ID
    try {
      const { resource: directRead } = await this.container.item(post.id).read();
      console.log('Direct read successful:', directRead ? 'YES' : 'NO');
      if (directRead) {
        console.log('Direct read ID:', directRead.id);
      }
    } catch (error) {
      console.log('Direct read failed:', error.message);
    }
    
    // Try to read with partition key
    try {
      const { resource: partitionRead } = await this.container.item(post.id, post.type).read();
      console.log('Partition key read successful:', partitionRead ? 'YES' : 'NO');
      if (partitionRead) {
        console.log('Partition read ID:', partitionRead.id);
      }
    } catch (error) {
      console.log('Partition key read failed:', error.message);
    }
  }

  async incrementViews(postSlug) {
    try {
      console.log(`Incrementing views for post with slug: ${postSlug}`);
      
      // Check if we recently incremented views for this post
      const now = Date.now();
      const lastIncrement = this.recentViewIncrements.get(postSlug);
      
      if (lastIncrement && (now - lastIncrement) < this.viewIncrementCooldown) {
        console.log(`View increment skipped for ${postSlug} - within cooldown period`);
        // Return the current view count without incrementing
        const post = await this.getPostBySlug(postSlug);
        return post ? post.views || 0 : 0;
      }
      
      // Find the post by slug instead of internal id
      const post = await this.getPostBySlug(postSlug);
      
      if (!post) {
        console.log(`Post with slug ${postSlug} not found, skipping view increment`);
        return 0; // Return 0 instead of throwing error
      }

      // Debug the post details
      await this.debugPost(post);

      const newViews = (post.views || 0) + 1;
      console.log(`Current views: ${post.views || 0}, incrementing to: ${newViews}`);
      
      try {
        // Verify the document exists before attempting update
        console.log(`Verifying document exists before update: ${post.id}`);
        const { resource: existingDoc } = await this.container.item(post.id).read();
        
        if (!existingDoc) {
          console.error(`Document verification failed - document ${post.id} does not exist`);
          return post.views || 0; // Return current view count without incrementing
        }
        
        console.log(`Document verification successful - proceeding with update`);
        
        // Update the post directly using Cosmos DB internal id and partition key
        const updatedPost = {
          ...existingDoc, // Use the verified existing document as base
          views: newViews,
          updatedAt: new Date().toISOString()
        };

        // Try update without partition key first (since direct read works without it)
        let response;
        try {
          response = await this.container.item(post.id).replace(updatedPost);
        } catch (noPartitionError) {
          console.log('Update without partition key failed, trying with partition key...');
          response = await this.container.item(post.id, post.type).replace(updatedPost);
        }
        
        // Track this increment
        this.recentViewIncrements.set(postSlug, now);
        
        // Clean up old entries (older than cooldown period)
        for (const [slug, timestamp] of this.recentViewIncrements.entries()) {
          if (now - timestamp > this.viewIncrementCooldown) {
            this.recentViewIncrements.delete(slug);
          }
        }
        
        console.log(`Successfully incremented views to ${newViews} for post: ${post.title}`);
        return newViews;
        
      } catch (replaceError) {
        console.error(`Failed to update document with id: ${post.id}, partition key: ${post.type}`);
        console.error('Document details:', {
          id: post.id,
          slug: post.slug,
          type: post.type,
          title: post.title
        });
        
        // Check if document exists by trying to read it directly
        try {
          const existingDoc = await this.container.item(post.id, post.type).read();
          console.log('Document exists, but replace failed. This might be a concurrency issue.');
          console.log('Existing document ID:', existingDoc.resource?.id);
        } catch (readError) {
          console.error('Document not found in CosmosDB, returning 0 views for', postSlug);
          // Document doesn't exist, return current view count without incrementing
          return post.views || 0;
        }
        
        // Re-throw the original replace error
        throw replaceError;
      }
      
    } catch (error) {
      console.error('Error incrementing views:', error);
      // For increment failures, return current view count instead of throwing
      try {
        const post = await this.getPostBySlug(postSlug);
        console.log(`Post document not found in CosmosDB, returning 0 views for ${postSlug}`);
        return post ? post.views || 0 : 0;
      } catch (getError) {
        console.error('Failed to retrieve post for fallback view count:', getError);
        return 0;
      }
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

  // Utility method to find and remove duplicate posts by slug
  async findDuplicatePosts() {
    try {
      console.log('🔍 Scanning for duplicate posts...');
      
      const querySpec = {
        query: 'SELECT c.slug, COUNT(1) as count FROM c WHERE c.type = @type GROUP BY c.slug HAVING COUNT(1) > 1',
        parameters: [{ name: '@type', value: 'post' }]
      };

      const { resources: duplicates } = await this.container.items.query(querySpec).fetchAll();
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} slugs with duplicates:`);
        for (const dup of duplicates) {
          console.log(`  - ${dup.slug}: ${dup.count} copies`);
        }
        return duplicates;
      } else {
        console.log('✅ No duplicate posts found');
        return [];
      }
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      throw error;
    }
  }

  // Utility method to clean up duplicates (keeps the most recent one)
  async cleanupDuplicatePosts() {
    try {
      const duplicates = await this.findDuplicatePosts();
      
      if (duplicates.length === 0) {
        return { cleaned: 0, message: 'No duplicates found' };
      }

      let totalCleaned = 0;
      
      for (const duplicate of duplicates) {
        console.log(`🧹 Cleaning duplicates for slug: ${duplicate.slug}`);
        
        // Get all posts with this slug, ordered by creation date (newest first)
        const querySpec = {
          query: 'SELECT * FROM c WHERE c.slug = @slug AND c.type = @type ORDER BY c.createdAt DESC',
          parameters: [
            { name: '@slug', value: duplicate.slug },
            { name: '@type', value: 'post' }
          ]
        };

        const { resources: posts } = await this.container.items.query(querySpec).fetchAll();
        
        if (posts.length > 1) {
          // Keep the first one (most recent), delete the rest
          const postsToDelete = posts.slice(1);
          
          console.log(`  Keeping: ${posts[0].id} (${posts[0].createdAt})`);
          
          for (const postToDelete of postsToDelete) {
            console.log(`  Deleting: ${postToDelete.id} (${postToDelete.createdAt})`);
            await this.container.item(postToDelete.id, postToDelete.type).delete();
            totalCleaned++;
          }
        }
      }

      const message = `✅ Cleanup complete! Removed ${totalCleaned} duplicate posts`;
      console.log(message);
      return { cleaned: totalCleaned, message };
      
    } catch (error) {
      console.error('Error during duplicate cleanup:', error);
      throw error;
    }
  }
}

module.exports = new CosmosDBService();
