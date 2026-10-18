/**
 * @file leaveRoute.js
 * @description Member leave application and administrative leave approval/rejection lifecycle router.
 * @architecture Mounted at `/api/leave` in server/index.js, protecting all endpoints with verifyToken middleware.
 * @agent_note Route order matters: static subpaths (`/submit`, `/my-leaves`, `/all`, `/pending`) and action paths (`/:id/approve`, `/:id/reject`) are mounted before generic `/:id`.
 */
import express from "express";
import {
  submitLeaveRequest,
  getMyLeaves,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllPendingLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getLeaveById,
} from "../../controller/member/leaveController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const leaveRoute = express.Router();

// Static routes first (before /:id to avoid param conflicts)
leaveRoute.post("/submit", verifyToken, submitLeaveRequest);
leaveRoute.get("/my-leaves", verifyToken, getMyLeaves);

// Coordinator & Admin management only
leaveRoute.get("/all", verifyToken, verifyRole(['admin', 'coordinator']), getAllLeaves);
leaveRoute.get("/pending", verifyToken, verifyRole(['admin', 'coordinator']), getAllPendingLeaves);

// Param-specific action routes before generic /:id
leaveRoute.put("/:id/approve", verifyToken, verifyRole(['admin', 'coordinator']), approveLeave);
leaveRoute.put("/:id/reject", verifyToken, verifyRole(['admin', 'coordinator']), rejectLeave);

// Generic /:id routes last
leaveRoute.get("/:id", verifyToken, getLeaveById);
leaveRoute.put("/:id", verifyToken, updateLeaveRequest);
leaveRoute.delete("/:id", verifyToken, deleteLeaveRequest);

export default leaveRoute;
