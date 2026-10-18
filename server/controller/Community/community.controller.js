/**
 * @file community.controller.js
 * @description Controller managing community administrator creation and the Campus Ambassador program (student applications, reviews, status transitions, and aggregate metrics).
 * @architecture Mounted at `/api/community` and `/api/campus-ambassador` via `community.routes.js` and `campusAmbassadorRoute.js`. Interacts with `CommunityAdmin` and `CampusAmbassador` models.
 * @agent_note Accepts resume upload paths on applications (`req.file.path`) and automatically records programStart timestamp when status becomes 'accepted'.
 */
import CommunityAdmin from "../../models/community/communityAdmin.js";
import CampusAmbassador from "../../models/community/campusAmbassadorModel.js";
import bcrypt from "bcryptjs";

/**
 * @desc Provision a new community administrator account with bcrypt hashed password
 * @route POST /api/community/createCommunityAdmin
 * @route POST /api/admin/create
 * @access Public/Admin
 * @body {string} email - Admin email address
 * @body {string} password - Raw password
 * @returns {Object} 200 - Confirmation message
 * @returns {Object} 400 - If admin already exists
 * @returns {Object} 500 - Server error
 */
export const createCommunityAdmin = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const admin = await CommunityAdmin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "Community Admin already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = new CommunityAdmin({
      email,
      password: hashedPassword,
      role: role || "communityadmin",
    });
    await newAdmin.save();
    res.status(200).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @desc Submit student application for the Campus Ambassador program
 * @route POST /api/campus-ambassador/apply
 * @access Public
 * @body {string} fullName - Applicant's full name
 * @body {string} email - Applicant email
 * @body {string} phone - Contact number
 * @body {string} college - College/University name
 * @body {string} course - Course of study
 * @body {string} graduationYear - Expected graduation year
 * @body {string} [linkedinProfile] - LinkedIn profile URL
 * @body {string} whyJoin - Statement of purpose/motivation
 * @body {string} [heardFrom] - Referral source
 * @returns {Object} 201 - Success response with new application ID
 * @returns {Object} 400 - If application with email already exists
 * @returns {Object} 500 - Server error
 */
export const applyForCampusAmbassador = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      course,
      graduationYear,
      linkedinProfile,
      whyJoin,
      heardFrom
    } = req.body;

    // Check if application with this email already exists
    const existingApplication = await CampusAmbassador.findOne({ email });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "An application with this email already exists"
      });
    }

    // Create new application using Mongoose model
    const newApplication = new CampusAmbassador({
      fullName,
      email,
      phone,
      college,
      course,
      graduationYear,
      linkedinProfile,
      whyJoin,
      heardFrom,
      status: "pending",
      batchYear: new Date().getFullYear().toString()
    });

    // Handle resume if provided
    if (req.file && req.file.path) {
      newApplication.resumeUrl = req.file.path;
    }

    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: newApplication._id
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later"
    });
  }
};

/**
 * @desc Retrieve paginated campus ambassador applications with status and keyword search
 * @route GET /api/campus-ambassador
 * @access Private (Admin)
 * @query {string} [status] - Filter by status ('pending'|'reviewing'|'accepted'|'rejected')
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @query {string} [search] - Keyword search on fullName, email, or college
 * @returns {Object} 200 - Paginated application records and counts
 * @returns {Object} 500 - Server error
 */
// Get all campus ambassador applications with optional status filter
export const getCampusAmbassadorApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Filter by status if provided
    if (status && ['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const applications = await CampusAmbassador.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await CampusAmbassador.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: applications.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      data: applications
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later"
    });
  }
};

/**
 * @desc Retrieve details of a specific campus ambassador application by document ID
 * @route GET /api/campus-ambassador/:id
 * @access Private (Admin)
 * @params {string} id - Application document ID
 * @returns {Object} 200 - Application document
 * @returns {Object} 404 - If application not found
 * @returns {Object} 500 - Server error
 */
// Get a specific application by ID
export const getCampusAmbassadorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await CampusAmbassador.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later"
    });
  }
};

/**
 * @desc Update application review status and reason
 * @route PATCH /api/campus-ambassador/:id/status
 * @access Private (Admin)
 * @params {string} id - Application document ID
 * @body {string} status - New status ('pending'|'reviewing'|'accepted'|'rejected')
 * @body {string} [statusUpdateReason] - Review feedback or reason
 * @returns {Object} 200 - Success message and updated application document
 * @returns {Object} 400 - If status value is invalid
 * @returns {Object} 404 - If application not found
 * @returns {Object} 500 - Server error
 */
// Update application status
export const updateCampusAmbassadorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusUpdateReason } = req.body;
    
    // Validate status value
    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const application = await CampusAmbassador.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Update fields
    application.status = status;
    
    if (statusUpdateReason) {
      application.statusUpdateReason = statusUpdateReason;
    }
    
    // If accepted, set program start date if not already set
    if (status === 'accepted' && !application.programStart) {
      application.programStart = new Date();
    }
    
    await application.save();
    
    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later"
    });
  }
};

/**
 * @desc Retrieve aggregate application statistics by status and top applicant colleges
 * @route GET /api/campus-ambassador/stats
 * @access Private (Admin)
 * @returns {Object} 200 - Breakdown of status counts and top colleges array
 * @returns {Object} 500 - Server error
 */
// Get application statistics
export const getCampusAmbassadorStats = async (req, res) => {
  try {
    // Count applications by status
    const pending = await CampusAmbassador.countDocuments({ status: 'pending' });
    const reviewing = await CampusAmbassador.countDocuments({ status: 'reviewing' });
    const accepted = await CampusAmbassador.countDocuments({ status: 'accepted' });
    const rejected = await CampusAmbassador.countDocuments({ status: 'rejected' });
    const total = await CampusAmbassador.countDocuments({});
    
    // Get top colleges
    const topColleges = await CampusAmbassador.aggregate([
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        statusCounts: {
          total,
          pending,
          reviewing,
          accepted,
          rejected
        },
        topColleges
      }
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later"
    });
  }
};