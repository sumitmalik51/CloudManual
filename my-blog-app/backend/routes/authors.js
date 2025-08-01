const express = require('express');
const router = express.Router();
const cosmosDB = require('../services/cosmosDB');

// GET /api/authors - Get all authors
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      includeInactive = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      limit: parseInt(limit),
      offset,
      includeInactive: includeInactive === 'true'
    };

    const authors = await cosmosDB.getAllAuthors(options);

    res.json({
      authors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: authors.length,
        hasMore: authors.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ 
      message: 'Error fetching authors', 
      error: error.message 
    });
  }
});

// GET /api/authors/:slug - Get single author by slug
router.get('/:slug', async (req, res) => {
  try {
    const author = await cosmosDB.getAuthorBySlug(req.params.slug);
    
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Get author's recent posts
    const recentPosts = await cosmosDB.getPostsByAuthor(author.slug, {
      limit: 10,
      status: 'published'
    });

    res.json({
      ...author,
      recentPosts
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ 
      message: 'Error fetching author', 
      error: error.message 
    });
  }
});

// GET /api/authors/:slug/posts - Get all posts by author
router.get('/:slug/posts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status = 'published'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await cosmosDB.getPostsByAuthor(req.params.slug, {
      limit: parseInt(limit),
      offset,
      status
    });

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length,
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching author posts:', error);
    res.status(500).json({ 
      message: 'Error fetching author posts', 
      error: error.message 
    });
  }
});

// POST /api/authors - Create new author (admin only)
router.post('/', async (req, res) => {
  try {
    const authorData = req.body;
    
    // Validate required fields
    if (!authorData.name || !authorData.email || !authorData.bio) {
      return res.status(400).json({ 
        message: 'Name, email, and bio are required' 
      });
    }

    const author = await cosmosDB.createAuthor(authorData);
    res.status(201).json(author);
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ 
      message: 'Error creating author', 
      error: error.message 
    });
  }
});

// PUT /api/authors/:id - Update author (admin only)
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body;
    const author = await cosmosDB.updateAuthor(req.params.id, updateData);
    
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.json(author);
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ 
      message: 'Error updating author', 
      error: error.message 
    });
  }
});

// POST /api/authors/:slug/update-stats - Update author statistics
router.post('/:slug/update-stats', async (req, res) => {
  try {
    await cosmosDB.updateAuthorStats(req.params.slug);
    res.json({ message: 'Author stats updated successfully' });
  } catch (error) {
    console.error('Error updating author stats:', error);
    res.status(500).json({ 
      message: 'Error updating author stats', 
      error: error.message 
    });
  }
});

module.exports = router;
