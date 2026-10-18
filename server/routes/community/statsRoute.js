/**
 * @file statsRoute.js
 * @description Community statistics router exposing aggregation counts and administrative metric update endpoints.
 * @architecture Mounted at `/api/stats` in server/index.js, serving overall community engagement statistics to landing and dashboard interfaces.
 * @agent_note Supports multiple route aliases (`/`, `/all`, `/counts`) and update methods (POST/PUT on `/` and `/update`) for flexible frontend consumption.
 */
import express from "express";
import { getStats, updateStats } from "../../controller/Community/statsController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

router.get("/", getStats);
router.get("/all", getStats);
router.get("/counts", getStats);
router.post("/", verifyToken, verifyRole(["admin", "coordinator"]), updateStats);
router.post("/update", verifyToken, verifyRole(["admin", "coordinator"]), updateStats);
router.put("/", verifyToken, verifyRole(["admin", "coordinator"]), updateStats);
router.put("/update", verifyToken, verifyRole(["admin", "coordinator"]), updateStats);

export default router;
