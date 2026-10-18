/**
 * @file formModel.js
 * @description Mongoose schema and model for dynamic custom form templates and surveys.
 * @architecture Defines reusable form builders, field-level validation schemas, and relationships to creators and submitted responses.
 * @agent_note Embeds formFieldSchema subdocuments; createdBy references Member; responses references FormResponse documents.
 */

import mongoose from 'mongoose';

/**
 * Embedded Mongoose schema definition for individual form input fields.
 */
const formFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'email', 'select', 'checkbox', 'radio', 'date', 'textarea', 'file']
  },
  fieldLabel: {
    type: String,
    required: true
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false
  },
  options: [String], // For select, checkbox, radio
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    errorMessage: String
  }
});

/**
 * Mongoose schema definition for dynamic form templates.
 */
const formSchema = new mongoose.Schema({
  formTitle: {
    type: String,
    required: true
  },
  formDescription: String,
  fields: [formFieldSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  responses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormResponse'
  }]
});

const Form = mongoose.models.Form || mongoose.model('Form', formSchema);

/**
 * @module Form
 */
export default Form;