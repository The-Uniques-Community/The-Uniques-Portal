/**
 * @file guestModel.js
 * @description Mongoose schema and model for event guest speakers, judges, mentors, and VIPs.
 * @architecture Captures external dignitary and speaker profiles linked across multiple events via event IDs and participation tags.
 * @agent_note Events array holds subdocument references to Event model along with role tags (speaker, judge, panelist, etc.).
 */

import mongoose from 'mongoose';

/**
 * Mongoose schema definition for external event guests and dignitaries.
 */
const guestSchema = new mongoose.Schema({
    guestName:{
        type: String,
        required: true
    },
    guestEmail:{
        type: String,
    },
    guestContact:{
        type: String,
    },
    guestLinkedin:{
        type: String,
    },
    guestCompany:{
        type: String,
    },
    guestDesignation:{
        type: String,
    },
    guestImage:{
        type: String,
    },
    events: [{
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        guestTag: {
            type: String,
            enum: ["speaker", "moderator", "panelist", "judge", "mentor", "organizer", "sponsor", "partner", "chief guest", "others"],
            default: "others"
        }
    }]
    
});

const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);

/**
 * @module Guest
 */
export default Guest;