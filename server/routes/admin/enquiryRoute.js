import express from 'express';
import { 
    submitContactForm, 
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus,
    deleteEnquiry ,
    replyToEnquiry
} from '../../controller/admin/enquiryController.js';


const enquiryRoute = express.Router();

// Public route
enquiryRoute.post('/', submitContactForm);

// Protected admin routes
enquiryRoute.get('/', getAllEnquiries);
enquiryRoute.get('/:id', getEnquiryById);
enquiryRoute.patch('/:id/status', updateEnquiryStatus);
enquiryRoute.delete('/:id', deleteEnquiry);
enquiryRoute.post('/:id/reply', replyToEnquiry);

export default enquiryRoute;