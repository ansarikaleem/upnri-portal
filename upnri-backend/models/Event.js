const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'event_date'
  },
  venue: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_participants'
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'featured_image'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'members'),
    defaultValue: 'public'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
    defaultValue: 'draft'
  },
  registrationForm: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'registration_form'
  },
  registrationFormEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
registrationSlug: {
  type: DataTypes.STRING(255),
  unique: true,
  allowNull: true
},
registrationFields: {
  type: DataTypes.JSON,
  defaultValue: '[]'
}
  
  
}, {
  tableName: 'events'
});

Event.associate = function(models) {
  Event.hasMany(models.EventRegistration, {
    foreignKey: 'eventId',
    as: 'registrations'
  });
  Event.hasMany(models.EventRegistrationForm, {
    foreignKey: 'eventId',
    as: 'publicRegistrations'
  });
};

module.exports = Event;