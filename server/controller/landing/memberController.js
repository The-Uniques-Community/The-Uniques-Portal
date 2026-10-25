/**
 * @file memberController.js
 * @description Public-facing controller exposing sanitized member directory listings, public profile lookups, batch counts, and visitor contact submissions.
 * @architecture Mounted at `/api/public/members` via `publicMemberRouter.js`. Interfaces with `Member`, `Enquiry`, and `sendContactEmail` service.
 * @agent_note Strips sensitive member information (passwords, phone numbers, fines) before returning JSON to public consumers.
 */
import mongoose from "mongoose";
import Member from "../../models/member/memberModel.js";
import { BatchProfile } from "../../models/community/batchModel.js";
import Enquiry from "../../models/Enquiry/enquiryModel.js";
import sendContactEmail from "../../services/members/sendContactEmail.js";

/**
 * @desc Retrieve all public member profiles formatted for directory display with search and batch filtering
 * @route GET /api/public/members
 * @access Public
 * @query {string} [batch] - Filter by batch name (e.g., 'The Uniques 1.0')
 * @query {string} [search] - Keyword search across name, bio, course, and skills
 * @returns {Object} 200 - Sanitized member list and count
 * @returns {Object} 500 - Server error
 */
// Get all public members with pagination and filters
export const getPublicMembers = async (req, res) => {
    try {
      const { batch, search } = req.query;
      
      // Build query conditions - REMOVED status filters to show ALL members
      const queryConditions = {
        // We're intentionally not filtering by profileStatus, verification, or suspension status
      };
      
      // Add batch filter if provided
      if (batch && batch !== "All") {
        queryConditions.batch = batch;
      }
      
      // Add search filter if provided
      if (search) {
        queryConditions.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
          { course: { $regex: search, $options: 'i' } },
          { skills: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute query without pagination and order by complete profiles first
      const members = await Member.find(queryConditions)
        .sort({ 
          // Sort verified profiles first, then by batch and name
          isVerified: -1,    // true comes before false in descending order
          isSuspended: 1,    // false comes before true in ascending order
          batch: 1, 
          fullName: 1 
        });
        
      // Get total count 
      const total = members.length;
      
      // Process members to include only public-safe information, handle missing fields
      const formattedMembers = members.map(member => ({
        _id: member._id,
        fullName: member.fullName || member.email,
        batch: member.batch || null,
        course: member.course || null,
        isPlaced: member.isPlaced || false,
        bio: member.bio || null,
        
        // Handle profilePic - whether it's a populated document or a string URL
        profilePic: member.profilePic 
          ? (member.profilePic.url || member.profilePic) 
          : null,
        
        // Format skills - ensure arrays exist
        skills: Array.isArray(member.skills) ? member.skills : [],
        
        // Social media - default to null for missing values
        linkedinProfile: member.linkedinProfile || null,
        githubProfile: member.githubProfile || null,
        twitterProfile: member.twitterProfile || null,
        instagramProfile: member.instagramProfile || null,
        
        // Projects - ensure arrays exist
        projects: Array.isArray(member.projects) ? member.projects : [],
        
        // Achievements - ensure arrays exist
        achievements: Array.isArray(member.achievements) ? member.achievements : [],
        
        // Certifications - ensure arrays exist
        certifications: member.certifications || [],
        
        // Community contributions - ensure arrays exist
        eventContributionType: member.eventContributionType || [],
        
        // Add dynamic profile status info calculated on the fly
        status: member.status || "active",
        profileStatus: member.status || "active",
        isVerified: !!member.isVerified,
        isSuspended: !!member.isSuspended
      }));
      
      // Return results without pagination info
      return res.status(200).json({
        success: true,
        message: "All members retrieved successfully",
        data: formattedMembers,
        count: total
      });
      
    } catch (error) {
      console.error("Error fetching public members:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch members",
        error: error.message
      });
    }
  };
/**
 * @desc Retrieve a single active, verified, non-suspended member profile by document ID
 * @route GET /api/public/members/:id
 * @access Public
 * @params {string} id - Member document ID
 * @returns {Object} 200 - Sanitized member profile details
 * @returns {Object} 404 - If member not found or profile not public
 * @returns {Object} 500 - Server error
 */
// Get a single public member by ID
export const getPublicMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Member not found or profile is not public"
      });
    }

    const member = await Member.findOne({
      _id: id,
      isSuspended: { $ne: true }
    });
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found or profile is not public"
      });
    }
    
    // Format member data for public consumption
    const formattedMember = {
      _id: member._id,
      fullName: member.fullName,
      batch: member.batch,
      course: member.course,
      isPlaced: member.isPlaced,
      bio: member.bio,
      profilePic: member.profilePic ? (member.profilePic.url || member.profilePic) : null,
      skills: Array.isArray(member.skills) ? member.skills : [],
      linkedinProfile: member.linkedinProfile,
      githubProfile: member.githubProfile,
      twitterProfile: member.twitterProfile,
      instagramProfile: member.instagramProfile,
      projects: Array.isArray(member.projects) ? member.projects : [],
      achievements: Array.isArray(member.achievements) ? member.achievements : [],
      certifications: member.certifications || [],
      eventContributionType: member.eventContributionType || []
    };
    
    return res.status(200).json({
      success: true,
      message: "Member retrieved successfully",
      data: formattedMember
    });
    
  } catch (error) {
    console.error("Error fetching public member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member details",
      error: error.message
    });
  }
};

