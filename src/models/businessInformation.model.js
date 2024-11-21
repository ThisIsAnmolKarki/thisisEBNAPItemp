// src/models/businessInformation.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db.js';
import { Business } from './business.model.js';

export const BusinessInformation = sequelize.define('BusinessInformation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  menu_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  opening_hours: {
    type: DataTypes.JSON,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  Latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'Business_Information'
});

// Set up the association
BusinessInformation.belongsTo(Business, { 
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasOne(BusinessInformation, {
  foreignKey: 'business_id',
  as: 'businessInformation'
});

export default BusinessInformation;