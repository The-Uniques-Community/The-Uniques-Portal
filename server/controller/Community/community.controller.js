import CommunityAdmin from "../../models/community/communityAdmin.js";
import CampusAmbassador from "../../models/community/campusAmbassadorModel.js";
import bcrypt from "bcrypt";

export const createCommunityAdmin = async (req, res) => {
  const { email, password } = req.body;
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
    });
    await newAdmin.save();
    res.status(200).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

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