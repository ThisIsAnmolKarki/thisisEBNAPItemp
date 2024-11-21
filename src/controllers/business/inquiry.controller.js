// src/controllers/inquiry/inquiry.controller.js
import Inquiry from '../../models/inquiry.model.js';
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { User } from '../../models/Users/User.model.js';
import { sequelize } from '../../db/db.js';

export const createInquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { businessId, message } = req.body;

    // Validate business exists
    const business = await Business.findOne({
      where: { id: businessId },
      include: [{
        model: BusinessInformation,
        as: 'businessInformation'
      }]
    });

    if (!business) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (!message) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const inquiry = await Inquiry.create({
      userId,
      businessId,
      message
    }, { transaction });

    await transaction.commit();

    // Fetch complete inquiry data with associations
    const completeInquiry = await Inquiry.findOne({
      where: { id: inquiry.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: completeInquiry
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inquiry',
      error: error.message
    });
  }
};

export const getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await Inquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(inquiries.count / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        inquiries: inquiries.rows,
        pagination: {
          total: inquiries.count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

export const getBusinessInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Verify business ownership
    const business = await Business.findOne({
      where: {
        id: businessId,
        ownerId: userId
      },
      include: [{
        model: BusinessInformation,
        as: 'businessInformation'
      }]
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view inquiries for your own business'
      });
    }

    const whereClause = { businessId };
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await Inquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(inquiries.count / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        inquiries: inquiries.rows,
        pagination: {
          total: inquiries.count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching business inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

export const respondToInquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { inquiryId } = req.params;
    const { response } = req.body;

    // Find the inquiry and include the business to check ownership
    const inquiry = await Inquiry.findOne({
      where: { id: inquiryId },
      include: [{
        model: Business,
        as: 'business',
        include: [{
          model: BusinessInformation,
          as: 'businessInformation'
        }]
      }]
    });

    if (!inquiry) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if the user owns the business
    if (inquiry.business.ownerId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only business owner can respond to inquiries'
      });
    }

    await inquiry.update({
      response,
      status: 'answered',
      responseDate: new Date()
    }, { transaction });

    await transaction.commit();

    const updatedInquiry = await Inquiry.findOne({
      where: { id: inquiryId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: updatedInquiry
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error responding to inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to inquiry',
      error: error.message
    });
  }
};

export const updateInquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { inquiryId } = req.params;
    const { message } = req.body;

    const inquiry = await Inquiry.findOne({
      where: {
        id: inquiryId,
        userId,
        status: 'pending'
      }
    });

    if (!inquiry) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found, unauthorized, or already answered'
      });
    }

    await inquiry.update({ message }, { transaction });

    await transaction.commit();

    const updatedInquiry = await Inquiry.findOne({
      where: { id: inquiryId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: updatedInquiry
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

export const closeInquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findOne({
      where: {
        id: inquiryId,
        userId,
        status: 'answered'
      }
    });

    if (!inquiry) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found, unauthorized, or not in answered status'
      });
    }

    await inquiry.update({ status: 'closed' }, { transaction });

    await transaction.commit();

    const updatedInquiry = await Inquiry.findOne({
      where: { id: inquiryId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          include: [{
            model: BusinessInformation,
            as: 'businessInformation'
          }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry closed successfully',
      data: updatedInquiry
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error closing inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close inquiry',
      error: error.message
    });
  }
};

export const deleteInquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findOne({
      where: {
        id: inquiryId,
        userId,
        status: 'pending' // Can only delete pending inquiries
      }
    });

    if (!inquiry) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found, unauthorized, or already answered'
      });
    }

    await inquiry.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};