// models/memberModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import File from "./fileModel.js";
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
     // Project title is mandatory
  },
  description: {
    type: String,
    default: "", // Optional description
  },
  technologies: {
    type: [String], // Array of strings for technologies used
    default: [], // Default to an empty array
  },
  link: {
    type: String, // Link to the project (e.g., GitHub, live demo)
    default: "",
  },
  imageUrl: {
    type: String, // URL for the project image
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});
const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    googleId:{
      type:String,
    },
    admno: {
      type: String,
      sparse: true,
      unique: true,
      match: [/^[0-9]{4}(BTCS|BTCED)[0-9]{3}$/],
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "member",
    },
    batch: {
      type: String,
      enum: ["The Uniques 1.0", "The Uniques 2.0", "The Uniques 3.0", "The Uniques 4.0"],
    },
    contact: {
      type: String,
    },
    whatsappContact: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    isPlaced: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    profileStatus: {
      type: String,
      default: "inactive",
      enum: ["inactive", "active", "pending", "blocked"],
    },
    // Replacing simple fine fields with structured array
    fines: [
      {
        amount: {
          type: Number,
          
        },
        dateImposed: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "paid", "waived"],
          default: "pending",
        },
        reason: {
          type: String,
          
        },
        proofOfPayment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "File",
        }
      }
    ],
    
    // New semesterSGPA field to track SGPA by semester
    semesterSGPA: [
      {
        semester: {
          type: Number,
          
          min: 1,
          max: 8
        },
        sgpa: {
          type: Number,
          
          min: 0,
          max: 10
        }
      }
    ],
    // New field to track supplementary exams by semester
    semesterSupplementary: [
      {
        semester: {
          type: Number,
          
          min: 1,
          max: 8
        },
        subjects: [
          {
            subjectCode: {
              type: String,
              required: true
            },
            subjectName: {
              type: String,
              required: true
            },
            status: {
              type: String,
              enum: ['pending', 'passed', 'failed'],
              default: 'pending'
            }
          }
        ]
      }
    ],
    certifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    profilePic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    skills: {
      type: Array,
      default: [],
    },
    projects:[projectSchema],
    
    internships: {
      type: Array,
      default: [],
    },
    achievements: {
      type: Array,
      default: [],
    },
    linkedinProfile: {
      type: String,
      default: "",
    },
    instagramProfile: {
      type: String,
      default: "",
    },
    twitterProfile: {
      type: String,
      default: "",
    },
    githubProfile: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    event_participation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
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
    course: {
      type: String,
      enum: ["B.Tech CSE", "CSD"],
    },
  },
  { timestamps: true }
);

// Virtual property to calculate CGPA from semester SGPAs
memberSchema.virtual('cgpa').get(function() {
  if (!this.semesterSGPA || this.semesterSGPA.length === 0) {
    return 0;
  }
  
  const totalSGPA = this.semesterSGPA.reduce((sum, semester) => sum + semester.sgpa, 0);
  return (totalSGPA / this.semesterSGPA.length).toFixed(2);
});

// Virtual to get total number of supplementary exams
memberSchema.virtual('totalSupplementary').get(function() {
  if (!this.semesterSupplementary) return 0;
  
  return this.semesterSupplementary.reduce((total, sem) => {
    return total + (sem.subjects ? sem.subjects.length : 0);
  }, 0);
});

// Virtual to get pending supplementary exams
memberSchema.virtual('pendingSupplementary').get(function() {
  if (!this.semesterSupplementary) return 0;
  
  return this.semesterSupplementary.reduce((total, sem) => {
    return total + (sem.subjects ? 
      sem.subjects.filter(subj => subj.status === 'pending').length : 0);
  }, 0);
});

// Virtual to calculate total pending fines
memberSchema.virtual('totalPendingFines').get(function() {
  if (!this.fines || this.fines.length === 0) return 0;
  
  return this.fines
    .filter(fine => fine.status === 'pending')
    .reduce((total, fine) => total + fine.amount, 0);
});

// Compare candidatePassword with the hashed password
memberSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Member = mongoose.model("Member", memberSchema);
export default Member;