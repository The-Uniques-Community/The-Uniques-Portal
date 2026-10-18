/**
 * @file communityBenefitsRoute.js
 * @description Community perks and benefits card configuration router for retrieving and updating community benefit cards.
 * @architecture Mounted at `/api/community-benefits` in server/index.js, serving data for community perks shown on landing and community pages.
 * @agent_note Both POST and PUT are supported on `/update` for updating benefit cards in the database.
 */
import express from "express";
import {
  getBenefitsCards,
  updateBenefitsCards,
} from "../../controller/Community/communityBenefitsController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

router.get("/", getBenefitsCards);
router.post("/update", verifyToken, verifyRole(["admin", "coordinator"]), updateBenefitsCards);
router.put("/update", verifyToken, verifyRole(["admin", "coordinator"]), updateBenefitsCards);

export default router;
