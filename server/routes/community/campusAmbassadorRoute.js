/**
 * @file campusAmbassadorRoute.js
 * @description Campus Ambassador program router handling public applications, application review, status management, and statistics.
 * @architecture Mounted at `/api` in server/index.js, serving both public student application submissions and administrative review workflows.
 * @agent_note Mounted directly at `/api`; application endpoints resolve to `/api/campus-ambassador/*` and admin creation to `/api/admin/create`.
 */
import express from 'express';
import { 
  createCommunityAdmin,
  applyForCampusAmbassador,
  getCampusAmbassadorApplications,
  getCampusAmbassadorById,
  updateCampusAmbassadorStatus,
  getCampusAmbassadorStats
} from '../../controller/Community/community.controller.js';

import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';

const campusAmbassadorRouter = express.Router();

// Admin routes
campusAmbassadorRouter.post('/admin/create', verifyToken, verifyRole(['admin']), createCommunityAdmin);

// Campus Ambassador routes - public
campusAmbassadorRouter.post('/campus-ambassador/apply', applyForCampusAmbassador);
campusAmbassadorRouter.post('/apply-campus-ambassador', applyForCampusAmbassador);

// Campus Ambassador routes - protected
campusAmbassadorRouter.get('/campus-ambassador', verifyToken, verifyRole(['admin', 'coordinator']), getCampusAmbassadorApplications);
campusAmbassadorRouter.get('/campus-ambassador/stats', verifyToken, verifyRole(['admin', 'coordinator']), getCampusAmbassadorStats);
campusAmbassadorRouter.get('/campus-ambassador/:id', verifyToken, verifyRole(['admin', 'coordinator']), getCampusAmbassadorById);
campusAmbassadorRouter.patch('/campus-ambassador/:id/status', verifyToken, verifyRole(['admin', 'coordinator']), updateCampusAmbassadorStatus);

export default campusAmbassadorRouter;