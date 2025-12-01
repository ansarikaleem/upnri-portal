const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');

const router = express.Router();

// Member login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find member by email
    const member = await Member.findOne({ where: { email } });
    if (!member) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if member is active
    if (member.status !== 'active') {
      return res.status(401).json({ error: 'Your account is pending approval or has been suspended' });
    }

    // Check password
    const isPasswordValid = await member.checkPassword(password);
    // const isPasswordValid = true;
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: member.id,
        email: member.email,
        role: member.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      member: member.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Admin login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin by email and role
    const admin = await Member.findOne({ 
      where: { 
        email,
        role: 'admin'
      } 
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Check password
    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: admin.getPublicProfile()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error during admin login' });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const member = await Member.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!member) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      member: member.getPublicProfile()
    });

  } catch (error) {
    res.status(401).json({ 
      valid: false,
      error: 'Invalid token' 
    });
  }
});

module.exports = router;