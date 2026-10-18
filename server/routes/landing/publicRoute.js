/**
 * @file publicRoute.js
 * @description Public contact inquiry submission router allowing external visitors to submit contact messages.
 * @architecture Mounted at `/api/contact` in server/index.js, routing public message submissions directly to enquiryController.
 * @agent_note Open public endpoint; requests create new enquiry records in the database.
 */
import { submitContactForm } from "../../controller/admin/enquiryController.js";
import express from "express";

const publicEnquiryRouter = express.Router();

publicEnquiryRouter.post("/", submitContactForm);

export default publicEnquiryRouter;