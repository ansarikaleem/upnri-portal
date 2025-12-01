const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Event = require('./Event');
const Member = require('./Member');

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id'
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_id'
  },
  formData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'form_data'
  },
  status: {
    type: DataTypes.ENUM('registered', 'attended', 'cancelled'),
    defaultValue: 'registered'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'registered_at'
  },
  

}, {
  tableName: 'event_registrations'
});

// Associations
EventRegistration.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

EventRegistration.belongsTo(Member, {
  foreignKey: 'memberId',
  as: 'member'
});

Event.hasMany(EventRegistration, {
  foreignKey: 'eventId',
  as: 'registrations'
});

Member.hasMany(EventRegistration, {
  foreignKey: 'memberId',
  as: 'eventRegistrations'
});

EventRegistration.associate = function(models) {
  EventRegistration.belongsTo(models.Event, {
    foreignKey: 'eventId',
    as: 'event'
  });
  EventRegistration.belongsTo(models.Member, {
    foreignKey: 'memberId',
    as: 'member' // Make sure this alias matches
  });
};

module.exports = EventRegistration;