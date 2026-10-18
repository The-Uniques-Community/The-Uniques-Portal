/**
 * @file trainerRoute.js
 * @description Administrative trainer management router handling trainer registration, listing, updating, and removal.
 * @architecture Mounted at `/api/admin/trainers` in server/index.js, connecting trainer CRUD operations to trainerController.
 * @agent_note GET /all-trainers is deliberately kept public for the landing page mentors section.
 */
import express from "express";
import { addTrainer, getAllTrainers, updateTrainer, deleteTrainer } from "../../controller/admin/trainerController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

// PUBLIC: Mentors showcase on public homepage
router.get("/all-trainers", getAllTrainers);

// PROTECTED: Operational CRUD (admin and coordinator)
router.post("/add-trainer", verifyToken, verifyRole(["admin", "coordinator"]), addTrainer);
router.put("/update-trainer/:id", verifyToken, verifyRole(["admin", "coordinator"]), updateTrainer);
router.delete("/delete-trainer/:id", verifyToken, verifyRole(["admin", "coordinator"]), deleteTrainer);

export default router;
