const express = require('express');
const { body, validationResult } = require('express-validator');
const ConnectionRequest = require('../models/ConnectionRequest');
const Notification = require('../models/Notification');
const Member = require('../models/Member');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Send connection request
router.post('/request', auth, [
  body('toMemberId').isInt().withMessage('Valid member ID is required'),
  body('message').optional().isLength({ max: 1000 }).withMessage('Message too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toMemberId, message } = req.body;
    const fromMemberId = req.member.id;

    // Check if member is trying to connect with themselves
    if (fromMemberId === toMemberId) {
      return res.status(400).json({ error: 'Cannot send connection request to yourself' });
    }

    // Check if target member exists and is active
    const toMember = await Member.findOne({
      where: { 
        id: toMemberId,
        status: 'active'
      }
    });

    if (!toMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check for existing pending request
    const existingRequest = await ConnectionRequest.findOne({
      where: {
        fromMemberId,
        toMemberId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Connection request already sent' });
    }

    // Check if they are already connected (accepted request)
    const existingConnection = await ConnectionRequest.findOne({
      where: {
        [Op.or]: [
          { fromMemberId, toMemberId, status: 'accepted' },
          { fromMemberId: toMemberId, toMemberId: fromMemberId, status: 'accepted' }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({ error: 'You are already connected with this member' });
    }

    // Create connection request
    const connectionRequest = await ConnectionRequest.create({
      fromMemberId,
      toMemberId,
      message: message?.trim() || null
    });

    // Create notification for the recipient
    await Notification.create({
      memberId: toMemberId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.member.fullName} wants to connect with you`,
      relatedId: connectionRequest.id
    });

    res.status(201).json({
      message: 'Connection request sent successfully',
      request: connectionRequest
    });

  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get connection requests for current user
router.get('/requests', auth, async (req, res) => {
  try {
    const { type = 'received', status } = req.query;
    const memberId = req.member.id;

    const whereClause = {};
    
    if (type === 'received') {
      whereClause.toMemberId = memberId;
    } else if (type === 'sent') {
      whereClause.fromMemberId = memberId;
    }

    if (status) {
      whereClause.status = status;
    }

    const connectionRequests = await ConnectionRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: type === 'received' ? 'fromMember' : 'toMember',
          attributes: ['id', 'fullName', 'profileImage', 'profession', 'district']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(connectionRequests);
  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread connection request count
router.get('/requests/unread-count', auth, async (req, res) => {
  try {
    const memberId = req.member.id;

    const count = await ConnectionRequest.count({
      where: {
        toMemberId: memberId,
        status: 'pending'
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept connection request
router.put('/requests/:id/accept', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const memberId = req.member.id;

    const connectionRequest = await ConnectionRequest.findOne({
      where: {
        id: requestId,
        toMemberId: memberId,
        status: 'pending'
      },
      include: [
        {
          model: Member,
          as: 'fromMember',
          attributes: ['id', 'fullName']
        }
      ]
    });

    if (!connectionRequest) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Update request status
    await connectionRequest.update({ status: 'accepted' });

    // Create notification for the sender
    await Notification.create({
      memberId: connectionRequest.fromMemberId,
      type: 'connection_accepted',
      title: 'Connection Request Accepted',
      message: `${req.member.fullName} accepted your connection request`,
      relatedId: connectionRequest.id
    });

    res.json({
      message: 'Connection request accepted',
      request: connectionRequest
    });

  } catch (error) {
    console.error('Accept connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject connection request
router.put('/requests/:id/reject', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const memberId = req.member.id;

    const connectionRequest = await ConnectionRequest.findOne({
      where: {
        id: requestId,
        toMemberId: memberId,
        status: 'pending'
      }
    });

    if (!connectionRequest) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    await connectionRequest.update({ status: 'rejected' });

    res.json({
      message: 'Connection request rejected',
      request: connectionRequest
    });

  } catch (error) {
    console.error('Reject connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel connection request (sent by user)
router.put('/requests/:id/cancel', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const memberId = req.member.id;

    const connectionRequest = await ConnectionRequest.findOne({
      where: {
        id: requestId,
        fromMemberId: memberId,
        status: 'pending'
      }
    });

    if (!connectionRequest) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    await connectionRequest.update({ status: 'cancelled' });

    res.json({
      message: 'Connection request cancelled',
      request: connectionRequest
    });

  } catch (error) {
    console.error('Cancel connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get connections list (accepted requests)
router.get('/connections', auth, async (req, res) => {
  try {
    const memberId = req.member.id;

    const connections = await ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { fromMemberId: memberId },
          { toMemberId: memberId }
        ]
      },
      include: [
        {
          model: Member,
          as: 'fromMember',
          attributes: ['id', 'fullName', 'profileImage', 'profession', 'district', 'area', 'company']
        },
        {
          model: Member,
          as: 'toMember',
          attributes: ['id', 'fullName', 'profileImage', 'profession', 'district', 'area', 'company']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Format connections to show the other member
    const formattedConnections = connections.map(conn => {
      const otherMember = conn.fromMemberId === memberId ? conn.toMember : conn.fromMember;
      return {
        id: conn.id,
        member: otherMember,
        connectedAt: conn.updatedAt
      };
    });

    res.json(formattedConnections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;