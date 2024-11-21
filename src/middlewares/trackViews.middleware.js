// src/middlewares/trackViews.middleware.js
import { Business } from '../models/business.model.js';

export const trackBusinessView = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    if (businessId && req.method === 'GET') {
      const business = await Business.findByPk(businessId);
      if (business) {
        await business.incrementViewCount();
      }
    }
    next();
  } catch (error) {
    console.error('Error tracking business view:', error);
    next(); // Continue to next middleware even if tracking fails
  }
};