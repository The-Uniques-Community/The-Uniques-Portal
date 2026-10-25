/**
 * @file successStories.routes.js
 * @description Routes for community success stories, aggregated KPIs, batch cohorts, and admin/coordinator CRUD operations.
 * @architecture Mounted at `/api/success-stories` and `/api/community/success-stories` in server/index.js.
 */
import express from "express";
import {
  getAllSuccessStories,
  getSuccessStoryById,
  getSuccessStoryStats,
  getSuccessStoryBatches,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
} from "../../controller/Community/successStories.controller.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

// Public / Member Read Operations (Specific paths declared before :id)
router.get("/stats", getSuccessStoryStats);
router.get("/batches", getSuccessStoryBatches);
router.get("/", getAllSuccessStories);
router.get("/:id", getSuccessStoryById);

// Protected Admin / Coordinator Write Operations
const authorizedRoles = ["admin", "coordinator", "superadmin", "communityadmin"];

router.post("/", verifyToken, verifyRole(authorizedRoles), createSuccessStory);
router.put("/:id", verifyToken, verifyRole(authorizedRoles), updateSuccessStory);
router.delete("/:id", verifyToken, verifyRole(authorizedRoles), deleteSuccessStory);

export default router;
