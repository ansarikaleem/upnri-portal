const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_id'
  },
  type: {
    type: DataTypes.ENUM('connection_request', 'connection_accepted', 'general'),
    defaultValue: 'general'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'related_id'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  }
}, {
  tableName: 'notifications'
});

// Associations
Notification.belongsTo(Member, {
  foreignKey: 'memberId',
  as: 'member'
});

Member.hasMany(Notification, {
  foreignKey: 'memberId',
  as: 'notifications'
});

module.exports = Notification;