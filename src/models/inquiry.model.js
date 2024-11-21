// src/models/inquiry.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';
import { User } from './Users/User.model.js';
import { Business } from './business.model.js';

const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 1000]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'answered', 'closed'),
    defaultValue: 'pending'
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'inquiries'
});

// Define associations
Inquiry.belongsTo(User, { 
  as: 'user', 
  foreignKey: 'userId'
});

Inquiry.belongsTo(Business, { 
  as: 'business', 
  foreignKey: 'businessId'
});

Business.hasMany(Inquiry, { 
  as: 'inquiries', 
  foreignKey: 'businessId'
});

export default Inquiry;