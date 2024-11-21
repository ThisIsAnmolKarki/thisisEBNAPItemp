// src/controllers/business/updateBusiness.controller.js
import { Business } from '../../models/business.model.js';
import { BusinessInformation } from '../../models/businessInformation.model.js';
import { sequelize } from '../../db/db.js';

export const updateBusiness = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Find business and check ownership
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

    // Check ownership
    if (Number(business.ownerId) !== Number(userId)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own business'
      });
    }

    // Extract update fields
    const {
      // Business base fields
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

    // Update business base information
    const businessUpdates = {};
    if (businessName) businessUpdates.businessName = businessName;
    if (description) businessUpdates.description = description;
    if (category) businessUpdates.category = category;
    if (address) businessUpdates.address = address;
    if (services) businessUpdates.services = services;
    if (contactDetails) businessUpdates.contactDetails = contactDetails;

    // Update business information
    const businessInfoUpdates = {};
    if (image_url) businessInfoUpdates.image_url = image_url;
    if (menu_url) businessInfoUpdates.menu_url = menu_url;
    if (opening_hours) businessInfoUpdates.opening_hours = opening_hours;
    if (country) businessInfoUpdates.country = country;
    if (city) businessInfoUpdates.city = city;
    if (longitude) businessInfoUpdates.Longitude = longitude;
    if (latitude) businessInfoUpdates.Latitude = latitude;
    if (price) businessInfoUpdates.price = price;

    // Perform updates
    if (Object.keys(businessUpdates).length > 0) {
      await Business.update(businessUpdates, {
        where: { id: businessId },
        transaction
      });
    }

    if (Object.keys(businessInfoUpdates).length > 0) {
      await BusinessInformation.update(businessInfoUpdates, {
        where: { business_id: businessId },
        transaction
      });
    }

    await transaction.commit();

    // Fetch updated business data
    const updatedBusiness = await Business.findOne({
      where: { id: businessId },
      include: [{
        model: BusinessInformation,
        as: 'businessInformation'
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update Error:', error);
    
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
      message: 'Failed to update business',
      error: error.message
    });
  }
};