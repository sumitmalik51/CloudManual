const express = require('express');
const router = express.Router();
const cosmosDB = require('../services/cosmosDB');
const jwt = require('jsonwebtoken');

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// GET /api/posts - Get all published blog posts (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tag, 
      category,
      search,
      status = 'published'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      status: status === 'all' ? null : status,
      limit: parseInt(limit),
      offset: offset,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: search || null,
      tag: tag || null,
      category: category || null
    };

    const posts = await cosmosDB.getAllPosts(options);
    
    // Get total count for pagination
    const totalPosts = await cosmosDB.getPostCount(status === 'all' ? null : status);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      message: 'Error fetching posts',
      error: error.message 
    });
  }
});

// Test endpoint to debug posts
router.get('/debug/posts', async (req, res) => {
  try {
    const container = cosmosDB.getContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.type = "post"'
    };
    
    const { resources: allPosts } = await container.items.query(querySpec).fetchAll();
    
    const postInfo = allPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      type: post.type,
      hasAllFields: !!(post.id && post.title && post.content)
    }));
    
    res.json({
      totalPosts: allPosts.length,
      posts: postInfo,
      firstPostFull: allPosts[0] || null
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test direct fetch
router.get('/debug/fetch/:id', async (req, res) => {
  try {
    console.log(`DEBUG: Attempting to fetch post ${req.params.id}`);
    const post = await cosmosDB.getPost(req.params.id);
    console.log(`DEBUG: Result for post ${req.params.id}:`, post ? 'FOUND' : 'NOT FOUND');
    
    if (post) {
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    console.error(`DEBUG: Error fetching post ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Routes (Protected) - Must be before /:slug route

// GET /api/posts/admin - Get all posts for admin (protected)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const container = cosmosDB.getContainer();
    
    // Build query
    let query = 'SELECT * FROM c WHERE c.type = "post"';
    const parameters = [];

    // Add status filter
    if (status && status !== 'all') {
      query += ' AND c.status = @status';
      parameters.push({ name: '@status', value: status });
    }

    // Add search filter
    if (search) {
      query += ' AND (CONTAINS(LOWER(c.title), LOWER(@search)) OR CONTAINS(LOWER(c.content), LOWER(@search)))';
      parameters.push({ name: '@search', value: search });
    }

    // Add sorting
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    switch (sortBy) {
      case 'title':
        query += ` ORDER BY c.title ${orderDirection}`;
        break;
      case 'status':
        query += ` ORDER BY c.status ${orderDirection}`;
        break;
      case 'updatedAt':
        query += ` ORDER BY c.updatedAt ${orderDirection}`;
        break;
      default: // createdAt
        query += ` ORDER BY c.createdAt ${orderDirection}`;
    }

    const querySpec = {
      query,
      parameters
    };

    // Execute query with pagination
    const { resources: allPosts } = await container.items.query(querySpec).fetchAll();
    
    // Debug logging
    console.log('Admin posts query result:', allPosts.length, 'posts found');
    if (allPosts.length > 0) {
      console.log('All post IDs in database:', allPosts.map(post => ({ id: post.id, title: post.title })));
      console.log('First post full structure:', JSON.stringify(allPosts[0], null, 2));
    }
    
    // Manual pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = allPosts.slice(skip, skip + parseInt(limit));
    
    // Calculate pagination info
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNext,
        hasPrev,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ 
      message: 'Error fetching admin posts',
      error: error.message 
    });
  }
});

// GET /api/posts/admin/all - Get all posts for admin (protected)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      status: status === 'all' ? null : status,
      limit: parseInt(limit),
      offset: offset,
      sortBy,
      sortOrder,
      search: search || null
    };

    const posts = await cosmosDB.getAllPosts(options);
    
    // Get total count for pagination
    const totalPosts = await cosmosDB.getPostCount(status === 'all' ? null : status);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ 
      message: 'Error fetching posts',
      error: error.message 
    });
  }
});

// GET /api/posts/admin/:id - Get a single post by ID for admin (protected)
router.get('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const post = await cosmosDB.getPost(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      message: 'Error fetching post',
      error: error.message 
    });
  }
});

// POST /api/posts/admin - Create a new blog post (protected)
router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author = 'Admin',
      authorSlug,
      status = 'draft',
      tags = [],
      metaTitle,
      metaDescription,
      featuredImage
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }

    // Generate slug from title
    const slug = generateSlug(title);

    // Check if slug already exists
    const existingPost = await cosmosDB.getPostBySlug(slug);
    if (existingPost) {
      return res.status(400).json({ 
        message: 'A post with this title already exists' 
      });
    }

    const postData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      author,
      authorSlug,
      status,
      slug,
      tags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      featuredImage: featuredImage || ''
    };

    const newPost = await cosmosDB.createPost(postData);
    
    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      message: 'Error creating post',
      error: error.message 
    });
  }
});

// PUT /api/posts/admin/:id - Update a blog post (protected)
router.put('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author,
      authorSlug,
      status,
      tags,
      metaTitle,
      metaDescription,
      featuredImage
    } = req.body;

    // Get existing post
    const existingPost = await cosmosDB.getPost(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updateData = {};
    
    if (title !== undefined) {
      updateData.title = title;
      // Update slug if title changed
      if (title !== existingPost.title) {
        updateData.slug = generateSlug(title);
      }
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (author !== undefined) updateData.author = author;
    if (authorSlug !== undefined) updateData.authorSlug = authorSlug;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;

    const updatedPost = await cosmosDB.updatePost(req.params.id, updateData);
    
    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: 'Error updating post',
      error: error.message 
    });
  }
});

// DELETE /api/posts/admin/:id - Delete a blog post (protected)
router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const deleteResult = await cosmosDB.deletePost(req.params.id);
    
    // Log the delete result to see which method was used
    console.log('🗑️ Delete result:', deleteResult);
    
    res.json({
      message: 'Post deleted successfully',
      method: deleteResult.method || 'unknown',
      details: deleteResult.message || 'Post deleted'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ 
      message: 'Error deleting post',
      error: error.message 
    });
  }
});

// POST /api/posts/admin/login - Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple authentication (in production, use proper user management)
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { username: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: { username: 'admin' }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login error',
      error: error.message 
    });
  }
});

// GET /api/posts/admin/analytics - Get analytics data (protected)
router.get('/admin/analytics', authenticateToken, async (req, res) => {
  try {
    const totalPosts = await cosmosDB.getPostCount();
    const publishedPosts = await cosmosDB.getPostCount('published');
    const draftPosts = await cosmosDB.getPostCount('draft');
    
    // Get recent posts for analytics
    const recentPosts = await cosmosDB.getAllPosts({
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const totalViews = recentPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const averageViews = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;

    // Get top posts by views
    const topPosts = await cosmosDB.getAllPosts({
      limit: 5,
      sortBy: 'views',
      sortOrder: 'desc',
      status: 'published'
    });

    const analyticsData = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      averageViews,
      topPosts: topPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views || 0,
        createdAt: post.createdAt
      })),
      recentActivity: recentPosts.slice(0, 5).map(post => ({
        id: post.id,
        title: post.title,
        action: 'created',
        date: post.createdAt
      }))
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics',
      error: error.message 
    });
  }
});

// GET /api/posts/:slug - Get a single blog post by slug (public)
// POST /api/posts/:slug/like - Increment likes for a post (public)
router.post('/:slug/like', async (req, res) => {
  try {
    const postSlug = req.params.slug;
    
    if (!postSlug) {
      return res.status(400).json({ message: 'Post slug is required' });
    }

    // Increment like count using slug
    try {
      const newLikes = await cosmosDB.incrementLikes(postSlug);
      console.log(`Successfully incremented likes for post: ${postSlug}`);
      res.json({ likes: newLikes });
    } catch (likeError) {
      console.error('Error incrementing likes:', likeError.message);
      res.status(500).json({ 
        message: 'Error incrementing likes',
        error: likeError.message 
      });
    }
  } catch (error) {
    console.error('Error in like endpoint:', error);
    res.status(500).json({ 
      message: 'Error processing like request',
      error: error.message 
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await cosmosDB.getPostBySlug(req.params.slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Don't show draft posts to public
    if (post.status !== 'published' && !req.headers.authorization) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count using slug
    try {
      const newViews = await cosmosDB.incrementViews(post.slug);
      post.views = newViews;
      console.log(`Successfully incremented views for post: ${post.title}`);
    } catch (viewError) {
      console.error('Error incrementing views, continuing without increment:', viewError.message);
      // Continue serving the post even if view increment fails
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      message: 'Error fetching post',
      error: error.message 
    });
  }
});

// POST /api/posts/admin/cleanup-duplicates - Clean up duplicate posts (admin only)
router.post('/admin/cleanup-duplicates', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 Starting duplicate post cleanup...');
    const result = await cosmosDB.cleanupDuplicatePosts();
    
    res.json({
      success: true,
      message: result.message,
      cleaned: result.cleaned
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

module.exports = router;
