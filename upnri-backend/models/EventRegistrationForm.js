// models/EventRegistrationForm.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventRegistrationForm = sequelize.define('EventRegistrationForm', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  formData: {
    type: DataTypes.JSON,
    allowNull: false
  },
  registrantData: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'event_registration_forms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
EventRegistrationForm.associate = function(models) {
  EventRegistrationForm.belongsTo(models.Event, {
    foreignKey: 'eventId',
    as: 'event'
  });
};

module.exports = EventRegistrationForm;