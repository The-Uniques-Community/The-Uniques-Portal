import mongoose from 'mongoose';

const campusAmbassadorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  college: {
    type: String,
    required: [true, 'College/University name is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course/Degree information is required'],
    trim: true
  },
  graduationYear: {
    type: String,
    required: [true, 'Graduation year is required'],
    match: [/^\d{4}$/, 'Graduation year must be a 4-digit year']
  },
  linkedinProfile: {
    type: String,
    trim: true
  },
  whyJoin: {
    type: String,
    required: [true, 'Please provide your motivation for joining'],
    minlength: [50, 'Please provide at least 50 characters explaining why you want to join']
  },
  heardFrom: {
    type: String,
    required: [true, 'Please specify how you heard about us'],
    enum: ['social_media', 'friend', 'college', 'event', 'search', 'other']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  statusUpdateReason: {
    type: String,
    trim: true
  },
  assignedRegion: {
    type: String,
    trim: true
  },
  // Performance metrics
  eventsOrganized: {
    type: Number,
    default: 0
  },
  studentsReferred: {
    type: Number,
    default: 0
  },
  performanceScore: {
    type: Number,
    default: 0
  },
  // Program period
  batchYear: {
    type: String
  },
  programStart: {
    type: Date
  },
  programEnd: {
    type: Date
  },
  // Additional administrative fields
  adminNotes: {
    type: String
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Index for faster queries
campusAmbassadorSchema.index({ email: 1 });
campusAmbassadorSchema.index({ status: 1 });
campusAmbassadorSchema.index({ college: 1 });

const CampusAmbassador = mongoose.model('CampusAmbassador', campusAmbassadorSchema);

export default CampusAmbassador;