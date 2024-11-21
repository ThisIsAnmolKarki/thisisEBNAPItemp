// src/models/business.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';
import { User } from './Users/User.model.js';

export const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  services: {
    type: DataTypes.TEXT,  // Changed to TEXT to handle longer service lists
    allowNull: false
  },
  contactDetails: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'businesses'
});

Business.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Business, { as: 'businesses', foreignKey: 'ownerId' });

Business.prototype.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
  return this.viewCount;
};

export default Business;