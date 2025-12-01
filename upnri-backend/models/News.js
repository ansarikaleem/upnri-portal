const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'featured_image'
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'author_id'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'members'),
    defaultValue: 'public'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  }
}, {
  tableName: 'news',
  hooks: {
    beforeCreate: (news) => {
      if (!news.slug) {
        news.slug = news.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    }
  }
});

// Associations
News.belongsTo(Member, {
  foreignKey: 'authorId',
  as: 'author'
});

Member.hasMany(News, {
  foreignKey: 'authorId',
  as: 'news'
});

module.exports = News;