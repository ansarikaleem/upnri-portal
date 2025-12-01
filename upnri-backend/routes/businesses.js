const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Business = require('../models/Business');
const { Op } = require('sequelize');
const Member = require('../models/Member');

const router = express.Router();

// Get all approved businesses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status: 'approved' };
    if (category) whereClause.businessType = category;
    
    if (search) {
      whereClause[Op.or] = [
        { businessName: { [Op.like]: `%${search}%` } },
        { businessType: { [Op.like]: `%${search}%` } },
        { natureOfBusiness: { [Op.like]: `%${search}%` } }
      ];
    }

    const businesses = await Business.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Member,
        as: 'owner',
        attributes: ['id', 'fullName', 'phone', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      businesses: businesses.rows,
      totalPages: Math.ceil(businesses.count / limit),
      currentPage: parseInt(page),
      totalBusinesses: businesses.count
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Business.findAll({
      attributes: ['businessType'],
      where: { 
        status: 'approved',
        businessType: { [Op.ne]: null }
      },
      group: ['businessType'],
      raw: true
    });

    res.json(categories.map(cat => cat.businessType).filter(Boolean));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register business (member only)
router.post('/', auth, [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessType').notEmpty().withMessage('Business type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const businessData = {
      ...req.body,
      memberId: req.member.id,
      status: 'pending'
    };

    const business = await Business.create(businessData);

    res.status(201).json({
      message: 'Business registered successfully. Awaiting admin approval.',
      business
    });
  } catch (error) {
    console.error('Register business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get member's businesses
router.get('/my-businesses', auth, async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { memberId: req.member.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(businesses);
  } catch (error) {
    console.error('Get my businesses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business (owner only)
router.put('/:id', auth, [
  body('businessName').optional().notEmpty().withMessage('Business name is required'),
  body('businessType').optional().notEmpty().withMessage('Business type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const business = await Business.findOne({
      where: {
        id: req.params.id,
        memberId: req.member.id
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await business.update(req.body);

    res.json({
      message: 'Business updated successfully',
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete business (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const business = await Business.findOne({
      where: {
        id: req.params.id,
        memberId: req.member.id
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await business.destroy();

    res.json({
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;