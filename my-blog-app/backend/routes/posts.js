const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Basic auth middleware for protected routes
const basicAuth = (req, res, next) => {
  const authToken = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (authToken === `Bearer ${adminPassword}`) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
  }
};

// GET /api/posts - Get all published blog posts (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      search,
      published = 'true'
    } = req.query;

    const query = {};
    
    // Only show published posts for public API
    if (published === 'true') {
      query.published = true;
    }

    // Filter by category
    if (category) {
      query.category = new RegExp(category, 'i');
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { publishedAt: -1, createdAt: -1 },
      select: 'title excerpt author tags category featuredImage publishedAt slug readingTime views'
    };

    const posts = await Post.find(query)
      .select(options.select)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total,
      hasNext: options.page < Math.ceil(total / options.limit),
      hasPrev: options.page > 1
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// GET /api/posts/admin - Get all posts including unpublished (admin only)
router.get('/admin', basicAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { updatedAt: -1 }
    };

    const posts = await Post.find({})
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Post.countDocuments({});

    res.json({
      posts,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// GET /api/posts/:id - Get single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin = 'false' } = req.query;
    
    let query = { _id: id };
    
    // If not admin request, only show published posts
    if (admin !== 'true') {
      query.published = true;
    }

    const post = await Post.findOne(query);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count for public requests
    if (admin !== 'true') {
      await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// GET /api/posts/slug/:slug - Get single blog post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await Post.findOne({ slug, published: true });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    res.json(post);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// POST /api/posts - Create new post (admin only)
router.post('/', basicAuth, async (req, res) => {
  try {
    const postData = req.body;
    
    // Validate required fields
    if (!postData.title || !postData.content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = new Post(postData);
    const savedPost = await post.save();
    
    res.status(201).json({
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// PUT /api/posts/:id - Update post (admin only)
router.put('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const post = await Post.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// DELETE /api/posts/:id - Delete post (admin only)
router.delete('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      message: 'Post deleted successfully',
      deletedPost: { id: post._id, title: post.title }
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// GET /api/posts/admin/stats - Get comprehensive blog statistics (admin only)
router.get('/admin/stats', basicAuth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({});
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    
    // Calculate total views
    const totalViewsResult = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);
    const totalViews = totalViewsResult[0]?.total || 0;

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// GET /api/posts/admin/analytics - Get detailed analytics (admin only)
router.get('/admin/analytics', basicAuth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({});
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    
    // Calculate total and average views
    const totalViewsResult = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);
    const totalViews = totalViewsResult[0]?.total || 0;
    const averageViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    // Posts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const postsThisMonth = await Post.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Top performing posts
    const topPosts = await Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views createdAt')
      .lean();

    // Recent activity (simplified)
    const recentActivity = await Post.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status createdAt updatedAt')
      .lean()
      .then(posts => posts.map(post => ({
        _id: post._id,
        title: post.title,
        action: post.createdAt.getTime() === post.updatedAt.getTime() ? 'created' : 'updated',
        date: post.updatedAt
      })));

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      averageViews,
      postsThisMonth,
      topPosts,
      recentActivity,
      monthlyStats: [] // Placeholder for future implementation
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// GET /api/posts/stats/summary - Get blog statistics (admin only)
router.get('/stats/summary', basicAuth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({});
    const publishedPosts = await Post.countDocuments({ published: true });
    const draftPosts = await Post.countDocuments({ published: false });
    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    const recentPosts = await Post.find({})
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title published updatedAt views');

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews[0]?.total || 0,
      recentPosts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
