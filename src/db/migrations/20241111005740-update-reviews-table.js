'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add new columns if they don't exist
      await Promise.all([
        // Check if columns exist before adding them
        queryInterface.describeTable('reviews').then(async (table) => {
          const updates = [];
          
          if (!table.upvotes) {
            updates.push(queryInterface.addColumn('reviews', 'upvotes', {
              type: Sequelize.INTEGER,
              defaultValue: 0
            }));
          }
          
          if (!table.downvotes) {
            updates.push(queryInterface.addColumn('reviews', 'downvotes', {
              type: Sequelize.INTEGER,
              defaultValue: 0
            }));
          }
          
          if (!table.is_edited) {
            updates.push(queryInterface.addColumn('reviews', 'is_edited', {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            }));
          }

          return Promise.all(updates);
        })
      ]);

      // Add indexes if they don't exist
      await Promise.all([
        queryInterface.addIndex('reviews', ['business_id'], {
          name: 'reviews_business_id_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index reviews_business_id_index already exists');
          } else {
            throw err;
          }
        }),
        
        queryInterface.addIndex('reviews', ['user_id'], {
          name: 'reviews_user_id_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index reviews_user_id_index already exists');
          } else {
            throw err;
          }
        }),
        
        queryInterface.addIndex('reviews', ['rating'], {
          name: 'reviews_rating_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index reviews_rating_index already exists');
          } else {
            throw err;
          }
        })
      ]);

    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove added columns
      await Promise.all([
        queryInterface.removeColumn('reviews', 'upvotes'),
        queryInterface.removeColumn('reviews', 'downvotes'),
        queryInterface.removeColumn('reviews', 'is_edited')
      ]);

      // Remove added indexes
      await Promise.all([
        queryInterface.removeIndex('reviews', 'reviews_business_id_index'),
        queryInterface.removeIndex('reviews', 'reviews_user_id_index'),
        queryInterface.removeIndex('reviews', 'reviews_rating_index')
      ]);
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};