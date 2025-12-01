const express = require('express');
const { auth } = require('../middleware/auth');
const Member = require('../models/Member');
const Business = require('../models/Business');
const EventRegistration = require('../models/EventRegistration');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const memberId = req.member.id;

    const [eventsRegistered, businesses] = await Promise.all([
      EventRegistration.count({ where: { memberId } }),
      Business.count({ where: { memberId } })
    ]);

    res.json({
      eventsRegistered,
      businesses,
      posts: 0, // Placeholder for posts
      connections: 0 // Placeholder for connections
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/activities', auth, async (req, res) => {
  try {
    const memberId = req.member.id;

    // Get recent event registrations
    const recentRegistrations = await EventRegistration.findAll({
      where: { memberId },
      include: [{ association: 'event', attributes: ['title'] }],
      limit: 5,
      order: [['registeredAt', 'DESC']]
    });

    // Get recent business registrations
    const recentBusinesses = await Business.findAll({
      where: { memberId },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    const activities = [
      ...recentRegistrations.map(reg => ({
        type: 'event_registration',
        description: `Registered for "${reg.event.title}"`,
        timestamp: reg.registeredAt
      })),
      ...recentBusinesses.map(business => ({
        type: 'business_registration',
        description: `Registered business "${business.businessName}"`,
        timestamp: business.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;