// src/controllers/business/createBusiness.controller.js
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { sequelize } from '../../db/db.js';

export const createBusiness = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    
    const {
      businessName,
      description,
      category,
      address,
      services,
      contactDetails,
      // Business Information fields
      image_url,
      menu_url,
      opening_hours,
      country,
      city,
      longitude,
      latitude,
      price
    } = req.body;

    // Validate required fields
    const requiredFields = {
      businessName,
      category,
      address,
      services,
      contactDetails,
      country,
      city,
      longitude,
      latitude
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Create business
    const business = await Business.create({
      businessName,
      description,
      category,
      address,
      services: services.toString(), // Ensure services is stored as string
      contactDetails,
      ownerId: userId,
      isVerified: false
    }, { transaction });

    console.log('Business created:', business.toJSON());

    // Create business information
    const businessInfo = await BusinessInformation.create({
      business_id: business.id,
      image_url,
      menu_url,
      opening_hours: opening_hours || {},
      country,
      city,
      Longitude: longitude,
      Latitude: latitude,
      price,
      rating: 0 // Initial rating
    }, { transaction });

    console.log('Business information created:', businessInfo.toJSON());

    await transaction.commit();

    // Fetch the complete business data with associations
    const completeBusinessData = await Business.findOne({
      where: { id: business.id },
      include: [{
        model: BusinessInformation,
        as: 'businessInformation'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: completeBusinessData
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating business:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create business',
      error: error.message,
      details: error.stack // Adding stack trace for debugging
    });
  }
};