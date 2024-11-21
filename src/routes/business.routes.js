import { Router } from 'express';
import { searchBusinesses } from '../controllers/business/business.controller.js';
import { createBusiness } from '../controllers/business/createBusiness.controller.js';
import { getPublicBusinesses } from '../controllers/business/getPublicBusinesses.controller.js';
import { getBusinessById } from '../controllers/business/getBusinessById.controller.js';
import { updateBusiness } from '../controllers/business/updateBusiness.controller.js';
import { getCategories } from '../controllers/business/category.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { trackBusinessView } from '../middlewares/trackViews.middleware.js';
import { 
    validateBusinessExists, 
    validateBusinessOwnership,
    validateBusinessInformation 
} from '../middlewares/business.middleware.js';

const router = Router();

// Public endpoints - no auth required
router.get('/public/businesses', getPublicBusinesses);
router.get('/businesses/:businessId', trackBusinessView, getBusinessById);
router.get('/categories', getCategories); // New categories endpoint

// Protected endpoints
router.get('/businesses', auth, searchBusinesses);
router.put('/businesses/:businessId', [
    auth, 
    validateBusinessExists,
    validateBusinessOwnership
], updateBusiness);
router.post('/create-business', auth, createBusiness);

export default router;