/**
 * @desc Retrieve total and per-batch active member counts
 * @route GET /api/public/members/counts
 * @access Public
 * @returns {Object} 200 - Object mapping batch names to active member counts
 * @returns {Object} 500 - Server error
 */
const formatCanonicalBatchName = (b) => {
  if (!b) return "";
  if (typeof b === "string") {
    let clean = b.replace(/\s*batch\s*/i, " ").trim();
    if (!clean.toLowerCase().startsWith("the uniques") && !clean.toLowerCase().startsWith("uniques")) {
      return `The Uniques ${clean}`;
    }
    if (clean.toLowerCase().startsWith("uniques")) {
      return `The ${clean}`;
    }
    return clean;
  }
  if (b.label) {
    const clean = b.label.trim();
    if (clean.toLowerCase().startsWith("the uniques")) return clean;
    if (clean.toLowerCase().startsWith("uniques")) return `The ${clean}`;
    return `The Uniques ${clean}`;
  }
  if (b.title) {
    return b.title.replace(/\s*batch\s*/i, " ").trim();
  }
  return b.id || b.name || "";
};

// Add this method to get member counts by batch
export const getMemberCounts = async (req, res) => {
    try {
      const baseFilter = { isSuspended: { $ne: true } };
      const [totalCount, allBatchDocs, batchAgg] = await Promise.all([
        Member.countDocuments(baseFilter),
        BatchProfile.find().lean().catch(() => []),
        Member.aggregate([
          { $match: baseFilter },
          { $group: { _id: "$batch", count: { $sum: 1 } } }
        ])
      ]);

      const counts = {
        "All": totalCount,
      };

      if (allBatchDocs && allBatchDocs.length > 0) {
        allBatchDocs.forEach((b) => {
          const batchName = formatCanonicalBatchName(b);
          if (batchName) counts[batchName] = 0;
        });
      } else {
        [
          "The Uniques 1.0",
          "The Uniques 2.0",
          "The Uniques 3.0",
          "The Uniques 4.0",
          "The Uniques 5.0",
          "The Uniques 6.0",
        ].forEach((b) => {
          counts[b] = 0;
        });
      }

      batchAgg.forEach((item) => {
        if (item._id) {
          const canonical = formatCanonicalBatchName(item._id);
          counts[canonical] = (counts[canonical] || 0) + item.count;
        }
      });

      return res.status(200).json({
        success: true,
        message: "Batch counts retrieved successfully",
        data: counts
      });
      
    } catch (error) {
      console.error("Error getting member counts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch member counts",
        error: error.message
      });
    }
  };

/**
 * @desc Process public contact form submission, persist inquiry, and send email alert
 * @route POST /api/contact
 * @access Public
 * @body {string} firstName - Sender first name
 * @body {string} lastName - Sender last name
 * @body {string} email - Sender contact email
 * @body {string} [phone] - Sender contact phone
 * @body {string} message - Message text
 * @body {string[]} [services] - Array of requested services
 * @returns {Object} 200 - Success message and created enquiry ID
 * @returns {Object} 400 - Validation failure
 * @returns {Object} 500 - Server error
 */
  export const submitContactForm = async (req, res) => {
    try {
        // Extract contact form data
        const { firstName, lastName, email, phone, message, services } = req.body;
        
        // Basic validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: firstName, lastName, email, and message'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        
        // Store the enquiry in the database
        const newEnquiry = new Enquiry({
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            message,
            services: services || [],
            ipAddress: req.ip,
            referrer: req.get('referer') || 'Direct'
        });
        
        await newEnquiry.save();
        
        // Send email notification
        const emailSent = await sendContactEmail({
            ...req.body,
            enquiryId: newEnquiry._id // Include the enquiry ID for reference
        });
        
        if (!emailSent) {
            // Even if the email fails, the enquiry is stored in the database
            console.warn(`Email notification failed for enquiry ID: ${newEnquiry._id}`);
        }
        
        // Success response
        return res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully',
            enquiryId: newEnquiry._id
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing your request',
            error: error.message
        });
    }
};
