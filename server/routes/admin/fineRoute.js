/**
 * @file fineRoute.js
 * @description Administrative fine management router for member penalty tracking, status updates, and fine statistics.
 * @architecture Mounted at `/api/admin/fine` in server/index.js, routing fine administration queries and mutations to fineController.
 * @agent_note Distinct from `server/routes/member/fineRoute.js` which handles member self-service fine lookups.
 */
import express from "express";
import { 
  searchMembers,
  imposeFine, 
  updateFineStatus, 
  removeFine, 
  getPendingFines, 
  getFineHistory,
  getFineStatistics,
  getMembersWithPendingFines,
  getAllMembersWithFines
} from "../../controller/admin/fineController.js";
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';
 
const fineRouter = express.Router();

// Apply router-level authentication and role-based access control
fineRouter.use(verifyToken, verifyRole(['admin', 'coordinator']));

// Search members route
fineRouter.get('/members/search', searchMembers);
fineRouter.get('/fines/members', getAllMembersWithFines);
// Fine management for a specific member
fineRouter.post('/members/:memberId/fines', imposeFine);
fineRouter.patch('/members/:memberId/fines/:fineId', updateFineStatus);
fineRouter.delete('/members/:memberId/fines/:fineId', removeFine);
fineRouter.get('/members/:memberId/fines/pending', getPendingFines);
fineRouter.get('/members/:memberId/fines', getFineHistory);

// Fine statistics and aggregate data
fineRouter.get('/fines/statistics', getFineStatistics);

fineRouter.get('/fines/pending/members', getMembersWithPendingFines);

export default fineRouter;