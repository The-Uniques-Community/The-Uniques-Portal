/**
 * @file guestRoute.js
 * @description Guest speakers and invitees router managing guest profiles, bulk uploading, and guest details retrieval.
 * @architecture Mounted at `/api/guest` in server/index.js, routing guest speaker management to guestController.
 * @agent_note Connects guest entities that are linked to events, sessions, or workshop invitations. Supports standard REST operations.
 */
import { Router } from "express";
import {
  bulkUploadGuests,
  getAllGuests,
  addGuest,
  getGuestById,
  updateGuest,
  deleteGuest,
  linkGuestToEvent
} from "../../controller/guest/guestController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";

const guestRoute = Router();

// Standard REST routes
guestRoute.get("/", getAllGuests);
guestRoute.get("/get-all-guests", getAllGuests);
guestRoute.post("/", verifyToken, verifyRole(["admin", "coordinator"]), addGuest);
guestRoute.get("/:id", getGuestById);
guestRoute.put("/:id", verifyToken, verifyRole(["admin", "coordinator"]), updateGuest);
guestRoute.delete("/:id", verifyToken, verifyRole(["admin", "coordinator"]), deleteGuest);

// Legacy and specific action route aliases
guestRoute.post("/add-guest", verifyToken, verifyRole(["admin", "coordinator"]), addGuest);
guestRoute.get("/get-guest/:id", getGuestById);
guestRoute.put("/update-guest/:id", verifyToken, verifyRole(["admin", "coordinator"]), updateGuest);
guestRoute.delete("/delete-guest/:id", verifyToken, verifyRole(["admin", "coordinator"]), deleteGuest);
guestRoute.post("/bulkUpload", verifyToken, verifyRole(["admin", "coordinator"]), bulkUploadGuests);
guestRoute.post("/link-event", verifyToken, verifyRole(["admin", "coordinator"]), linkGuestToEvent);

export default guestRoute;
