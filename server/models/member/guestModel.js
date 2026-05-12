import mongoose from 'mongoose'

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

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;