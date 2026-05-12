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