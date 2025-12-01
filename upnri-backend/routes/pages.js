const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const Page = require('../models/Page');

const router = express.Router();

// Get page by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const page = await Page.findOne({
      where: { 
        slug,
        status: 'published'
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all pages (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const pages = await Page.findAll({
      order: [['title', 'ASC']]
    });

    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create page (admin only)
router.post('/', adminAuth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = await Page.create({
      ...req.body,
      createdBy: req.member.id
    });

    res.status(201).json({
      message: 'Page created successfully',
      page
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update page (admin only)
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
    const page = await Page.findByPk(id);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    await page.update(req.body);

    res.json({
      message: 'Page updated successfully',
      page
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;