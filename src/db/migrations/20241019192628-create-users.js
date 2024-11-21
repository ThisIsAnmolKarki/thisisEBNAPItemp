// src/db/migrations/YYYYMMDDHHMMSS-create-users.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,         
        autoIncrement: true,              
        primaryKey: true,                 
        allowNull: false                  
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Must provide a valid email address'
          }
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'First name is required'
          }
        }
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Last name is required'
          }
        }
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,  
        allowNull: true,
        validate: {
          isDate: {
            msg: 'Must provide a valid date of birth'
          }
        }
      },
      isActive: {
        type: Sequelize.BOOLEAN,  
        defaultValue: true  
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'moderator'),  
        defaultValue: 'user' 
      },
      lastLoginAt: {
        type: Sequelize.DATE,  
        allowNull: true
      },
      profilePicture: {
        type: Sequelize.STRING,  
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Must provide a valid picture name'
          }
        }
      },
      Phone :{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: "Must provide phone number"
            }
        }
      }, createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }

    }
  
  )
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropTable("users");
  }
};
