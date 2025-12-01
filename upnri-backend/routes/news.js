const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const News = require('../models/News');
const { Op } = require('sequelize');

const router = express.Router();

// Get all news (public route)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const news = await News.findAndCountAll({
      where: { 
        status: 'published'
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishedAt', 'DESC']]
    });

    res.json({
      news: news.rows,
      totalPages: Math.ceil(news.count / limit),
      currentPage: parseInt(page),
      totalNews: news.count
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single news article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findOne({
      where: { 
        id,
        status: 'published'
      }
    });

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Get news article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create news (admin only)
router.post('/', adminAuth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, slug, content, excerpt, featuredImage, visibility, status } = req.body;

    const news = await News.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      visibility: visibility || 'public',
      status: status || 'draft',
      authorId: req.member.id,
      publishedAt: status === 'published' ? new Date() : null
    });

    res.status(201).json({
      message: 'News article created successfully',
      news
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update news (admin only)
router.put('/:id', adminAuth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const news = await News.findByPk(id);

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    await news.update(req.body);
    res.json({
      message: 'News article updated successfully',
      news
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete news (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    await news.destroy();
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;