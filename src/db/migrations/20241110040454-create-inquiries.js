// src/db/migrations/YYYYMMDDHHMMSS-create-inquiries.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inquiries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      businessId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'answered', 'closed'),
        defaultValue: 'pending'
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responseDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index to help with query performance
    await queryInterface.addIndex('inquiries', ['businessId', 'status']);
    await queryInterface.addIndex('inquiries', ['userId', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inquiries');
  }
};