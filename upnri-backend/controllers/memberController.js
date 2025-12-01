// const Member = require('../models/Member');
// const { validationResult } = require('express-validator');

// exports.registerMember = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       fullName,
//       civilId,
//       phone,
//       gender,
//       district,
//       area,
//       profession,
//       company,
//       email,
//       password,
//       consent
//     } = req.body;

//     // Check if member already exists with Civil ID
//     const existingMember = await Member.findOne({ where: { civilId } });
//     if (existingMember) {
//       return res.status(400).json({ 
//         error: 'Member with this Civil ID already exists' 
//       });
//     }

//     // Create new member
//     const member = await Member.create({
//       fullName,
//       civilId,
//       phone,
//       gender,
//       district,
//       area,
//       profession,
//       company,
//       email,
//       password,
//       consent,
//       status: 'pending' // Requires admin approval
//     });

//     res.status(201).json({
//       message: 'Registration successful. Awaiting admin approval.',
//       memberId: member.id
//     });

//   } catch (error) {
//     console.error('Member registration error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getMembers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, filters = {} } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = { status: 'active' };
    
//     // Apply filters
//     if (filters.city) whereClause.district = filters.city;
//     if (filters.profession) whereClause.profession = filters.profession;
//     if (filters.company) whereClause.company = filters.company;

//     const members = await Member.findAndCountAll({
//       where: whereClause,
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       attributes: { exclude: ['password'] }
//     });

//     res.json({
//       members: members.rows,
//       totalPages: Math.ceil(members.count / limit),
//       currentPage: parseInt(page),
//       totalMembers: members.count
//     });

//   } catch (error) {
//     console.error('Get members error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };