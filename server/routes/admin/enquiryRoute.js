/**
 * @file enquiryRoute.js
 * @description Administrative enquiry router for querying, status updating, replying to, and deleting member or public inquiries.
 * @architecture Mounted at `/api/admin/enquiry` in server/index.js, routing management operations to enquiryController.
 * @agent_note Supports administrative enquiry lifecycle management including automated reply dispatches via replyToEnquiry.
 */
import express from 'express';
import { 
    submitContactForm, 
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus,
    deleteEnquiry,
    replyToEnquiry
} from '../../controller/admin/enquiryController.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';

const enquiryRoute = express.Router();

// Public route: Public contact form submission
enquiryRoute.post('/', submitContactForm);

// Protected admin & coordinator routes
enquiryRoute.get('/', verifyToken, verifyRole(['admin', 'coordinator']), getAllEnquiries);
enquiryRoute.get('/:id', verifyToken, verifyRole(['admin', 'coordinator']), getEnquiryById);
enquiryRoute.patch('/:id/status', verifyToken, verifyRole(['admin', 'coordinator']), updateEnquiryStatus);
enquiryRoute.delete('/:id', verifyToken, verifyRole(['admin', 'coordinator']), deleteEnquiry);
enquiryRoute.post('/:id/reply', verifyToken, verifyRole(['admin', 'coordinator']), replyToEnquiry);

export default enquiryRoute;