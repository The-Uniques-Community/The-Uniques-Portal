import express from "express";
import {
  getAllBatches,
  addBatch,
  getBatchProfiles,
  saveBatchProfiles,
} from "../../controller/Community/batchController.js";

const router = express.Router();

router.get("/all", getAllBatches);
router.post("/add", addBatch);
router.get("/profiles", getBatchProfiles);
router.post("/profiles/update", saveBatchProfiles);
router.put("/profiles/update", saveBatchProfiles);

export default router;
