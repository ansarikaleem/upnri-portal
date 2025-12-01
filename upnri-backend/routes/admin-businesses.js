const express = require('express');
const { Op } = require('sequelize');
const Member = require('../models/Member');
const { adminAuth } = require('../middleware/auth');
const Business = require('../models/Business');

const router = express.Router();

// Get all businesses with filters (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { businessName: { [Op.like]: `%${search}%` } },
        { businessType: { [Op.like]: `%${search}%` } },
        { natureOfBusiness: { [Op.like]: `%${search}%` } },
        { '$owner.fullName$': { [Op.like]: `%${search}%` } }
      ];
    }

    const businesses = await Business.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Member,
        as: 'owner',
        attributes: ['id', 'fullName', 'email', 'phone']
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
    console.error('Admin get businesses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business status (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const business = await Business.findByPk(req.params.id, {
      include: [{
        model: Member,
        as: 'owner',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await business.update({ status });

    res.json({
      message: `Business ${status} successfully`,
      business
    });
  } catch (error) {
    console.error('Update business status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business details (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const allowedUpdates = [
      'businessName', 'businessType', 'natureOfBusiness', 'businessDetails',
      'location', 'contactPhone', 'websiteUrl', 'logo', 'status'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await business.update(updates);

    res.json({
      message: 'Business updated successfully',
      business
    });
  } catch (error) {
    console.error('Admin update business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete business (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await business.destroy();

    res.json({
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business statistics (admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalBusinesses = await Business.count();
    const pendingBusinesses = await Business.count({ where: { status: 'pending' } });
    const approvedBusinesses = await Business.count({ where: { status: 'approved' } });
    const rejectedBusinesses = await Business.count({ where: { status: 'rejected' } });

    // Get businesses by type
    const businessesByType = await Business.findAll({
      attributes: [
        'businessType',
        [Business.sequelize.fn('COUNT', Business.sequelize.col('id')), 'count']
      ],
      where: {
        businessType: { [Op.ne]: null }
      },
      group: ['businessType'],
      raw: true
    });

    res.json({
      total: totalBusinesses,
      pending: pendingBusinesses,
      approved: approvedBusinesses,
      rejected: rejectedBusinesses,
      byType: businessesByType
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;