import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    fullName:{
        type: String,
    },
    email:{
        type: String,
        unique: true
    },
    password:{
        type: String,
    },
    role:{
        type: String,
        default: 'admin',
    },
    adminContact:{
        type: String,
    },
    adminDesignation:{
        type: String,
    },
    profilePic:{
        type: String,
    },
    googleId:{
        type: String,
    }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;