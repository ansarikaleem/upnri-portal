const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  civilId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'civil_id'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  area: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  profession: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image'
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_of_birth'
  },
  spouseName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'spouse_name'
  },
  childrenInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'children_info'
  },
  anniversary: {
    type: DataTypes.DATE,
    allowNull: true
  },
  interests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qualifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialty: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  professionalInterests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'professional_interests'
  },
  professionalProfile: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'professional_profile'
  },
  privacySettings: {
    type: DataTypes.JSON,
    defaultValue: {
      personal: 'all',
      contact: 'all',
      professional: 'all'
    },
    field: 'privacy_settings'
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'archived'),
    defaultValue: 'pending'
  },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'editor', 'admin'),
    defaultValue: 'member'
  },
  isOfficeBearer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_office_bearer'
  },
  officeBearerPosition: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'office_bearer_position'
  },
  officeBearerOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'office_bearer_order'
  },
  consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'members',
  hooks: {
    beforeCreate: async (member) => {
      if (member.password) {
        member.password = await bcrypt.hash(member.password, 12);
      }
    },
    beforeUpdate: async (member) => {
      if (member.changed('password')) {
        member.password = await bcrypt.hash(member.password, 12);
      }
    }
  }
});

// Instance method to check password
Member.prototype.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
Member.prototype.getPublicProfile = function() {
  const { password, ...publicData } = this.get();
  return publicData;
};

module.exports = Member;