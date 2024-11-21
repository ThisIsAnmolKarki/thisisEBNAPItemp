// src/routes/inquiry.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
  createInquiry,
  updateInquiry,
  deleteInquiry,
  respondToInquiry,
  getUserInquiries,
  getBusinessInquiries,
  closeInquiry
} from '../controllers/business/inquiry.controller.js';

const router = Router();

// All routes require authentication
router.use(auth);

// User inquiry routes
router.post('/inquiries', createInquiry);
router.put('/inquiries/:inquiryId', updateInquiry);
router.delete('/inquiries/:inquiryId', deleteInquiry);
router.get('/my-inquiries', getUserInquiries);
router.put('/inquiries/:inquiryId/close', closeInquiry);

// Business owner inquiry routes
router.get('/businesses/:businessId/inquiries', getBusinessInquiries);
router.put('/inquiries/:inquiryId/respond', respondToInquiry);

export default router;