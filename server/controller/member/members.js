import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const createObjectId = () => new mongoose.Types.ObjectId();

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Sample event IDs for participation
const eventIds = {
  eventOne: createObjectId(),
  eventTwo: createObjectId(),
  eventThree: createObjectId(),
  eventFour: createObjectId(),
};

export const getMemberData = async () => {
    // Hash passwords
    const defaultPassword = await hashPassword('password123');
    
    return [
      {
        fullName: "Rahul Sharma",
        googleId: "",
        admno: "2020BTCS001",
        email: "rahul.sharma@example.com",
        password: defaultPassword,
        role: "member",
        batch: "The Uniques 1.0",
        contact: "9876543210",
        whatsappContact: "9876543210",
        address: "123 College Road",
        city: "Chandigarh",
        state: "Punjab",
        isPlaced: true,
        isVerified: true,
        isSuspended: false,
        profileStatus: "active",
        fineStatus: "0",
        // New fine model data
        fines: [],
        semesterSGPA: [
          { semester: 1, sgpa: 8.6 },
          { semester: 2, sgpa: 8.9 },
          { semester: 3, sgpa: 9.2 },
          { semester: 4, sgpa: 9.0 },
          { semester: 5, sgpa: 8.8 },
          { semester: 6, sgpa: 9.5 },
          { semester: 7, sgpa: 9.6 },
          { semester: 8, sgpa: 9.3 }
        ],
        semesterSupplementary: [], // No supplementary exams
        certifications: [],
        profilePic: null,
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "AWS"],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Built a full-stack e-commerce platform using MERN stack",
            link: "https://github.com/rahulsharma/ecommerce"
          },
          {
            name: "Student Management System",
            description: "Developed a student management system for college administration",
            link: "https://github.com/rahulsharma/sms"
          }
        ],
        internships: [
          {
            company: "Amazon",
            role: "Software Development Intern",
            duration: "3 months",
            year: 2023
          }
        ],
        achievements: ["First prize in College Hackathon 2022", "Dean's List for 3 consecutive semesters"],
        linkedinProfile: "https://linkedin.com/in/rahulsharma",
        githubProfile: "https://github.com/rahulsharma",
        bio: "Full-stack developer passionate about building scalable web applications.",
        event_participation: [eventIds.eventOne, eventIds.eventTwo],
        eventContributionType: ["Organizer", "Technical Team"],
        course: "B.Tech CSE"
      },
      {
        fullName: "Priya Patel",
        googleId: "",
        admno: "2021BTCS045",
        email: "priya.patel@example.com",
        password: defaultPassword,
        role: "member",
        batch: "The Uniques 2.0",
        contact: "8765432109",
        whatsappContact: "8765432109",
        address: "456 University Avenue",
        city: "Mohali",
        state: "Punjab",
        isPlaced: false,
        isVerified: true,
        isSuspended: false,
        profileStatus: "active",
        fineStatus: "0",
        // New fine model data
        fines: [
          {
            amount: 200,
            reason: "Late submission of assignment",
            dateImposed: new Date("2023-12-10"),
            status: "paid",
            datePaid: new Date("2023-12-15"),
            proofOfPayment: null
          }
        ],
        semesterSGPA: [
          { semester: 1, sgpa: 7.8 },
          { semester: 2, sgpa: 7.5 },
          { semester: 3, sgpa: 8.0 },
          { semester: 4, sgpa: 7.9 },
          { semester: 5, sgpa: 8.2 },
          { semester: 6, sgpa: 8.4 }
        ],
        semesterSupplementary: [
          {
            semester: 2,
            subjects: [
              {
                subjectCode: "CS202",
                subjectName: "Data Structures",
                status: "passed",
              }
            ]
          },
          {
            semester: 4,
            subjects: [
              {
                subjectCode: "CS404",
                subjectName: "Computer Networks",
                status: "pending",
              }
            ]
          }
        ],
        certifications: [],
        profilePic: null,
        skills: ["Python", "Java", "C++", "Machine Learning", "Data Analysis"],
        projects: [
          {
            name: "Sentiment Analysis Tool",
            description: "Built a sentiment analysis tool using Python and NLTK",
            link: "https://github.com/priyapatel/sentiment-analysis"
          }
        ],
        internships: [
          {
            company: "Infosys",
            role: "Software Intern",
            duration: "2 months",
            year: 2023
          }
        ],
        achievements: ["Best Paper Award in College Technical Symposium"],
        linkedinProfile: "https://linkedin.com/in/priyapatel",
        githubProfile: "https://github.com/priyapatel",
        bio: "Computer science student interested in AI and machine learning.",
        event_participation: [eventIds.eventTwo],
        eventContributionType: ["Participant"],
        course: "B.Tech CSE"
      },
      {
        fullName: "Arjun Singh",
        googleId: "",
        admno: "2023BTCSD102",
        email: "arjun.singh@example.com",
        password: defaultPassword,
        role: "member",
        batch: "The Uniques 3.0",
        contact: "7654321098",
        whatsappContact: "7654321098",
        address: "789 Tech Park",
        city: "Panchkula",
        state: "Haryana",
        isPlaced: false,
        isVerified: true,
        isSuspended: false,
        profileStatus: "active",
        fineStatus: "0",
        // New fine model data
        fines: [
          {
            amount: 150,
            reason: "Missing community meeting",
            dateImposed: new Date("2024-01-20"),
            status: "pending"
          }
        ],
        semesterSGPA: [
          { semester: 1, sgpa: 8.3 }
        ],
        semesterSupplementary: [],
        certifications: [],
        profilePic: null,
        skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
        projects: [
          {
            name: "Personal Portfolio",
            description: "Created a responsive personal portfolio website",
            link: "https://github.com/arjunsingh/portfolio"
          }
        ],
        internships: [],
        achievements: ["Participated in Google Code Jam 2023"],
        linkedinProfile: "https://linkedin.com/in/arjunsingh",
        githubProfile: "https://github.com/arjunsingh",
        bio: "Freshman student exploring web development and cybersecurity.",
        event_participation: [eventIds.eventThree],
        eventContributionType: ["Volunteer"],
        course: "CSD"
      },
      {
        fullName: "Neha Gupta",
        googleId: "",
        admno: "2022BTCS078",
        email: "neha.gupta@example.com",
        password: defaultPassword,
        role: "member",
        batch: "The Uniques 2.0",
        contact: "6543210987",
        whatsappContact: "6543210987",
        address: "321 Engineering Block",
        city: "Chandigarh",
        state: "Punjab",
        isPlaced: false,
        isVerified: true,
        isSuspended: true, // Suspended account
        profileStatus: "blocked",
        fineStatus: "500", // Has outstanding fine
        // New fine model data
        fines: [
          {
            amount: 300,
            reason: "Late return of community equipment",
            dateImposed: new Date("2023-10-05"),
            status: "pending"
          },
          {
            amount: 200,
            reason: "Unauthorized absence from mandatory event",
            dateImposed: new Date("2023-11-15"),
            status: "pending"
          }
        ],
        semesterSGPA: [
          { semester: 1, sgpa: 6.2 },
          { semester: 2, sgpa: 5.8 },
          { semester: 3, sgpa: 6.5 },
          { semester: 4, sgpa: 5.9 }
        ],
        semesterSupplementary: [
          {
            semester: 1,
            subjects: [
              {
                subjectCode: "CS101",
                subjectName: "Introduction to Programming",
                status: "passed",
              },
              {
                subjectCode: "MTH101",
                subjectName: "Engineering Mathematics I",
                status: "passed",
              }
            ]
          },
          {
            semester: 2,
            subjects: [
              {
                subjectCode: "CS201",
                subjectName: "Object-Oriented Programming",
                status: "failed",
              },
              {
                subjectCode: "ECE201", 
                subjectName: "Digital Electronics",
                status: "pending",
              }
            ]
          },
          {
            semester: 3,
            subjects: [
              {
                subjectCode: "CS301",
                subjectName: "Database Management Systems",
                status: "pending",
              }
            ]
          }
        ],
        certifications: [],
        profilePic: null,
        skills: ["C", "Java", "SQL"],
        projects: [],
        internships: [],
        achievements: [],
        linkedinProfile: "",
        githubProfile: "",
        bio: "Computer science student working to improve my skills.",
        event_participation: [],
        eventContributionType: [],
        course: "B.Tech CSE"
      }
    ];
  };
  
  // Bulk upload controller for members
  export const bulkUploadMembers = async (Member) => {
    try {
      // Get member data with hashed passwords
      const members = await getMemberData();
      
      // Delete all existing members except admin accounts
    //   await Member.deleteMany({ role: { $ne: "admin" } });
    //   console.log('Cleared existing member data (except admins)');
      
      // Insert all members
      const result = await Member.insertMany(members);
      
      console.log(`Successfully uploaded ${result.length} members to database`);
      return { success: true, count: result.length };
    } catch (error) {
      console.error('Error in bulk upload of members:', error);
      return { success: false, error: error.message };
    }
  };

  // New function to update fine data for existing members
  export const updateMemberFines = async (Member) => {
    try {
      const members = await getMemberData();
      
      // For each sample member, update their fine data
      for (const memberData of members) {
        const result = await Member.findOneAndUpdate(
          { admno: memberData.admno },
          { 
            $set: { 
              fines: memberData.fines,
              // Calculate fineStatus based on pending fines
              fineStatus: calculateFineStatus(memberData.fines)
            }
          },
          { new: true }
        );
        
        if (result) {
          console.log(`Updated fine data for member ${memberData.fullName}`);
        } else {
          console.log(`Member ${memberData.fullName} not found`);
        }
      }
      
      return { success: true, message: "Fine data updated successfully" };
    } catch (error) {
      console.error('Error updating member fines:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to calculate fineStatus from fines array
  const calculateFineStatus = (fines) => {
    // Sum up pending fines
    const pendingAmount = fines
      .filter(fine => fine.status === 'pending')
      .reduce((sum, fine) => sum + fine.amount, 0);
      
    return pendingAmount.toString(); // Convert to string to match existing format
  };