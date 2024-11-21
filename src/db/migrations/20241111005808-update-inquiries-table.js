// src/db/migrations/YYYYMMDDHHMMSS-update-inquiries-table.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add new columns if they don't exist
      await Promise.all([
        // Check if columns exist before adding them
        queryInterface.describeTable('inquiries').then(async (table) => {
          const updates = [];
          
          if (!table.status) {
            updates.push(queryInterface.addColumn('inquiries', 'status', {
              type: Sequelize.ENUM('pending', 'answered', 'closed'),
              defaultValue: 'pending'
            }));
          }
          
          if (!table.responseDate) {
            updates.push(queryInterface.addColumn('inquiries', 'responseDate', {
              type: Sequelize.DATE,
              allowNull: true
            }));
          }

          return Promise.all(updates);
        })
      ]);

      // Add indexes if they don't exist
      await Promise.all([
        queryInterface.addIndex('inquiries', ['businessId'], {
          name: 'inquiries_businessId_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index inquiries_businessId_index already exists');
          } else {
            throw err;
          }
        }),
        
        queryInterface.addIndex('inquiries', ['userId'], {
          name: 'inquiries_userId_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index inquiries_userId_index already exists');
          } else {
            throw err;
          }
        }),
        
        queryInterface.addIndex('inquiries', ['status'], {
          name: 'inquiries_status_index',
          unique: false
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Index inquiries_status_index already exists');
          } else {
            throw err;
          }
        })
      ]);

      // Ensure foreign key constraints exist
      await Promise.all([
        queryInterface.addConstraint('inquiries', {
          fields: ['businessId'],
          type: 'foreign key',
          name: 'fk_inquiries_business',
          references: {
            table: 'businesses',
            field: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }).catch(err => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Constraint fk_inquiries_business already exists');
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
        queryInterface.removeColumn('inquiries', 'status'),
        queryInterface.removeColumn('inquiries', 'responseDate')
      ]);

      // Remove added indexes
      await Promise.all([
        queryInterface.removeIndex('inquiries', 'inquiries_businessId_index'),
        queryInterface.removeIndex('inquiries', 'inquiries_userId_index'),
        queryInterface.removeIndex('inquiries', 'inquiries_status_index')
      ]);

      // Remove constraints
      await queryInterface.removeConstraint('inquiries', 'fk_inquiries_business');
      
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};