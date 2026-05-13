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

const leaveRoute = express.Router();

// Static routes first (before /:id to avoid param conflicts)
leaveRoute.post("/submit", verifyToken, submitLeaveRequest);
leaveRoute.get("/my-leaves", verifyToken, getMyLeaves);
leaveRoute.get("/all", verifyToken, getAllLeaves);
leaveRoute.get("/pending", verifyToken, getAllPendingLeaves);

// Param-specific action routes before generic /:id
leaveRoute.put("/:id/approve", verifyToken, approveLeave);
leaveRoute.put("/:id/reject", verifyToken, rejectLeave);

// Generic /:id routes last
leaveRoute.get("/:id", verifyToken, getLeaveById);
leaveRoute.put("/:id", verifyToken, updateLeaveRequest);
leaveRoute.delete("/:id", verifyToken, deleteLeaveRequest);

export default leaveRoute;
