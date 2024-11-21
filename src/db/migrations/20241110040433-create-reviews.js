'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {  // Changed from userId to user_id
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      business_id: {  // Changed from businessId to business_id
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_edited: {  // Changed from isEdited to is_edited
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {  // Changed from createdAt to created_at
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {  // Changed from updatedAt to updated_at
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('reviews', ['business_id']);
    await queryInterface.addIndex('reviews', ['user_id']);
    await queryInterface.addIndex('reviews', ['rating']);

    // Add unique constraint
    await queryInterface.addConstraint('reviews', {
      fields: ['user_id', 'business_id'],
      type: 'unique',
      name: 'unique_user_business_review'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  }
};