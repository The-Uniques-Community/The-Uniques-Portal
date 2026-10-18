/**
 * @file community.routes.js
 * @description Community administration router providing endpoints for provisioning community administrator accounts.
 * @architecture Mounted at `/api/community` in server/index.js, routing community admin operations to community.controller.
 * @agent_note Used primarily for community administrator bootstrapping and account creation.
 */
import express from "express";
import { createCommunityAdmin } from "../../controller/Community/community.controller.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const router = express.Router();

router.post("/createCommunityAdmin", verifyToken, verifyRole(['admin']), createCommunityAdmin);


export default router;
