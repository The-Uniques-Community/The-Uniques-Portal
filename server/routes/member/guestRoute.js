import { Router } from "express";
import { bulkUploadGuests, getAllGuests, addGuest, getGuestById, linkGuestToEvent } from "../../controller/guest/guestController.js";
const guestRoute = Router();

guestRoute.post("/bulkUpload", bulkUploadGuests);
guestRoute.get("/get-all-guests", getAllGuests);
guestRoute.post("/add-guest", addGuest);
guestRoute.get("/get-guest/:id", getGuestById);

export default guestRoute;