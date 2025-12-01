const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const ConnectionRequest = sequelize.define('ConnectionRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromMemberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'from_member_id'
  },
  toMemberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'to_member_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'connection_requests',
  indexes: [
    {
      unique: true,
      fields: ['fromMemberId', 'toMemberId', 'status'],
      where: {
        status: 'pending'
      }
    }
  ]
});

// Associations
ConnectionRequest.belongsTo(Member, {
  foreignKey: 'fromMemberId',
  as: 'fromMember'
});

ConnectionRequest.belongsTo(Member, {
  foreignKey: 'toMemberId',
  as: 'toMember'
});

Member.hasMany(ConnectionRequest, {
  foreignKey: 'fromMemberId',
  as: 'sentRequests'
});

Member.hasMany(ConnectionRequest, {
  foreignKey: 'toMemberId',
  as: 'receivedRequests'
});

module.exports = ConnectionRequest;