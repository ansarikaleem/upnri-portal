const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Member = require('../models/Member');
const Business = require('../models/Business');
const News = require('../models/News');
const Event = require('../models/Event');
const { Op } = require('sequelize');

const router = express.Router();

// Admin dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalMembers,
      pendingMembers,
      totalBusinesses,
      pendingBusinesses,
      totalEvents,
      totalNews
    ] = await Promise.all([
      Member.count(),
      Member.count({ where: { status: 'pending' } }),
      Business.count(),
      Business.count({ where: { status: 'pending' } }),
      Event.count(),
      News.count()
    ]);

    res.json({
      totalMembers,
      pendingApprovals: pendingMembers + pendingBusinesses,
      totalEvents,
      totalBusinesses,
      totalNews,
      pendingMembers,
      pendingBusinesses
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending approvals
router.get('/pending-approvals', adminAuth, async (req, res) => {
  try {
    const [pendingMembers, pendingBusinesses] = await Promise.all([
      Member.findAll({
        where: { status: 'pending' },
        attributes: ['id', 'fullName', 'civilId', 'createdAt'],
        raw: true
      }),
      Business.findAll({
        where: { status: 'pending' },
        attributes: ['id', 'businessName', 'createdAt'],
        include: [{ model: Member, attributes: ['fullName'] }],
        raw: true
      })
    ]);

    const approvals = [
      ...pendingMembers.map(member => ({
        id: member.id,
        type: 'member',
        fullName: member.fullName,
        createdAt: member.createdAt
      })),
      ...pendingBusinesses.map(business => ({
        id: business.id,
        type: 'business',
        businessName: business.businessName,
        createdAt: business.createdAt
      }))
    ];

    res.json(approvals);
  } catch (error) {
    console.error('Pending approvals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject member
router.post('/approve/member/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (action === 'approve') {
      await member.update({ status: 'active' });
      res.json({ message: 'Member approved successfully' });
    } else if (action === 'reject') {
      await member.destroy();
      res.json({ message: 'Member registration rejected and removed' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Approve member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject business
router.post('/approve/business/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (action === 'approve') {
      await business.update({ status: 'approved' });
      res.json({ message: 'Business approved successfully' });
    } else if (action === 'reject') {
      await business.destroy();
      res.json({ message: 'Business listing rejected and removed' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Approve business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all members for admin
router.get('/members', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { civilId: { [Op.like]: `%${search}%` } }
      ];
    }

    const members = await Member.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      members: members.rows,
      totalPages: Math.ceil(members.count / limit),
      currentPage: parseInt(page),
      totalMembers: members.count
    });
  } catch (error) {
    console.error('Admin get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member status
router.put('/members/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'active', 'suspended', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await member.update({ status });
    res.json({ message: `Member status updated to ${status}` });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;