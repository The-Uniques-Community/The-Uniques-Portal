import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contact: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        enum: ["uniques", "external"],
        required: true,
        default: "uniques",
    },
    designation: {
        type: String,
        required: function () {
            return this.origin === "external";
        },
    },
    trainerBatch: { // Batch they are from (if Uniques)
        type: String,
        required: function () {
            return this.origin === "uniques";
        },
    },
    teachingBatch: { // Batch they are teaching
        type: String,
        required: true,
    },
    batch: { // Keeping for backward compatibility or removing? Let's keep it and map to teachingBatch for now if needed, or better yet, assume 'batch' in old data refers to 'teachingBatch' and migrate. For now, simply replacing it with the new structure or keeping it as a legacy field while we transition.
        type: String, // Keeping this field to avoid breaking existing code immediately, but logically replaced by teachingBatch
    },
    course: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
    },
    skills: {
        type: [String],
        default: [],
    },
    profileStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    profilePic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
    },
    linkedinProfile: {
        type: String,
        default: "",
    },
    githubProfile: {
        type: String,
        default: "",
    },
}, { timestamps: true });

const Trainer = mongoose.model("Trainer", trainerSchema);

export default Trainer;
