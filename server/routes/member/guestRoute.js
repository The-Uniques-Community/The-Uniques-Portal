/**
 * @file guestRoute.js
 * @description Guest speakers and invitees router managing guest profiles, bulk uploading, and guest details retrieval.
 * @architecture Mounted at `/api/guest` in server/index.js, routing guest speaker management to guestController.
 * @agent_note Connects guest entities that are linked to events, sessions, or workshop invitations.
 */
import { Router } from "express";
import { bulkUploadGuests, getAllGuests, addGuest, getGuestById } from "../../controller/guest/guestController.js";
const guestRoute = Router();

guestRoute.post("/bulkUpload", bulkUploadGuests);
guestRoute.get("/get-all-guests", getAllGuests);
guestRoute.post("/add-guest", addGuest);
guestRoute.get("/get-guest/:id", getGuestById);

export default guestRoute;