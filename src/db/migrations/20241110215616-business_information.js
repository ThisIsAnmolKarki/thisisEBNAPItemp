// src/db/migrations/YYYYMMDDHHMMSS-business-information.js
'use strict';

const { QueryInterface } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Business_Information', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses', // Assumes a 'Businesses' table exists
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      menu_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      opening_hours: {
        type: Sequelize.JSON,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Longitude'
      },
      Latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Latitude'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Business_Information');
  }
};
