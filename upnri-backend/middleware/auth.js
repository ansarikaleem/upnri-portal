const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const member = await Member.findByPk(decoded.id);
    
    if (!member || member.status !== 'active') {
      return res.status(401).json({ error: 'Token is not valid or account is not active.' });
    }

    req.member = member;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const member = await Member.findByPk(decoded.id);
    
    if (!member || member.status !== 'active') {
      return res.status(401).json({ error: 'Token is not valid or account is not active.' });
    }

    if (member.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    req.member = member;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = { auth, adminAuth };