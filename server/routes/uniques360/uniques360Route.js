/**
 * @file uniques360Route.js
 * @description Uniques360 task management and performance reporting router for student members and coordinators.
 * @architecture Mounted at `/api/uniques360` in server/index.js, routing task assignments, status tracking, and reports through taskController and reportController.
 * @agent_note All task and reporting routes require authentication via `verifyToken`.
 */
import express from 'express';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';
import { 
  createTask, 
  getMemberTasks, 
  getCoordinatorTasks, 
  updateTaskStatus,
  addMemberToTask,
  updateTask,
  deleteTask,
  removeMemberFromTask 
} from '../../controller/uniques360/taskController.js';
import { 
  submitReport, 
  getTaskReports 
} from '../../controller/uniques360/reportController.js';

const router = express.Router();

// Coordinator & Admin management routes
router.post('/tasks', verifyToken, verifyRole(['admin', 'coordinator', 'communityadmin']), createTask);
router.get('/tasks/coordinator/:coordinatorId', verifyToken, verifyRole(['admin', 'coordinator', 'communityadmin']), getCoordinatorTasks);
router.put('/tasks/:taskId', verifyToken, verifyRole(['admin', 'coordinator', 'communityadmin']), updateTask);
router.delete('/tasks/:taskId', verifyToken, verifyRole(['admin', 'coordinator', 'communityadmin']), deleteTask);

// Member & Collaboration routes
router.get('/tasks/member/:memberId', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), getMemberTasks);
router.patch('/tasks/:taskId', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), updateTaskStatus);
router.post('/tasks/:taskId/members', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), addMemberToTask);
router.post('/tasks/:taskId/members/remove', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), removeMemberFromTask);

// Report Routes
router.post('/reports', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), submitReport);
router.get('/reports/task/:taskId', verifyToken, verifyRole(['admin', 'coordinator', 'member', 'communityadmin']), getTaskReports);

export default router;
