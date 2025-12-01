const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pageType: {
    type: DataTypes.ENUM('static', 'dynamic'),
    defaultValue: 'static',
    field: 'page_type'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'members'),
    defaultValue: 'public'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'published'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by'
  }
}, {
  tableName: 'pages',
  hooks: {
    beforeCreate: (page) => {
      if (!page.slug) {
        page.slug = page.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    }
  }
});

Page.belongsTo(Member, {
  foreignKey: 'createdBy',
  as: 'author'
});

module.exports = Page;