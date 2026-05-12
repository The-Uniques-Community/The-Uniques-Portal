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
 
const fineRouter = express.Router();

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