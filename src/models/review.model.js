// src/models/review.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';
import { User } from './Users/User.model.js';
import { Business } from './business.model.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {  // Changed from userId to user_id to match database
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  business_id: {  // Changed from businessId to business_id
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [5, 100]
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 1000]
    }
  },
  is_edited: {  // Changed from isEdited to is_edited
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'reviews',
  underscored: true // This tells Sequelize to use snake_case for column names
});

// Define associations
Review.belongsTo(User, { 
  as: 'user',
  foreignKey: 'user_id'  // Match the column name in database
});

Review.belongsTo(Business, { 
  as: 'business',
  foreignKey: 'business_id'  // Match the column name in database
});

Business.hasMany(Review, { 
  as: 'reviews',
  foreignKey: 'business_id'  // Match the column name in database
});

export default Review;