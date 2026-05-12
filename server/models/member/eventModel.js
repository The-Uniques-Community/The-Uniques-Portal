import mongoose from "mongoose";

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
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
          ref: "Member" // Assuming Member is the model for team members
        }
      ]
    }
  ],
  eventGuests: [
    {
      guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
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
  eventGallery: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
      receivedStatus: {
        type: String,
        enum: ["pending", "received"],
        default: "pending",
        validate: {
          validator: function (value) {
            // Only validate when status is "received"
            if (value === "received") {
              return !!this.receiptId; // Must have receiptId for received sponsorships
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
              return !!this.receiptId; // Must have receiptId to be "completed"
            }
            return true;
          },
          message: "Receipt upload required to mark payment as completed",
        },
      },
      receiptId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
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

eventSchema.pre("save", function (next) {
  if (this.budget) {
    // Calculate remaining budget
    this.budget.remaining = this.budget.totalAllocated - this.budget.totalSpent;
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
