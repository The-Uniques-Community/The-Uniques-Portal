/**
 * @file adminRoute.js
 * @description Administrative action router handling profile approvals, member status toggling, fine imposition, and admin creation.
 * @architecture Mounted at `/api/admin` in server/index.js, routing core administrative commands to adminControllers.
 * @agent_note Routes in this router delegate execution directly to adminControllers; guarded by verifyToken and verifyRole.
 */
import express from 'express';
import {
  listNewEvent,
  blockMember,
  imposeFine,
  addMember,
  unblockMember,
  approveProfile,
  createAdmin,
} from '../../controller/admin/adminControllers.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';

const adminRoute = express.Router();

// Operational actions: admin + coordinator
adminRoute.post('/approveProfile', verifyToken, verifyRole(['admin', 'coordinator']), approveProfile);
adminRoute.post('/blockMember', verifyToken, verifyRole(['admin', 'coordinator']), blockMember);
adminRoute.post('/unblockMember', verifyToken, verifyRole(['admin', 'coordinator']), unblockMember);
adminRoute.post('/imposeFine', verifyToken, verifyRole(['admin', 'coordinator']), imposeFine);
adminRoute.post('/listNewEvent', verifyToken, verifyRole(['admin', 'coordinator']), listNewEvent);
adminRoute.post('/member/add', verifyToken, verifyRole(['admin', 'coordinator']), addMember);

// Root superadmin action: admin only
adminRoute.post('/createAdmin', verifyToken, verifyRole(['admin']), createAdmin);

export default adminRoute;