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
} from '../../controller/admin/memberController.js';
import { getAllMembersWithFines } from '../../controller/admin/fineController.js';

const memberAdminRouter = express.Router();

// Get all members (with pagination)
memberAdminRouter.get('/', getAllMembers);

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
memberAdminRouter.get('/get-all-fine-history', getAllMembersWithFines)

// Update member profile
memberAdminRouter.put('/:id', updateMemberProfile);

// Delete member
memberAdminRouter.delete('/:id', deleteMember);


// Export the router
export default memberAdminRouter;