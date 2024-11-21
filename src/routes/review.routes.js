// src/routes/review.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
  createReview,
  updateReview,
  deleteReview,
  getBusinessReviews
} from '../controllers/business/review.controller.js';

const router = Router();

// Public routes
router.get('/businesses/:businessId/reviews', getBusinessReviews);

// Protected routes
router.post('/reviews', auth, createReview);
router.put('/reviews/:reviewId', auth, updateReview);
router.delete('/reviews/:reviewId', auth, deleteReview);

export default router;