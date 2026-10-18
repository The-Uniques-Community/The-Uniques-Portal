/**
 * @file formResponse.js
 * @description Mongoose schema and model for dynamic custom form responses and event registrations.
 * @architecture Captures responses to custom forms defined in formModel.js, linking members/guests with dynamic answer maps and uploaded files.
 * @agent_note Responses are stored in a dynamic Map of Mixed types; indexes form, event, respondent, status, and createdAt; provides static helpers.
 */

import mongoose from 'mongoose';
import fileAttachmentSchema from '../common/fileAttachmentSchema.js';

/**
 * Mongoose schema definition for dynamic form responses.
 * Supports both authenticated member submissions and public guest responses with file attachments.
 */
const formResponseSchema = new mongoose.Schema({
  // Reference to the form being responded to
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  
  // Reference to the event (optional, if this response is for an event)
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  
  // Who submitted the response
  respondent: {
    // For authenticated users
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // For guest/public responses
    name: String,
    email: String,
    phone: String
  },
  
  // The actual form response data - stored as key-value pairs
  // where key is the field name and value is the response
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // For file uploads associated with the response
  files: [{
    fieldName: String,
    file: {
      type: fileAttachmentSchema,
      default: null
    },
    fileId: String // For backward compatibility with existing API payloads
  }],
  
  // Response status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin notes/feedback
  adminNotes: String,
  
  // Response metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for faster querying
formResponseSchema.index({ form: 1 });
formResponseSchema.index({ event: 1 });
formResponseSchema.index({ 'respondent.member': 1 });
formResponseSchema.index({ 'respondent.email': 1 });
formResponseSchema.index({ status: 1 });
formResponseSchema.index({ createdAt: -1 });

// Virtual getter to count total responses for a form
formResponseSchema.virtual('formResponseCount').get(function() {
  return mongoose.model('FormResponse').countDocuments({ form: this.form });
});

/**
 * Checks if a member has already submitted a response to a specific form.
 * @param {import('mongoose').Types.ObjectId|string} formId - Target form ID.
 * @param {import('mongoose').Types.ObjectId|string} memberId - Submitting member ID.
 * @returns {Promise<boolean>} True if the member has submitted a response.
 */
// Method to check if a user has already submitted a response
formResponseSchema.statics.hasUserResponded = async function(formId, memberId) {
  const count = await this.countDocuments({
    form: formId,
    'respondent.member': memberId
  });
  return count > 0;
};

/**
 * Retrieves paginated responses for a specific form with populated member details.
 * @param {import('mongoose').Types.ObjectId|string} formId - Target form ID.
 * @param {Object} [options={}] - Query and pagination options.
 * @param {string} [options.status] - Filter by response status ('pending'|'approved'|'rejected').
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=10] - Number of responses per page.
 * @returns {Promise<import('mongoose').Document[]>} Array of populated response documents.
 */
// Method to get all responses for a specific form
formResponseSchema.statics.getFormResponses = async function(formId, options = {}) {
  const query = { form: formId };
  
  // Apply filters if provided
  if (options.status) {
    query.status = options.status;
  }
  
  // Apply pagination
  const limit = options.limit || 10;
  const skip = options.page ? (options.page - 1) * limit : 0;
  
  return this.find(query)
    .populate('respondent.member', 'name email profilePic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const FormResponse = mongoose.models.FormResponse || mongoose.model('FormResponse', formResponseSchema);

/**
 * @module FormResponse
 */
export default FormResponse;