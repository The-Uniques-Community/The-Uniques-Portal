/**
 * @file memberController.js
 * @description Controller managing member authentication, session cookies, profile management, and portfolio sections (achievements, certifications, projects, internships, events, academics).
 * @architecture Mounted at `/api/member`. Interacts with `Member` model and `members.js` seed utilities.
 * @agent_note Authentication sets an HTTP-only JWT cookie named 'token'. Portfolio update endpoints mutate specific subdocument arrays on the Member document.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { bulkUploadMembers } from "./members.js";
import Member from "../../models/member/memberModel.js";
import { deleteFile } from "../googleDriveService.js";
dotenv.config();

/**
 * @desc Bulk upload dummy/seed member records into the database
 * @route POST /api/member/bulk-upload
 * @access Public/Dev
 * @returns {Object} 200 - Upload count and success status
 * @returns {Object} 500 - Server or upload error
 */
export const uploadDummyMembers = async (req, res) => {
    try {
      const result = await bulkUploadMembers(Member);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: `Successfully uploaded ${result.count} members`,
          count: result.count
        });
        
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload members',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in dummy member upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during member upload',
        error: error.message
      });
    }
  };

/**
 * @desc Register a new member account with email and password
 * @route POST /api/member/register
 * @access Public
 * @body {string} email - Member email address
 * @body {string} password - Raw password
 * @returns {Object} 201 - Success message and sets HTTP-only auth token cookie
 * @returns {Object} 400 - If member already exists
 * @returns {Object} 500 - Server error
 */
export const register = async (req, res) => {
    try {
        const {  email, password} = req.body;
    
        const member = await Member.findOne({ email });
        if (member) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newMember = new Member({
            // name,
            email,
            password: hashedPassword,
            // city,
            // state,
            // course,
            // batch,
            // admnNo,
            // address,
            // contact,
            // whatsappContact,
        });
        console.log(newMember);
        await newMember.save();
        console.log(newMember)
        // await sendPendingApprovalEmail(email, name);
        const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "the_uniques_portal_jwt_secret_dev_key" : undefined);
        const jwtToken = jwt.sign(
            { id: newMember._id, role: "member" }, 
            jwtSecret,
            { expiresIn: "1h" }
          );
          console.log(jwtToken);
          // Set token as HTTP-only cookie
          res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: true, // Set to true in production
            sameSite: 'None', // Important for cross-origin
            maxAge: 3600000, // 1 hour
          });
          
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }

}

/**
 * @desc Authenticate member with email and password
 * @route POST /api/member/login
 * @access Public
 * @body {string} email - Member email
 * @body {string} password - Member password
 * @returns {Object} 200 - Success message and sets HTTP-only auth token cookie
 * @returns {Object} 400 - Invalid credentials or unapproved/blocked account
 * @returns {Object} 500 - Server error
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (member.isSuspended) {
            return res.status(400).json({ message: "Your profile is blocked/suspended" });
        }

        if (!member.isVerified) {
            return res.status(400).json({ message: "Your profile is pending approval" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, member.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "the_uniques_portal_jwt_secret_dev_key" : undefined);
        const jwtToken = jwt.sign(
            { id: member._id, role: "member" }, 
            jwtSecret,
            { expiresIn: "1h" }
          );
      
          // Set token as HTTP-only cookie
          res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: true, // Set to true in production
            sameSite: 'None', // Important for cross-origin
            maxAge: 3600000, // 1 hour
          });
        res.status(200).json({ message: "User logged in successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

/**
 * @desc Clear authentication cookie and log out member
 * @route POST /api/member/logout
 * @access Public
 * @returns {Object} 200 - Logout confirmation message
 */
export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}

/**
 * @desc Update general profile information for a member
 * @route PUT /api/member/members/:id/editProfile
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {string} [fullName] - Member's full name
 * @body {string} [email] - Contact email
 * @body {string} [password] - New raw password to hash
 * @body {string} [city] - Residential city
 * @body {string} [state] - Residential state
 * @body {string} [course] - Academic course
 * @body {string} [batch] - Batch name
 * @body {string} [admnNo] - University admission number
 * @body {string} [address] - Home address
 * @body {string} [contact] - Phone number
 * @body {string} [githubProfile] - GitHub profile URL
 * @body {string} [linkedinProfile] - LinkedIn profile URL
 * @body {string} [bio] - Member biography
 * @body {string} [instagramProfile] - Instagram profile URL
 * @body {string[]} [skills] - Array of technical skills
 * @body {string[]} [certifications] - Array of certification names/IDs
 * @returns {Object} 200 - JSON response with updated member object
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
export const editProfile = async (req, res) => {
    console.log("Request Body:", req.body);
    try {
      const { id } = req.params;
      const {
        fullName,
        email,
        password,
        city,
        state,
        course,
        batch,
        admnNo,
        address,
        contact,
        githubProfile,
        linkedinProfile,
        bio,
        instagramProfile,
        skills,
        certifications,
      } = req.body;
  
      const member = await Member.findById(id);
  
      if (!member) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Hash the password only if it's provided
      if (password) {
        member.password = await bcrypt.hash(password, 12);
      }
  
      // Update fields directly
      member.fullName = fullName || member.fullName;
      member.email = email || member.email;
      member.city = city || member.city;
      member.state = state || member.state;
      member.course = course || member.course;
      member.batch = batch || member.batch;
      member.admnNo = admnNo || member.admnNo;
      member.address = address || member.address;
      member.contact = contact || member.contact;
      member.githubProfile = githubProfile || member.githubProfile;
      member.linkedinProfile = linkedinProfile || member.linkedinProfile;
      if (bio !== undefined) {
        member.bio = bio;
      }
      member.instagramProfile = instagramProfile || member.instagramProfile;
  
      // Update skills and certifications
      if (Array.isArray(skills)) {
        member.skills = skills;
      }
      if (Array.isArray(certifications)) {
        member.certifications = certifications;
      }
  
      await member.save();
  
      res.status(200).json({ message: "Profile updated successfully", member });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error });
    }
  };

/**
 * @desc Get authenticated member profile details
 * @route GET /api/member/getProfile
 * @access Private (Member)
 * @returns {Object} 200 - JSON response with member profile excluding password
 * @returns {Object} 400 - If member does not exist
 * @returns {Object} 500 - Server error
 */
