import express from "express";
import { getStats, updateStats } from "../../controller/Community/statsController.js";

const router = express.Router();

router.get("/", getStats);
router.get("/all", getStats);
router.get("/counts", getStats);
router.post("/", updateStats);
router.post("/update", updateStats);
router.put("/", updateStats);
router.put("/update", updateStats);

export default router;
