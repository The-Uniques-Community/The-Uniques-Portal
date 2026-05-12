import express from "express";
import { addTrainer, getAllTrainers, updateTrainer, deleteTrainer } from "../../controller/admin/trainerController.js";

const router = express.Router();

router.post("/add-trainer", addTrainer);
router.get("/all-trainers", getAllTrainers);
router.put("/update-trainer/:id", updateTrainer);
router.delete("/delete-trainer/:id", deleteTrainer);

export default router;