export const getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const member = await Member.findById(id)
            .select("-password");
        if (!member) {
            return res.status(400).json({ message: "User does not exist" });
        }
        res.status(200).json({ member });
    }
    catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

/**
 * @desc Update member achievements portfolio list
 * @route PUT /api/member/members/:id/achievements
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} achievements - Updated achievements list
 * @returns {Object} 200 - JSON response with updated achievements
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for achievements
export const updateAchievements = async (req, res) => {
    try {
      const { id } = req.params;
      const { achievements } = req.body;
  
      const member = await Member.findByIdAndUpdate(
        id,
        { achievements },
        { new: true }
      );
  
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      res.status(200).json({ message: "Achievements updated successfully", achievements: member.achievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to update achievements", error: error.message });
    }
  };
  
/**
 * @desc Update member certifications portfolio list
 * @route PUT /api/member/members/:id/certifications
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} certifications - Updated certifications list
 * @returns {Object} 200 - JSON response with updated certifications
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for certifications
export const updateCertifications = async (req, res) => {
    try {
      const { id } = req.params;
      const { certifications } = req.body;
  
      const member = await Member.findByIdAndUpdate(
        id,
        { certifications },
        { new: true }
      );
  
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      res.status(200).json({ message: "Certifications updated successfully", certifications: member.certifications });
    } catch (error) {
      res.status(500).json({ message: "Failed to update certifications", error: error.message });
    }
  };

/**
 * @desc Update member projects portfolio list
 * @route PUT /api/member/members/:id/projects
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} projects - Updated project list with normalized image URLs
 * @returns {Object} 200 - JSON response with updated projects
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for projects
export const updateProjects = async (req, res) => {
  try {
    const { id } = req.params;
    let { projects } = req.body;
    
    // Clean up projects data to handle empty imageUrl fields
    if (Array.isArray(projects)) {
      projects = projects.map(project => ({
        ...project,
        // Convert empty strings to null for imageUrl
        imageUrl: project.imageUrl === "" ? null : project.imageUrl
      }));
    }

    const member = await Member.findByIdAndUpdate(
      id,
      { projects },
      { 
        new: true,
        runValidators: false // Skip validation for this update
      }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Projects updated successfully", projects: member.projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to update projects", error: error.message });
  }
};

/**
 * @desc Update member internships portfolio list
 * @route PUT /api/member/members/:id/internships
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} internships - Updated internship history list
 * @returns {Object} 200 - JSON response with updated internships
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for internships
export const updateInternships = async (req, res) => {
    try {
      const { id } = req.params;
      const { internships } = req.body;
  
      const member = await Member.findByIdAndUpdate(
        id,
        { internships },
        { new: true }
      );
  
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      res.status(200).json({ message: "Internships updated successfully", internships: member.internships });
    } catch (error) {
      res.status(500).json({ message: "Failed to update internships", error: error.message });
    }
  };

/**
 * @desc Update member event participation records
 * @route PUT /api/member/members/:id/events
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} event_participation - Updated event participation list
 * @returns {Object} 200 - JSON response with updated event participation
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for events
export const updateEvents = async (req, res) => {
    try {
      const { id } = req.params;
      const { event_participation } = req.body;
  
      const member = await Member.findByIdAndUpdate(
        id,
        { event_participation },
        { new: true }
      );
  
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      res.status(200).json({ message: "Events updated successfully", events: member.event_participation });
    } catch (error) {
      res.status(500).json({ message: "Failed to update events", error: error.message });
    }
  };

/**
 * @desc Update member academic semester SGPA data
 * @route PUT /api/member/members/:id/academics
 * @access Private (Member)
 * @params {string} id - Member document ID
 * @body {Object[]} semesterSGPA - Updated semester SGPA records
 * @returns {Object} 200 - JSON response with updated academic records
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
// CRUD operations for academics
export const updateAcademics = async (req, res) => {
    try {
      const { id } = req.params;
      const { semesterSGPA } = req.body;
  
      const member = await Member.findByIdAndUpdate(
        id,
        { semesterSGPA },
        { new: true }
      );
  
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      res.status(200).json({ message: "Academic data updated successfully", academics: member.semesterSGPA });
    } catch (error) {
      res.status(500).json({ message: "Failed to update academic data", error: error.message });
    }
  };

/**
 * @desc Remove profile picture for a member
 * @route DELETE /api/member/members/:id/profilePic
 * @access Private (Member, Admin)
 * @params {string} id - Member document ID
 * @returns {Object} 200 - Success message and updated member object
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
export const deleteProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (member.profilePic && member.profilePic.fileId) {
      try {
        await deleteFile(member.profilePic.fileId);
      } catch (fileErr) {
        console.error("Error deleting profile pic file from Drive:", fileErr);
      }
    }

    member.profilePic = null;
    member.avatarUrl = "";
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      member,
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove profile picture",
      error: error.message,
    });
  }
};


