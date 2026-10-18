/**
 * @file uniques360Route.js
 * @description Uniques360 task management and performance reporting router for student members and coordinators.
 * @architecture Mounted at `/api/uniques360` in server/index.js, routing task assignments, status tracking, and reports through taskController and reportController.
 * @agent_note All task and reporting routes require authentication via `verifyToken`.
 */
import express from 'express';
import verifyToken from '../../middlewares/verifyToken.js';
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

// Task Routes
router.post('/tasks', verifyToken, createTask);
router.get('/tasks/member/:memberId', verifyToken, getMemberTasks);
router.get('/tasks/coordinator/:coordinatorId', verifyToken, getCoordinatorTasks);
router.patch('/tasks/:taskId', verifyToken, updateTaskStatus);
router.put('/tasks/:taskId', verifyToken, updateTask);
router.delete('/tasks/:taskId', verifyToken, deleteTask);
router.post('/tasks/:taskId/members', verifyToken, addMemberToTask);
router.post('/tasks/:taskId/members/remove', verifyToken, removeMemberFromTask);

// Report Routes
router.post('/reports', verifyToken, submitReport);
router.get('/reports/task/:taskId', verifyToken, getTaskReports);

export default router;
