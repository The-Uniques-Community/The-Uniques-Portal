/**
 * @file projectRoute.js
 * @description Project showcase router handling project listings, detail retrieval, creation, modification, and deletion.
 * @architecture Mounted at `/api/projects` and `/api/community/projects` in server/index.js, connecting project showcase operations to projectController.
 * @agent_note Mounts under two different URL prefixes for backwards-compatibility; all CRUD actions alter the shared Project collection.
 */
import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../../controller/Community/projectController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), createProject);
router.put("/:id", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), updateProject);
router.delete("/:id", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), deleteProject);

export default router;
