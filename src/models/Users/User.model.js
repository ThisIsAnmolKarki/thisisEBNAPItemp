// src/models/users/User.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/db.js';


export const User = sequelize.define('User', {
    
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 20], 
        msg: 'Username must be between 3 and 20 characters long'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Must provide a valid email address'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 100],  
        msg: 'Password must be at least 8 characters long'
      }
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name is required'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name is required'
      }
    }
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,  
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Must provide a valid date of birth'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN, 
    defaultValue: true  
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),  
    defaultValue: 'user'  
  },
  lastLoginAt: {
    type: DataTypes.DATE,  
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,  
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Must provide a valid picture name'
      }
    }
  },
  Phone :{
    type: DataTypes.INTEGER,
    allowNull: false,
    validate:{
        notEmpty:{
            msg: "Must provide phone number"
        }
    }
  }
}, {
  timestamps: true,  
  tableName: 'users',  
});


User.associate = function(models) {
  User.hasMany(models.Review, { 
    as: 'reviews', 
    foreignKey: 'userId' 
  });
  User.hasMany(models.Inquiry, { 
    as: 'inquiries', 
    foreignKey: 'userId' 
  });
  // Keep existing associations
  User.hasMany(models.Business, { 
    as: 'businesses', 
    foreignKey: 'ownerId' 
  });
};