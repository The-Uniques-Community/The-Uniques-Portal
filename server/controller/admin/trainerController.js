/**
 * @file trainerController.js
 * @description Controller managing trainer lifecycle including creation, profile retrieval, modification, and deletion with profile picture cleanup.
 * @architecture Part of the admin module mounted at `/api/admin/trainers`. Interfaces with `Trainer` and `File` models.
 * @agent_note When deleting a trainer, their profile picture File document reference in MongoDB is cleaned up if present.
 */
import Trainer from "../../models/admin/trainerModel.js";
import mongoose from "mongoose";

/**
 * @desc Add a new trainer profile
 * @route POST /api/admin/trainers/add-trainer
 * @access Private (Admin)
 * @body {string} fullName - Full name of the trainer
 * @body {string} email - Email address
 * @body {string} contact - Phone/contact number
 * @body {string} origin - Origin type ('uniques' or 'external')
 * @body {string} [designation] - Professional designation (if external)
 * @body {string} [trainerBatch] - Member batch (if uniques origin)
 * @body {string} teachingBatch - Target teaching batch
 * @body {string} course - Course name
 * @body {string} [bio] - Short biography
 * @body {string[]} [skills] - Array of skills/technologies
 * @body {string} [linkedinProfile] - LinkedIn profile URL
 * @body {string} [githubProfile] - GitHub profile URL
 * @returns {Object} 201 - JSON with status and created trainer object
 * @returns {Object} 400 - If trainer with email already exists
 * @returns {Object} 500 - Server error
 */
// Add a new trainer
export const addTrainer = async (req, res) => {
    try {
        const { fullName, email, contact, origin, designation, trainerBatch, teachingBatch, course, bio, skills, linkedinProfile, githubProfile } = req.body;

        const existingTrainer = await Trainer.findOne({ email });
        if (existingTrainer) {
            return res.status(400).json({ message: "Trainer with this email already exists." });
        }

        const newTrainer = new Trainer({
            fullName,
            email,
            contact,
            origin,
            designation: origin === 'external' ? designation : undefined,
            trainerBatch: origin === 'uniques' ? trainerBatch : undefined,
            teachingBatch,
            batch: teachingBatch, // Determine if we still need this field
            course,
            bio,
            skills,
            linkedinProfile,
            githubProfile,
        });

        await newTrainer.save();
        res.status(201).json({ message: "Trainer added successfully!", trainer: newTrainer });
    } catch (error) {
        console.error("Error adding trainer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc Retrieve all trainer profiles with populated profile pictures
 * @route GET /api/admin/trainers/all-trainers
 * @access Private (Admin)
 * @returns {Object[]} 200 - Array of trainer objects sorted newest first
 * @returns {Object} 500 - Server error
 */
// Get all trainers
export const getAllTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find().sort({ createdAt: -1 });
        res.status(200).json(trainers);
    } catch (error) {
        console.error("Error fetching trainers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc Update an existing trainer profile by ID
 * @route PUT /api/admin/trainers/update-trainer/:id
 * @access Private (Admin)
 * @params {string} id - Trainer document ID
 * @body {Object} updates - Updated trainer fields
 * @returns {Object} 200 - JSON with success message and updated trainer object
 * @returns {Object} 404 - If trainer is not found
 * @returns {Object} 500 - Server error
 */
// Update a trainer
export const updateTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTrainer = await Trainer.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedTrainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }

        res.status(200).json({ message: "Trainer updated successfully!", trainer: updatedTrainer });
    } catch (error) {
        console.error("Error updating trainer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc Delete a trainer by ID and clean up associated profile picture File record
 * @route DELETE /api/admin/trainers/delete-trainer/:id
 * @access Private (Admin)
 * @params {string} id - Trainer document ID
 * @returns {Object} 200 - JSON success message
 * @returns {Object} 404 - If trainer is not found
 * @returns {Object} 500 - Server error
 */
// Delete a trainer
export const deleteTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const trainer = await Trainer.findById(id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }

        // Embedded subdocument profilePic deletes automatically with the Trainer document.
        // For backward compatibility with legacy File records:
        if (trainer.profilePic) {
            try {
                const fileId = trainer.profilePic._id || trainer.profilePic;
                if (mongoose.models.File) {
                    await mongoose.models.File.findByIdAndDelete(fileId);
                }
            } catch (fileError) {
                console.error("Error cleaning up legacy trainer profile picture record:", fileError);
            }
        }

        await Trainer.findByIdAndDelete(id);

        res.status(200).json({ message: "Trainer deleted successfully!" });
    } catch (error) {
        console.error("Error deleting trainer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
