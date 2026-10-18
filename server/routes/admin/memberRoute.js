/**
 * @file memberRoute.js
 * @description Administrative member management router handling profile lookups, status toggles (block/suspend), and academic filters.
 * @architecture Mounted at `/api/admin/member` in server/index.js, providing administrative oversight over member profiles and records.
 * @agent_note Distinct from `/api/member` which serves authenticated member self-management routes.
 */
import express from 'express';
import {
  getSingleMember,
  getAllMembers,
  getMembersByProfileStatus,
  getMembersByBatch,
  getMembersByFineStatus,
  getMembersBySupplementary,
  getMembersWithPendingSupplementary,
  toggleSuspendStatus,
  toggleBlockStatus,
  updateMemberProfile,
  deleteMember,
  getAdminMemberCounts,
} from '../../controller/admin/memberController.js';
import { getAllMembersWithFines } from '../../controller/admin/fineController.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';

const memberAdminRouter = express.Router();

// Router-level RBAC guard for admin and coordinator
memberAdminRouter.use(verifyToken, verifyRole(['admin', 'coordinator']));

// Get all members (with pagination)
memberAdminRouter.get('/', getAllMembers);

// Literal /counts MUST precede parameterized /:id to prevent /counts being treated as an ObjectId
memberAdminRouter.get('/counts', getAdminMemberCounts);

// Get a single member by ID
memberAdminRouter.get('/:id', getSingleMember);

// Get members by profile status (active, pending, inactive, blocked)
memberAdminRouter.get('/status/:status', getMembersByProfileStatus);

// Get members by batch
memberAdminRouter.get('/batch/:batch', getMembersByBatch);

// Get members with fines
memberAdminRouter.get('/fines/all', getMembersByFineStatus);

// Get members with supplementary exams in a specific semester
memberAdminRouter.get('/supplementary/semester/:semester', getMembersBySupplementary);

// Get members with pending supplementary exams
memberAdminRouter.get('/supplementary/pending', getMembersWithPendingSupplementary);

memberAdminRouter.patch('/:id/block', toggleBlockStatus);

// Suspend/unsuspend member
memberAdminRouter.patch('/:id/suspend', toggleSuspendStatus);
memberAdminRouter.get('/get-all-fine-history', getAllMembersWithFines);

// Update member profile
memberAdminRouter.put('/:id', updateMemberProfile);

// Delete member
memberAdminRouter.delete('/:id', deleteMember);

// Export the router
export default memberAdminRouter;