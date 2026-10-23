/**
 * @file userModel.js
 * @description Unified User model consolidating Member, Admin, and CommunityAdmin entities.
 * @architecture Central canonical identity model for authentication, authorization, profiles, and relationships.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fileAttachmentSchema from "../common/fileAttachmentSchema.js";
import {
  calculateMemberStatus,
  getMemberAdmissionYear,
  getMemberGraduationYear,
} from "../../utils/memberStatus.js";

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, default: "", trim: true },
  technologies: { type: [String], default: [] },
  link: { type: String, default: "", trim: true },
  imageUrl: { type: String, default: "", trim: true },
  createdAt: { type: Date, default: Date.now },
});

const fineSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dateImposed: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "paid", "waived"],
    default: "pending",
  },
  reason: { type: String, trim: true },
  proofOfPayment: {
    type: fileAttachmentSchema,
    default: null,
  },
});

const semesterSGPASchema = new mongoose.Schema({
  semester: { type: Number, min: 1, max: 8, required: true },
  sgpa: { type: Number, min: 0, max: 10, required: true },
});

const semesterSupplementarySchema = new mongoose.Schema({
  semester: { type: Number, min: 1, max: 8, required: true },
  subjects: [
    {
      subjectCode: { type: String, required: true, trim: true },
      subjectName: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ["pending", "passed", "failed"],
        default: "pending",
      },
    },
  ],
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: { type: String, select: false }, // Hidden by default from JSON serialization
    googleId: { type: String, sparse: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "coordinator", "communityadmin", "member", "guest"],
      default: "member",
      lowercase: true,
      trim: true,
    },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }, // Session invalidation counter

    // Student & Academic Attributes
    admno: {
      type: String,
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{4}(BTCS|BTCED|BTCSD|BCAPU|BCAPTU|BTAIML)[0-9]{3}$/,
        "Invalid admission number format",
      ],
    },
    batch: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      enum: ["B.Tech CSE", "CSD", "BCA", "BTech AI/ML", "B.Tech AI/ML"],
    },
    admissionYear: { type: Number, min: 2000, max: 2100 },
    graduationYear: { type: Number, min: 2000, max: 2100 },
    isPlaced: { type: Boolean, default: false },

    // Contact & Profile
    contact: { type: String, trim: true },
    whatsappContact: { type: String, trim: true },
    designation: { type: String, trim: true, default: "" },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    bio: { type: String, default: "" },
    profilePic: { type: fileAttachmentSchema, default: null },
    avatarUrl: { type: String, default: "" },

    // Social Links
    linkedinProfile: { type: String, default: "", trim: true },
    githubProfile: { type: String, default: "", trim: true },
    twitterProfile: { type: String, default: "", trim: true },
    instagramProfile: { type: String, default: "", trim: true },

    // Portfolio & Academics
    skills: { type: [String], default: [] },
    projects: [projectSchema],
    internships: { type: Array, default: [] },
    achievements: { type: Array, default: [] },
    certifications: { type: [fileAttachmentSchema], default: [] },
    fines: [fineSchema],
    semesterSGPA: [semesterSGPASchema],
    semesterSupplementary: [semesterSupplementarySchema],

    // Community Events
    event_participation: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    eventContributionType: [
      {
        type: String,
        enum: [
          "Organizer",
          "Co-Organizer",
          "Infrastructure",
          "Marketing",
          "Graphic Designing",
          "Volunteer",
          "Participant",
          "Technical Team",
          "Printing & Stationery",
          "Others",
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "users",
  }
);

// Indexes
userSchema.index(
  { admno: 1 },
  {
    unique: true,
    partialFilterExpression: { admno: { $type: "string" } },
  }
);
userSchema.index({ role: 1 });
userSchema.index({ batch: 1 });
userSchema.index({ graduationYear: 1 });

// Pre-init hook: Normalize raw MongoDB document fields before Mongoose casts/validates them
userSchema.pre("init", function (raw) {
  if (raw) {
    // 1. Normalize legacy name field -> fullName
    if (raw.name && !raw.fullName) {
      raw.fullName = raw.name;
    }

    // 2. Normalize profilePic
    // Case A: profilePic is stored as a direct string URL (e.g. Google avatar, Cloudinary, Drive link)
    if (typeof raw.profilePic === "string" && raw.profilePic.trim()) {
      const url = raw.profilePic.trim();
      raw.avatarUrl = raw.avatarUrl || url;
      raw.profilePic = {
        fileId: url,
        fileUrl: url,
        url: url,
        fileName: "profile_pic",
      };
    }
    // Case B: profilePic is stored as legacy ObjectId reference to File document
    else if (
      raw.profilePic &&
      typeof raw.profilePic === "object" &&
      !(raw.profilePic.fileUrl || raw.profilePic.url || raw.profilePic.fileId)
    ) {
      const fileIdStr = raw.profilePic._id
        ? raw.profilePic._id.toString()
        : raw.profilePic.toString();
      raw.profilePic = {
        fileId: fileIdStr,
        fileUrl: "",
        url: "",
        fileName: "profile_pic",
      };
    }
    // Case C: avatarUrl exists but profilePic is null/empty
    else if (
      (!raw.profilePic || !raw.profilePic.fileUrl) &&
      raw.avatarUrl &&
      typeof raw.avatarUrl === "string"
    ) {
      const url = raw.avatarUrl.trim();
      raw.profilePic = {
        fileId: url,
        fileUrl: url,
        url: url,
        fileName: "avatar",
      };
    }

    // 3. Ensure profilePic has both `url` and `fileUrl` populated if one exists
    if (raw.profilePic && typeof raw.profilePic === "object") {
      if (raw.profilePic.fileUrl && !raw.profilePic.url) {
        raw.profilePic.url = raw.profilePic.fileUrl;
      } else if (raw.profilePic.url && !raw.profilePic.fileUrl) {
        raw.profilePic.fileUrl = raw.profilePic.url;
      }
      if (!raw.avatarUrl && (raw.profilePic.fileUrl || raw.profilePic.url)) {
        raw.avatarUrl = raw.profilePic.fileUrl || raw.profilePic.url;
      }
    }
  }
  return raw;
});

// Pre-save hook: Hash passwords safely and calculate academic years
userSchema.pre("save", async function (next) {
  if (!this.admissionYear) {
    const calculatedAdmYear = getMemberAdmissionYear(this);
    if (calculatedAdmYear) this.admissionYear = calculatedAdmYear;
  }
  if (!this.graduationYear) {
    const calculatedGradYear = getMemberGraduationYear(this);
    if (calculatedGradYear) this.graduationYear = calculatedGradYear;
  }
  if (this.role) this.role = this.role.toLowerCase();
  if (!this.isModified("password") || !this.password) return next();
  if (/^\$2[ab]\$\d+\$/.test(this.password)) return next(); // Skip if already hashed
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Status Virtuals: calculate active/inactive dynamically based on graduation year and July cutoff
userSchema.virtual("status").get(function () {
  return calculateMemberStatus(this);
});

// Backward-compatible virtual for any client or component referencing profileStatus
userSchema.virtual("profileStatus").get(function () {
  return calculateMemberStatus(this);
});

// Academic Virtuals
userSchema.virtual("cgpa").get(function () {
  if (!this.semesterSGPA || this.semesterSGPA.length === 0) return "0.00";
  const total = this.semesterSGPA.reduce((sum, s) => sum + (s.sgpa || 0), 0);
  return (total / this.semesterSGPA.length).toFixed(2);
});

userSchema.virtual("totalSupplementary").get(function () {
  if (!this.semesterSupplementary) return 0;
  return this.semesterSupplementary.reduce((tot, sem) => tot + (sem.subjects ? sem.subjects.length : 0), 0);
});

userSchema.virtual("pendingSupplementary").get(function () {
  if (!this.semesterSupplementary) return 0;
  return this.semesterSupplementary.reduce(
    (tot, sem) => tot + (sem.subjects ? sem.subjects.filter((s) => s.status === "pending").length : 0),
    0
  );
});

userSchema.virtual("totalPendingFines").get(function () {
  if (!this.fines || this.fines.length === 0) return 0;
  return this.fines
    .filter((f) => f.status === "pending")
    .reduce((sum, f) => sum + (f.amount || 0), 0);
});

// Backward-Compatibility Aliases
userSchema.virtual("name").get(function () { return this.fullName; }).set(function (val) { this.fullName = val; });
userSchema.virtual("admnNo").get(function () { return this.admno; }).set(function (val) { this.admno = val; });
userSchema.virtual("adminContact").get(function () { return this.contact; }).set(function (val) { this.contact = val; });
userSchema.virtual("coordinatorContact").get(function () { return this.contact; }).set(function (val) { this.contact = val; });
userSchema.virtual("adminDesignation").get(function () { return this.designation; }).set(function (val) { this.designation = val; });
userSchema.virtual("coordinatorDesignation").get(function () { return this.designation; }).set(function (val) { this.designation = val; });
userSchema.virtual("memberName").get(function () { return this.fullName; });
userSchema.virtual("memberEmail").get(function () { return this.email; });
userSchema.virtual("memberImage").get(function () { return this.profilePic; });

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Optimized compound indexes for pagination and filtering
userSchema.index({ batch: 1, role: 1 });
userSchema.index({ isSuspended: 1, isVerified: 1, status: 1 });
userSchema.index({ "fines.status": 1 });
userSchema.index({ role: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

/**
 * @module User
 */
export default User;
