import { submitContactForm } from "../../controller/admin/enquiryController.js";
import express from "express";

const publicEnquiryRouter = express.Router();

publicEnquiryRouter.post("/", submitContactForm);

export default publicEnquiryRouter;