import express from "express";
import { createCommunityAdmin } from "../../controller/Community/community.controller.js";

const router = express.Router();

router.post("/createCommunityAdmin", createCommunityAdmin);


export default router;
