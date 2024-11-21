'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add title column if it doesn't exist
    await queryInterface.describeTable('reviews').then(async (tableDefinition) => {
      if (!tableDefinition.title) {
        await queryInterface.addColumn('reviews', 'title', {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'Review Title', // Temporary default value for existing records
        });
      }
    });

    // First, check if the constraint exists
    try {
      const constraints = await queryInterface.showConstraint('reviews', 'unique_user_business_review');
      if (!constraints) {
        // Add constraint only if it doesn't exist
        await queryInterface.addConstraint('reviews', {
          fields: ['userId', 'businessId'],
          type: 'unique',
          name: 'unique_user_business_review'
        });
      }
    } catch (error) {
      console.log('Constraint already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove column
    await queryInterface.removeColumn('reviews', 'title');
    
    // Try to remove constraint if it exists
    try {
      await queryInterface.removeConstraint('reviews', 'unique_user_business_review');
    } catch (error) {
      console.log('Constraint might not exist, skipping removal...');
    }
  }
};