import Trainer from "../../models/admin/trainerModel.js";
import mongoose from "mongoose";
import File from "../../models/member/fileModel.js";

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

// Get all trainers
export const getAllTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find().populate('profilePic').sort({ createdAt: -1 });
        res.status(200).json(trainers);
    } catch (error) {
        console.error("Error fetching trainers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update a trainer
export const updateTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTrainer = await Trainer.findByIdAndUpdate(id, updates, { new: true }).populate('profilePic');

        if (!updatedTrainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }

        res.status(200).json({ message: "Trainer updated successfully!", trainer: updatedTrainer });
    } catch (error) {
        console.error("Error updating trainer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete a trainer
export const deleteTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const trainer = await Trainer.findById(id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }

        // Check if trainer has a profile picture and delete the file record
        if (trainer.profilePic) {
            try {
                // Assuming profilePic stores the File ID or we need to find it
                // Based on previous context, profilePic in Trainer model is a reference to File model
                // We should delete the File document. 
                // Note: This does not delete from Google Drive, only the DB record.
                // To delete from Drive, we would need a drive service helper.
                // For now, we are cleaning up the DB reference as requested.

                // If profilePic is an object (populated), use ._id, else use it directly
                const fileId = trainer.profilePic._id || trainer.profilePic;

                // Import File model dynamically or ensure it's imported at top (it's not, so we'll just use mongoose model if not imported, 
                // but better to rely on what we have or just import it)
                // Let's add the import at the top in a separate edit if needed, or assume it's global? 
                // No, ES modules. I'll add the import in a minute, but for now let's write the logic.
                // Actually, checking previous steps, I should probably import File model.
                // But wait, I can't add import here easily without changing top of file. 
                // I will use mongoose.model("File") to retrieve it without restart.

                const File = mongoose.model("File");
                await File.findByIdAndDelete(fileId);
            } catch (fileError) {
                console.error("Error deleting trainer profile picture record:", fileError);
                // Continue with trainer deletion even if file deletion fails
            }
        }

        await Trainer.findByIdAndDelete(id);

        res.status(200).json({ message: "Trainer deleted successfully!" });
    } catch (error) {
        console.error("Error deleting trainer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
