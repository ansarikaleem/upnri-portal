const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Event = require('./Event');
const Member = require('./Member');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'image_path'
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'event_id'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  visibility: {
    type: DataTypes.ENUM('public', 'members'),
    defaultValue: 'public'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'uploaded_by'
  }
}, {
  tableName: 'gallery'
});

// Associations
Gallery.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

Gallery.belongsTo(Member, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

module.exports = Gallery;