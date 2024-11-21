// src/middlewares/business.middleware.js
import { Business } from '../models/business.model.js';
import { BusinessInformation } from '../models/businessInformation.model.js';
import { User } from '../models/Users/User.model.js';

export const validateBusinessExists = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const business = await Business.findOne({
      where: { id: businessId },
      include: [
        {
          model: BusinessInformation,
          as: 'businessInformation'
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error('Error validating business:', error);
    next(error);
  }
};

export const validateBusinessOwnership = async (req, res, next) => {
  try {
    if (!req.business) {
      throw new Error('Business validation middleware must be called first');
    }

    const userId = req.user.id;

    if (Number(req.business.ownerId) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the owner of this business'
      });
    }

    next();
  } catch (error) {
    console.error('Error validating business ownership:', error);
    next(error);
  }
};

export const validateBusinessInformation = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.businessId;
    
    const businessInfo = await BusinessInformation.findOne({
      where: { business_id: businessId }
    });

    if (!businessInfo) {
      return res.status(404).json({
        success: false,
        message: 'Business information not found'
      });
    }

    req.businessInfo = businessInfo;
    next();
  } catch (error) {
    console.error('Error validating business information:', error);
    next(error);
  }
};