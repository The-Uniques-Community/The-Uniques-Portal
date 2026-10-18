/**
 * @file guestController.js
 * @description Controller handling guest speaker operations including creation, listing, bulk seeding, detail retrieval, and event associations.
 * @architecture Interacts with the Mongoose Guest model (server/models/member/guestModel.js) and serves endpoints mounted on `/api/guest`.
 * @agent_note When linking guests to events or bulk uploading, ensure the schema accommodates dynamic event association objects.
 */
import Guest from "../../models/member/guestModel.js";
import { guests } from "../../seeds/guestsSeed.js";

/**
 * @desc    Add a new guest profile to the database
 * @route   POST /api/guest/add-guest
 * @access  Public / Admin
 * @body    {Object} req.body - Guest creation payload
 * @body    {string} req.body.guestName - Name of the guest (required)
 * @body    {string} [req.body.guestEmail] - Contact email address
 * @body    {string} [req.body.guestContact] - Contact phone number
 * @body    {string} [req.body.guestLinkedin] - LinkedIn profile URL
 * @body    {string} [req.body.guestCompany] - Organization / Company affiliation
 * @body    {string} [req.body.guestDesignation] - Professional title or designation
 * @body    {string} [req.body.guestImage] - Remote profile image URL
 * @returns {Object} JSON response containing success flag and created Guest record
 */
export const addGuest = async (req, res) => {
    try {
        const { guestName, guestEmail, guestContact, guestLinkedin, guestCompany, guestDesignation, guestImage } = req.body;

        if (!guestName) {
            return res.status(400).json({ success: false, message: "Guest name is required" });
        }

        const newGuest = new Guest({
            guestName,
            guestEmail,
            guestContact,
            guestLinkedin,
            guestCompany,
            guestDesignation,
            guestImage
        });

        await newGuest.save();

        res.status(201).json({
            success: true,
            message: "Guest added successfully",
            guest: newGuest
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding guest",
            error: error.message
        });
    }
};

/**
 * @desc    Retrieve all guest profiles from the database
 * @route   GET /api/guest/get-all-guests
 * @access  Public
 * @returns {Object} JSON response containing count and array of guest records
 */
export const getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.find();

        res.status(200).json({
            success: true,
            count: guests.length,
            guests,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching guests",
            error: error.message
        });
    }
};

/**
 * @desc    Bulk upload/seed static guest profiles into the database
 * @route   POST /api/guest/bulkUpload
 * @access  Public / Admin
 * @returns {Object} JSON response indicating count of records cleared and re-inserted
 */
export const bulkUploadGuests = async (req, res) => {
    try {
      // Check if there are any guests to upload
      if (!guests || guests.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No guest data found for upload' 
        });
      }
  
      // First, delete all existing guest records
      await Guest.deleteMany({});
      console.log('Cleared existing guest data');
      
      // Insert all guests
      const result = await Guest.insertMany(guests);
      
      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${result.length} guests to database`,
        count: result.length
      });
    } catch (error) {
      console.error('Error in bulk upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload guests',
        error: error.message
      });
    }
};

// ...existing code...

  // ...existing code...

/**
 * @desc    Fetch a single guest profile by its database identifier
 * @route   GET /api/guest/get-guest/:id
 * @access  Public
 * @param   {Object} req - Express request
 * @param   {string} req.params.id - Mongoose ObjectId string of target guest
 * @returns {Object} JSON response containing guest document or error message
 */
export const getGuestById = async (req, res) => {
    try {
        const guestId = req.params.id;
        
        if (!guestId) {
            return res.status(400).json({
                success: false,
                message: "Guest ID is required"
            });
        }

        const guest = await Guest.findById(guestId);

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found"
            });
        }

        res.status(200).json({
            success: true,
            guest
        });

    } catch (error) {
        // Handle invalid ID format error specifically
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid guest ID format",
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error fetching guest",
            error: error.message
        });
    }
};

/**
 * @desc    Associate a guest speaker with a designated event and role tag
 * @route   POST /api/guest/link-event
 * @access  Private (Admin / Coordinator)
 * @body    {Object} req.body - Link payload
 * @body    {string} req.body.guestId - Target guest ObjectId string
 * @body    {string} req.body.eventId - Target event ObjectId string
 * @body    {string} [req.body.guestTag="others"] - Event guest category tag (e.g., keynote, panelist)
 * @returns {Object} JSON response with updated guest profile and associated events
 */
export const linkGuestToEvent = async (req, res) => {
    try {
        const { guestId, eventId, guestTag } = req.body;

        // Validate input
        if (!guestId || !eventId) {
            return res.status(400).json({
                success: false,
                message: "Guest ID and Event ID are required"
            });
        }

        // Find the guest
        const guest = await Guest.findById(guestId);
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: "Guest not found"
            });
        }

        // Check if this event is already linked
        const eventExists = guest.events.some(e => e.event.toString() === eventId);
        
        if (eventExists) {
            return res.status(400).json({
                success: false,
                message: "Guest is already linked to this event"
            });
        }

        // Add the event to the guest's events array
        guest.events.push({
            event: eventId,
            guestTag: guestTag || "others"
        });

        await guest.save();

        return res.status(200).json({
            success: true,
            message: "Guest successfully linked to event",
            guest
        });
    } catch (error) {
        console.error('Error linking guest to event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to link guest to event',
            error: error.message
        });
    }
};