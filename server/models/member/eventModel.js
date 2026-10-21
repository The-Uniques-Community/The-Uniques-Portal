/**
 * @file eventModel.js
 * @description Mongoose schema and model for community events, budgets, expenses, sponsorships, and guest management.
 * @architecture Comprehensive event operations model linking members, external guests, uploaded banners/receipts, and audit logs.
 * @agent_note Pre-save hook computes budget remaining balance; validates receiptId when sponsorships/expenses are finalized; references File, Member, and Guest models.
 */

import mongoose from "mongoose";
import fileAttachmentSchema from "../common/fileAttachmentSchema.js";

/**
 * Mongoose schema definition for community events, financial tracking, and team contributions.
 */
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  eventBanner: {
    type: fileAttachmentSchema,
    default: null,
    set: function (v) {
      if (!v) return null;
      if (typeof v === "string") {
        if (!v.trim()) return null;
        return {
          fileId: v.trim(),
          fileUrl: v.trim().startsWith("http") ? v.trim() : "",
          url: v.trim().startsWith("http") ? v.trim() : "",
          fileName: "",
        };
      }
      return v;
    },
  },
  eventDate: {
    type: Date,
  },
  eventTime: {
    type: String,
  },
  eventVenue: {
    type: String,
  },
  eventOrganizerBatch: {
    type: String,
    enum: [
      "The Uniques 1.0",
      "The Uniques 2.0",
      "The Uniques 3.0",
      "The Uniques 4.0",
      "The Uniques 5.0",
      "The Uniques 6.0",
    ],
  },
  // newly added fields
  eventMembers: [
    {
      contributionType: {
        type: String,
        required: true,
        enum: [
          "technical team",
          "branding team",
          "infra team", 
          "sponsors team", 
          "hospitality", 
          "guest-management"
        ]
      },
      contributionTeam: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    }
  ],
  eventGuests: [
    {
      guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
        set: function (v) {
          if (!v) return undefined;
          if (typeof v === "string" && !v.trim()) return undefined;
          if (typeof v === "object" && v?._id) return v._id;
          return v;
        },
      },
      guestTag: {
        type: String,
        enum: [
          "speaker",
          "moderator",
          "panelist",
          "judge",
          "mentor",
          "organizer",
          "sponsor",
          "partner",
          "chief guest",
          "others",
        ],
        default: "others",
      },
    },
  ],
  eventGallery: {
    type: [fileAttachmentSchema],
    default: [],
    set: function (v) {
      if (!v) return [];
      if (Array.isArray(v)) {
        return v
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") {
              if (!item.trim()) return null;
              return {
                fileId: item.trim(),
                fileUrl: item.trim().startsWith("http") ? item.trim() : "",
                url: item.trim().startsWith("http") ? item.trim() : "",
                fileName: "",
              };
            }
            return item;
          })
          .filter(Boolean);
      }
      return v;
    },
  },

  attendees: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
        default: "",
      },
      registeredAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  eventType: {
    type: String,
    required: true,
    multiple: true,
    enum: [
      "Workshop",
      "Seminar",
      "Webinar",
      "Hackathon",
      "Competition",
      "Conference",
      "Fest",
      "Cultural",
      "Ideathon",
      "Sports",
      "Talk Show",
      "Meetup",
      "Others",
    ],
  },
  eventStatus: {
    type: String,
    default: "upcoming",
    enum: ["upcoming", "ongoing", "completed"],
  },
  eventForm: {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
    },
    formFeilds: {
      type: Array,
      default: [],
    },
  },

  budget: {
    totalAllocated: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    // Removing approval workflow, simplifying status
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    lastUpdatedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  },

  // Funding sources
  sponsors: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      type: {
        type: String,
        enum: ["cash", "in-kind", "services"],
        default: "cash",
      },
      receiptId: {
        type: fileAttachmentSchema,
        default: null,
        set: function (v) {
          if (!v) return null;
          if (typeof v === "string") {
            if (!v.trim()) return null;
            return {
              fileId: v.trim(),
              fileUrl: v.trim().startsWith("http") ? v.trim() : "",
              url: v.trim().startsWith("http") ? v.trim() : "",
              fileName: "",
            };
          }
          return v;
        },
      },
      receivedStatus: {
        type: String,
        enum: ["pending", "received"],
        default: "pending",
        validate: {
          validator: function (value) {
            // Only validate when status is "received"
            if (value === "received") {
              return !!(this.receiptId && (this.receiptId.fileId || this.receiptId.fileUrl));
            } 
            return true;
          },
          message: "Receipt upload required to mark sponsorship as received",
        },
      },
      contactPerson: String,
      logoUrl: String,
      contactEmail: String,
      contactPhone: String,
      notes: String,
      dateReceived: Date,
    },
  ],

  // Expense tracking
  expenses: [
    {
      category: {
        type: String,
      },
      title: { type: String },
      amount: { type: Number },
      vendor: String,
      paymentMethod: {
        type: String,
        enum: ["cash", "bank", "card", "upi", "other"],
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
        validate: {
          validator: function (value) {
            // Only validate when status is "completed"
            if (value === "completed") {
              return !!(this.receiptId && (this.receiptId.fileId || this.receiptId.fileUrl));
            }
            return true;
          },
          message: "Receipt upload required to mark payment as completed",
        },
      },
      receiptId: {
        type: fileAttachmentSchema,
        default: null,
        set: function (v) {
          if (!v) return null;
          if (typeof v === "string") {
            if (!v.trim()) return null;
            return {
              fileId: v.trim(),
              fileUrl: v.trim().startsWith("http") ? v.trim() : "",
              url: v.trim().startsWith("http") ? v.trim() : "",
              fileName: "",
            };
          }
          return v;
        },
      },
      paidBy: { type: String },
      paidOn: Date,
      notes: String,
      // Remove approval-related fields
      createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
      createdAt: { type: Date, default: Date.now },
      updatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
      updatedAt: Date,
    },
  ],

  // Budget allocations
  budgetAllocations: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      notes: String,
      createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
      createdAt: { type: Date, default: Date.now },
      updatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
      updatedAt: Date,
    },
  ],

  // Budget history (simplified but kept for auditing)
  budgetHistory: [
    {
      action: {
        type: String,
        required: true,
        enum: [
          "created",
          "updated",
          "allocated",
          "expense_added",
          "expense_updated",
          "expense_deleted",
        ],
      },
      amount: { type: Number },
      category: { type: String },
      note: String,
      performedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String },
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

/**
 * Pre-validate middleware to sanitize eventGuests, removing empty or invalid guest references.
 */
eventSchema.pre("validate", function (next) {
  if (Array.isArray(this.eventGuests)) {
    this.eventGuests = this.eventGuests.filter(
      (g) => g && g.guestId && mongoose.Types.ObjectId.isValid(g.guestId)
    );
  }
  next();
});

/**
 * Pre-save middleware to calculate the remaining event budget.
 */
eventSchema.pre("save", function (next) {
  if (this.budget) {
    // Calculate remaining budget
    this.budget.remaining = this.budget.totalAllocated - this.budget.totalSpent;
  }
  next();
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

/**
 * @module Event
 */
export default Event;
