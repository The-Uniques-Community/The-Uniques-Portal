import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { bulkUploadMembers } from "./members.js";
import Member from "../../models/member/memberModel.js";
dotenv.config();

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
            profileStatus:"active"
        });
        console.log(newMember);
        await newMember.save();
        console.log(newMember)
        // await sendPendingApprovalEmail(email, name);
        const jwtToken = jwt.sign(
            { id: newMember._id, role: "member" }, 
            process.env.JWT_SECRET,
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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if(member.profileStatus === "pending" && member.isVerified === false){
            return res.status(400).json({ message: "Your profile is pending approval" });
        }

        if(member.profileStatus === "blocked" && member.isVerified === false){
            return res.status(400).json({ message: "Your profile is blocked" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, member.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const jwtToken = jwt.sign(
            { id: member._id, role: "member" }, 
            process.env.JWT_SECRET,
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


export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}

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
      member.bio = bio || member.bio;
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

export const getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const member = await Member.findById(id)
            .select("-password")
            .populate("profilePic")
            .populate("certifications")
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

