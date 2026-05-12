import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    services: [{
      type: String,
      enum: [
        'Website design',
        'Content creation',
        'UX design',
        'Strategy & consulting',
        'User research',
        'Other'
      ]
    }],
    status: {
      type: String,
      enum: ['new', 'reviewed', 'in-progress', 'resolved', 'archived'],
      default: 'new'
    },
    notes: {
      type: String,
      trim: true
    },
    responseDetails: {
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      responseDate: Date,
      responseMessage: String
    },
    ipAddress: {
      type: String,
      trim: true
    },
    referrer: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add an index on email for faster lookups
enquirySchema.index({ email: 1 });
// Add an index on status for filtering
enquirySchema.index({ status: 1 });
// Add an index on creation date for sorting
enquirySchema.index({ createdAt: -1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;