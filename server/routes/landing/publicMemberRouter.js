/**
 * @file publicMemberRouter.js
 * @description Public member showcase router providing unauthenticated access to member profiles and member count metrics.
 * @architecture Mounted at `/api/public/members` in server/index.js, serving public profile data for landing page showcases and portfolio views.
 * @agent_note Unauthenticated endpoints; ensure returned member objects strip private or sensitive fields such as passwords and contact info.
 */
import express from "express";
import { 
  getPublicMembers, 
  getPublicMemberById, 
  getMemberCounts
} from "../../controller/landing/memberController.js";

const publicMemberRouter = express.Router();

// Get all public members with optional filtering
publicMemberRouter.get("/", getPublicMembers);
// Get a single public member by ID

publicMemberRouter.get("/counts", getMemberCounts)
publicMemberRouter.get("/:id", getPublicMemberById);

export default publicMemberRouter;