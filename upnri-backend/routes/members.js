const express = require('express');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Member registration
router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('civilId')
    .isLength({ min: 12, max: 12 })
    .withMessage('Civil ID must be exactly 12 digits')
    .isNumeric()
    .withMessage('Civil ID must contain only numbers'),
  body('phone')
    .isLength({ min: 8, max: 8 })
    .withMessage('Phone number must be 8 digits')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('area').notEmpty().withMessage('Area in Kuwait is required'),
  body('profession').notEmpty().withMessage('Profession is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('consent').equals('true').withMessage('You must agree to join the community')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName,
      civilId,
      phone,
      email,
      gender,
      district,
      area,
      profession,
      company,
      password,
      consent
    } = req.body;

    // Check if member already exists with Civil ID
    const existingMember = await Member.findOne({ where: { civilId } });
    if (existingMember) {
      return res.status(400).json({ 
        error: 'Member with this Civil ID already exists' 
      });
    }

    // Check if email is already registered
    if (email) {
      const existingEmail = await Member.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ 
          error: 'Email address is already registered' 
        });
      }
    }

    // Create new member
    const member = await Member.create({
      fullName,
      civilId,
      phone,
      email,
      gender,
      district,
      area,
      profession,
      company,
      password,
      consent: consent === 'true'
    });

    res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      memberId: member.id
    });

  } catch (error) {
    console.error('Member registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
});

// Get members list (with filters) - Public for active members
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, district, profession, company, officeBearersOnly } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status: 'active' };
    
    // Apply filters
    if (district) whereClause.district = district;
    if (profession) whereClause.profession = profession;
    if (company) whereClause.company = company;
    if (officeBearersOnly === 'true') {
      whereClause.isOfficeBearer = true;
    }

    const members = await Member.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { 
        exclude: ['password', 'civilId', 'email', 'phone'] 
      },
      order: officeBearersOnly === 'true' ? 
        [['officeBearerOrder', 'ASC']] : 
        [['fullName', 'ASC']]
    });

    res.json({
      members: members.rows,
      totalPages: Math.ceil(members.count / limit),
      currentPage: parseInt(page),
      totalMembers: members.count
    });

  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get office bearers
router.get('/office-bearers', async (req, res) => {
  try {
    const officeBearers = await Member.findAll({
      where: { 
        status: 'active',
        isOfficeBearer: true
      },
      attributes: { 
        exclude: ['password', 'civilId', 'email', 'phone'] 
      },
      order: [['officeBearerOrder', 'ASC']]
    });

    res.json(officeBearers);
  } catch (error) {
    console.error('Get office bearers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get member profile
router.get('/profile', auth, async (req, res) => {
  try {
    const member = await Member.findByPk(req.member.id, {
      attributes: { exclude: ['password'] }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member profile (for members themselves)
router.put('/profile', auth, [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 8, max: 8 }).withMessage('Phone must be 8 digits'),
  body('fullName').optional().notEmpty().withMessage('Full name is required'),
  body('district').optional().notEmpty().withMessage('District is required'),
  body('area').optional().notEmpty().withMessage('Area is required'),
  body('profession').optional().notEmpty().withMessage('Profession is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByPk(req.member.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Allowed fields for member self-update
    const allowedUpdates = [
      'fullName', 'email', 'phone', 'profileImage', 'dateOfBirth', 'spouseName',
      'childrenInfo', 'anniversary', 'interests', 'qualifications',
      'specialty', 'professionalInterests', 'professionalProfile',
      'privacySettings', 'district', 'area', 'profession', 'company'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await member.update(updates);

    res.json({
      message: 'Profile updated successfully',
      member: member.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get member by ID (admin only)
router.get('/admin/members/:id', adminAuth, async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Get member by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member by ID (admin only - full update)
router.put('/admin/members/:id', adminAuth, [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 8, max: 8 }).withMessage('Phone must be 8 digits'),
  body('fullName').optional().notEmpty().withMessage('Full name is required'),
  body('civilId').optional().isLength({ min: 12, max: 12 }).withMessage('Civil ID must be 12 digits'),
  body('district').optional().notEmpty().withMessage('District is required'),
  body('area').optional().notEmpty().withMessage('Area is required'),
  body('profession').optional().notEmpty().withMessage('Profession is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // All fields allowed for admin update
    const allowedUpdates = [
      'fullName', 'civilId', 'email', 'phone', 'gender', 'district', 'area',
      'profession', 'company', 'profileImage', 'dateOfBirth', 'spouseName',
      'childrenInfo', 'anniversary', 'interests', 'qualifications',
      'specialty', 'professionalInterests', 'professionalProfile',
      'privacySettings', 'status', 'role', 'isOfficeBearer', 
      'officeBearerPosition', 'officeBearerOrder'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check for unique constraints
    if (updates.civilId && updates.civilId !== member.civilId) {
      const existingCivilId = await Member.findOne({ where: { civilId: updates.civilId } });
      if (existingCivilId) {
        return res.status(400).json({ error: 'Civil ID already exists' });
      }
    }

    if (updates.email && updates.email !== member.email) {
      const existingEmail = await Member.findOne({ where: { email: updates.email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await member.update(updates);

    res.json({
      message: 'Member updated successfully',
      member: member.getPublicProfile()
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes for member management
router.get('/admin/members', adminAuth, async (req, res) => {
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

// Update member status (admin only)
router.put('/admin/members/:id/status', adminAuth, [
  body('status').isIn(['pending', 'active', 'suspended', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await member.update({ status: req.body.status });

    res.json({
      message: 'Member status updated successfully',
      member: member.getPublicProfile()
    });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member role and office bearer status (admin only)
router.put('/admin/members/:id/role', adminAuth, [
  body('role').optional().isIn(['member', 'moderator', 'editor', 'admin']).withMessage('Invalid role'),
  body('isOfficeBearer').optional().isBoolean().withMessage('isOfficeBearer must be boolean'),
  body('officeBearerPosition').optional().isString().withMessage('Position must be string'),
  body('officeBearerOrder').optional().isInt().withMessage('Order must be integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updates = {};
    if (req.body.role !== undefined) updates.role = req.body.role;
    if (req.body.isOfficeBearer !== undefined) updates.isOfficeBearer = req.body.isOfficeBearer;
    if (req.body.officeBearerPosition !== undefined) updates.officeBearerPosition = req.body.officeBearerPosition;
    if (req.body.officeBearerOrder !== undefined) updates.officeBearerOrder = req.body.officeBearerOrder;

    await member.update(updates);

    res.json({
      message: 'Member role updated successfully',
      member: member.getPublicProfile()
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;