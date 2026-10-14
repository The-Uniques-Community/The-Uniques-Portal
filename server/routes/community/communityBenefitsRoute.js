import express from "express";
import {
  getBenefitsCards,
  updateBenefitsCards,
} from "../../controller/Community/communityBenefitsController.js";

const router = express.Router();

router.get("/", getBenefitsCards);
router.post("/update", updateBenefitsCards);
router.put("/update", updateBenefitsCards);

export default router;
