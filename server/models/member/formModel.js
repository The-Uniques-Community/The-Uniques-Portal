import mongoose from 'mongoose';

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

const formSchema = new mongoose.Schema({
  formTitle: {
    type: String,
    required: true
  },
  formDescription: String,
  fields: [formFieldSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
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

const Form = mongoose.model('Form', formSchema);
export default Form;