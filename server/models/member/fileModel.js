/**
 * @file fileModel.js
 * @description Mongoose schema and model for uploaded digital assets and files.
 * @architecture Serves as the central asset registry linking uploaded URLs and cloud IDs to member owners; referenced by Member, Event, and Trainer models.
 * @agent_note fileOwner references Member model; fileUrl points to cloud storage location.
 */

import mongoose from 'mongoose';

/**
 * Mongoose schema definition for uploaded files and media assets.
 */
const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
    },
    fileUrl: {
        type: String,

    },
    fileId: {
        type: String,

    },
    fileOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const File = mongoose.models.File || mongoose.model('File', fileSchema);

/**
 * @module File
 */
export default File;