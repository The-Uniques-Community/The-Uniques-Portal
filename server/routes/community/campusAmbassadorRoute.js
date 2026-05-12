import express from 'express';
import { 
  createCommunityAdmin,
  applyForCampusAmbassador,
  getCampusAmbassadorApplications,
  getCampusAmbassadorById,
  updateCampusAmbassadorStatus,
  getCampusAmbassadorStats
} from '../../controller/Community/community.controller.js';

// import { verifyToken, checkAdmin } from '../../middleware/authMiddleware.js';

const campusAmbassadorRouter = express.Router();

// Admin routes
campusAmbassadorRouter.post('/admin/create', createCommunityAdmin);

// Campus Ambassador routes - public
campusAmbassadorRouter.post('/campus-ambassador/apply', applyForCampusAmbassador);

// Campus Ambassador routes - protected
campusAmbassadorRouter.get('/campus-ambassador', getCampusAmbassadorApplications);
campusAmbassadorRouter.get('/campus-ambassador/stats', getCampusAmbassadorStats);
campusAmbassadorRouter.get('/campus-ambassador/:id', getCampusAmbassadorById);
campusAmbassadorRouter.patch('/campus-ambassador/:id/status', updateCampusAmbassadorStatus);

export default campusAmbassadorRouter;