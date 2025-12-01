const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const EventRegistrationForm = require('../models/EventRegistrationForm'); // Add this
const Member = require('../models/Member'); // Add this import
const { Op } = require('sequelize');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'upcoming' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { 
      status: 'published'
    };

    if (type === 'upcoming') {
      whereClause.eventDate = { [Op.gte]: new Date() };
    } else if (type === 'past') {
      whereClause.eventDate = { [Op.lt]: new Date() };
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['eventDate', type === 'upcoming' ? 'ASC' : 'DESC']]
    });

    res.json({
      events: events.rows,
      totalPages: Math.ceil(events.count / limit),
      currentPage: parseInt(page),
      totalEvents: events.count
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({
      where: { 
        id,
        status: 'published'
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get registration count
    const registrationCount = await EventRegistration.count({
      where: { eventId: id }
    });

    res.json({
      ...event.toJSON(),
      registrationCount,
      availableSpots: event.maxParticipants ? event.maxParticipants - registrationCount : null
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get event by registration slug (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const event = await Event.findOne({
      where: { 
        registrationSlug: slug,
        status: 'published',
        registrationFormEnabled: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or registration not available' });
    }

    // Get registration count
    const registrationCount = await EventRegistration.count({
      where: { eventId: event.id }
    });

    const publicRegistrationCount = await EventRegistrationForm.count({
      where: { eventId: event.id }
    });

    const totalRegistrations = registrationCount + publicRegistrationCount;

    res.json({
      ...event.toJSON(),
      registrationCount: totalRegistrations,
      availableSpots: event.maxParticipants ? event.maxParticipants - totalRegistrations : null
    });
  } catch (error) {
    console.error('Get event by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register for event (member)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { formData } = req.body;

    const event = await Event.findByPk(id);
    if (!event || event.status !== 'published') {
      return res.status(404).json({ error: 'Event not found or not available for registration' });
    }

    // Check if event date has passed
    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({ error: 'Event registration has closed' });
    }

    // Check if member already registered
    const existingRegistration = await EventRegistration.findOne({
      where: {
        eventId: id,
        memberId: req.member.id
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Check if event is full
    if (event.maxParticipants) {
      const registrationCount = await EventRegistration.count({
        where: { eventId: id }
      });

      const publicRegistrationCount = await EventRegistrationForm.count({
        where: { eventId: id }
      });

      if (registrationCount + publicRegistrationCount >= event.maxParticipants) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Create registration
    const registration = await EventRegistration.create({
      eventId: id,
      memberId: req.member.id,
      formData: formData || {}
    });

    res.status(201).json({
      message: 'Successfully registered for the event',
      registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register for event (public)
router.post('/:id/register-public', async (req, res) => {
  try {
    const { id } = req.params;
    const { formData } = req.body;

    const event = await Event.findByPk(id);
    if (!event || event.status !== 'published' || !event.registrationFormEnabled) {
      return res.status(404).json({ error: 'Event not found or registration not available' });
    }

    // Check if event date has passed
    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({ error: 'Event registration has closed' });
    }

    // Check if event is full
    if (event.maxParticipants) {
      const registrationCount = await EventRegistration.count({
        where: { eventId: id }
      });

      const publicRegistrationCount = await EventRegistrationForm.count({
        where: { eventId: id }
      });

      if (registrationCount + publicRegistrationCount >= event.maxParticipants) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Validate required fields from registration form
    if (event.registrationFields) {
      const registrationFields = typeof event.registrationFields === 'string' 
        ? JSON.parse(event.registrationFields) 
        : event.registrationFields;
      
      for (const field of registrationFields) {
        if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
          return res.status(400).json({ error: `Field "${field.label}" is required` });
        }
      }
    }

    // Create public registration
    const registration = await EventRegistrationForm.create({
      eventId: id,
      formData: event.registrationFields || '[]',
      registrantData: formData
    });

    res.status(201).json({
      message: 'Successfully registered for the event',
      registration
    });
  } catch (error) {
    console.error('Public event registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get event registrations (admin only)
router.get('/:id/registrations', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get member registrations
    const memberRegistrations = await EventRegistration.findAll({
      where: { eventId: id },
      include: [{
        model: Member,
        attributes: ['id', 'fullName', 'email', 'phone'],
        as: 'member' // Make sure this matches your association alias
      }]
    });

    // Get public registrations
    const publicRegistrations = await EventRegistrationForm.findAll({
      where: { eventId: id }
    });

    // Parse JSON data
    const parsedPublicRegistrations = publicRegistrations.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      registrantData: reg.registrantData,
      formData: reg.formData,
      createdAt: reg.createdAt
    }));

    res.json({
      memberRegistrations: memberRegistrations.map(reg => ({
        id: reg.id,
        eventId: reg.eventId,
        memberId: reg.memberId,
        status: reg.status,
        registeredAt: reg.registeredAt,
        formData: reg.formData,
        member: reg.member ? {
          id: reg.member.id,
          fullName: reg.member.fullName,
          email: reg.member.email,
          phone: reg.member.phone
        } : null
      })),
      publicRegistrations: parsedPublicRegistrations
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event registration form (admin only)
router.put('/:id/registration-form', adminAuth, [
  body('registrationFields').optional().isArray(),
  body('registrationSlug').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { registrationFields, registrationFormEnabled, registrationSlug } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if slug is unique (excluding current event)
    if (registrationSlug && registrationSlug !== event.registrationSlug) {
      const existingEvent = await Event.findOne({
        where: {
          registrationSlug,
          id: { [Op.ne]: id }
        }
      });

      if (existingEvent) {
        return res.status(400).json({ error: 'Registration slug already exists' });
      }
    }

    const updateData = {
      registrationFormEnabled: registrationFormEnabled || false,
      registrationSlug: registrationSlug || null
    };

    if (registrationFields) {
      updateData.registrationFields = registrationFields;
    }

    await event.update(updateData);

    res.json({
      message: 'Registration form updated successfully',
      event: {
        ...event.toJSON(),
        registrationFields: registrationFields || event.registrationFields
      }
    });
  } catch (error) {
    console.error('Update registration form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event (admin only)
router.post('/', adminAuth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      eventDate: new Date(req.body.eventDate),
      registrationFormEnabled: req.body.registrationFormEnabled || false,
      registrationSlug: req.body.registrationSlug || null
    };

    // Handle registration fields
    if (req.body.registrationFields) {
      eventData.registrationFields = req.body.registrationFields;
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        ...event.toJSON(),
        registrationFields: event.registrationFields || []
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event (admin only)
router.put('/:id', adminAuth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.body.eventDate) {
      req.body.eventDate = new Date(req.body.eventDate);
    }

    await event.update(req.body);

    res.json({
      message: 'Event updated successfully',
      event: {
        ...event.toJSON(),
        registrationFields: event.registrationFields || []
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;