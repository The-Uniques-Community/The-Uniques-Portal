/**
 * @file batchRoute.js
 * @description Community batch router for managing Uniques cohort batches and associated batch profile configurations.
 * @architecture Mounted at `/api/batches` in server/index.js, routing batch CRUD and profile persistence to batchController.
 * @agent_note Supports both POST and PUT methods for `/profiles/update` to handle batch profile synchronizations flexibly.
 */
import express from "express";
import {
  getAllBatches,
  addBatch,
  getBatchProfiles,
  saveBatchProfiles,
  deleteBatchById,
  deleteBatchByName,
} from "../../controller/Community/batchController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

// REST standard routes
router.get("/", getAllBatches);
router.post("/", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), addBatch);

// Named action aliases
router.get("/all", getAllBatches);
router.post("/add", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), addBatch);
router.get("/profiles", getBatchProfiles);
router.post("/profiles/update", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), saveBatchProfiles);
router.put("/profiles/update", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), saveBatchProfiles);
router.delete("/name/:name", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), deleteBatchByName);
router.delete("/:id", verifyToken, verifyRole(["admin", "coordinator", "communityadmin"]), deleteBatchById);

export default router;
