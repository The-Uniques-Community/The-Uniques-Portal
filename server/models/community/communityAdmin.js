import mongoose from "mongoose";

const CommunityAdminSchema = new mongoose.Schema({
    fullName:{
        type: String,
    },
    email:{
        type: String,  
        unique: true,
    },
    role:{
        type: String,
        default: 'communityAdmin',
    },
    password:{
        type: String,
    },
    coordinatorContact:{
        type: String,
    },
    coordinatorDesignation:{
        type: String,
    },
    profilePic:{
        type: String,
    },
    googleId:{
        type: String,
    }
});

const CommunityAdmin = mongoose.model('CommunityAdmin', CommunityAdminSchema);
export default CommunityAdmin;