const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Business = sequelize.define('Business', {
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
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'business_name'
  },
  businessDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'business_details'
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  websiteUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'website_url'
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contact_phone'
  },
  businessType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_type'
  },
  natureOfBusiness: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'nature_of_business'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'businesses'
});

// Associations
Business.belongsTo(Member, {
  foreignKey: 'memberId',
  as: 'owner'
});

Member.hasMany(Business, {
  foreignKey: 'memberId',
  as: 'businesses'
});

module.exports = Business;