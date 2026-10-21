/**
 * @file memberController.js
 * @description Administrative member management controller for querying, updating, blocking, suspending, and filtering community members.
 * @architecture Mounted at `/api/admin/member` via `memberRoute.js`, operating on the primary Member Mongoose model and populated relations.
 * @agent_note Sensitive fields such as password, role, and email are restricted from direct update via updateMemberProfile to ensure security.
 */
import Member from "../../models/member/memberModel.js";
import File from "../../models/member/fileModel.js";
import Leave from "../../models/member/leaveModel.js";
import Event from "../../models/member/eventModel.js";
import Task from "../../models/uniques360/Task.js";
import Report from "../../models/uniques360/Report.js";
import mongoose from "mongoose";
import { paginateQuery, buildSearchQuery } from "../../utils/queryHelper.js";

/**
 * @desc    Fetch a single member profile by ID with populated relations (excluding password)
 * @route   GET /api/admin/member/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Member ObjectId
 * @returns {Object} JSON response containing member profile details
 */
export const getSingleMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
      });
    }

    const member = await Member.findById(id)
      .select('-password') // Exclude password from the response
      .populate('event_participation');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle profile status between 'blocked' and 'active'
 * @route   PATCH /api/admin/member/:id/block
 * @access  Private (Admin)
 * @param   {string} req.params.id - Member ObjectId
 * @returns {Object} JSON response with updated block status
 */
export const toggleBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Toggle block status via isSuspended flag
    member.isSuspended = !member.isSuspended;

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Member has been ${member.isSuspended ? 'blocked' : 'unblocked'} successfully`,
      data: {
        id: member._id,
        isSuspended: member.isSuspended,
        status: member.isSuspended ? 'blocked' : member.status,
        profileStatus: member.isSuspended ? 'blocked' : member.status
      }
    });
  } catch (error) {
    console.error('Error toggling block status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Suspend or Unsuspend Member
/**
 * @desc    Toggle member suspension flag with required audit reason
 * @route   PATCH /api/admin/member/:id/suspend
 * @access  Private (Admin)
 * @param   {string} req.params.id - Member ObjectId
 * @body    {Object} req.body
 * @body    {string} [req.body.reason] - Justification reason required when suspending
 * @returns {Object} JSON response indicating updated suspension state
 */
export const toggleSuspendStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // If suspending, require a reason
    if (!member.isSuspended && (!reason || reason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'A reason is required to suspend a member'
      });
    }

    // Toggle suspended status
    member.isSuspended = !member.isSuspended;

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Member has been ${member.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      data: {
        id: member._id,
        isSuspended: member.isSuspended
      }
    });
  } catch (error) {
    console.error('Error toggling suspend status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Edit Member Profile
/**
 * @desc    Update editable member profile fields with validation, protecting restricted attributes
 * @route   PUT /api/admin/member/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Member ObjectId
 * @body    {Object} req.body - Profile update attributes (excluding restricted fields)
 * @returns {Object} Updated member profile document
 */
export const updateMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
      });
    }

    // Fields that admin is not allowed to update
    const restrictedFields = ['password', 'googleId', 'role', '_id', 'email'];

    // Remove restricted fields from update data
    restrictedFields.forEach(field => {
      if (updateData[field]) delete updateData[field];
    });

    // Find member and update with validated data
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Member profile updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Error updating member profile:', error);

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a member
/**
 * @desc    Permanently delete a member record by ID
 * @route   DELETE /api/admin/member/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Member ObjectId
 * @returns {Object} Deletion confirmation message
 */
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Cascading delete: Remove profile picture if exists
    if (member.profilePic) {
      try {
        const fileId = member.profilePic._id || member.profilePic;
        await File.findByIdAndDelete(fileId);
      } catch (fileError) {
        console.error("Error deleting member profile picture:", fileError);
        // Continue with member deletion
      }
    }

    // Delete associated Leave records
    await Leave.deleteMany({ memberId: id });

    // Pull member ID from Event contribution teams
    await Event.updateMany(
      { "eventMembers.contributionTeam": id },
      { $pull: { "eventMembers.$[].contributionTeam": id } }
    );

    // Remove from Task assignments
    await Task.updateMany({ "assignedTo.member": id }, { $pull: { assignedTo: { member: id } } });

    // Clean up student reports
    await Report.deleteMany({ studentId: id });

    // Delete the member
    await Member.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Get all members with pagination
/**
 * @desc    Retrieve all community members with sort options and populated relations
 * @route   GET /api/admin/member
 * @access  Private (Admin)
 * @param   {string} [req.query.sortBy='createdAt'] - Field to sort by
 * @param   {string} [req.query.order='desc'] - Sort direction ('asc' | 'desc')
 * @returns {Object} List of members and total count
 */
export const getAllMembers = async (req, res) => {
  try {
    const { page, limit, sortBy = 'createdAt', order = 'desc', search, batch, status } = req.query;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const filter = { ...buildSearchQuery(search, ['fullName', 'email', 'admno']) };

    if (batch && batch !== 'All Batches' && batch !== 'All') {
      filter.batch = batch;
    }

    if (status) {
      if (status === 'blocked' || status === 'suspended') {
        filter.isSuspended = true;
      } else if (status === 'pending') {
        filter.isVerified = false;
      } else {
        filter.isSuspended = false;
        filter.status = status;
      }
    }

    const result = await paginateQuery(Member, filter, {
      page,
      limit,
      sort,
      select: '-password',
      populate: 'event_participation',
      lean: true,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      count: result.pagination.total,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get members by profile status
/**
 * @desc    Filter members by profile status ('inactive' | 'active' | 'pending' | 'blocked')
 * @route   GET /api/admin/member/status/:status
 * @access  Private (Admin)
 * @param   {string} req.params.status - Profile status string
 * @returns {Object} Filtered member records and count
 */
export const getMembersByProfileStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ["inactive", "active", "pending", "blocked", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile status'
      });
    }

    let members = [];
    if (status === "blocked" || status === "suspended") {
      members = await Member.find({ isSuspended: true }).select('-password');
    } else if (status === "pending") {
      members = await Member.find({ isVerified: false }).select('-password');
    } else {
      const allMembers = await Member.find({ isSuspended: false }).select('-password');
      members = allMembers.filter((m) => m.status === status);
    }

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members by status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get members by batch
/**
 * @desc    Retrieve member records belonging to a specified cohort/batch
 * @route   GET /api/admin/member/batch/:batch
 * @access  Private (Admin)
 * @param   {string} req.params.batch - Cohort name (e.g., "The Uniques 1.0")
 * @returns {Object} Members in the specified batch and count
 */
export const getMembersByBatch = async (req, res) => {
  try {
    const { batch } = req.params;

    const validBatches = [
      "The Uniques 1.0",
      "The Uniques 2.0",
      "The Uniques 3.0",
      "The Uniques 4.0",
      "The Uniques 5.0",
      "The Uniques 6.0",
    ];
    if (!validBatches.includes(batch)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch'
      });
    }

    const members = await Member.find({ batch })
      .select('-password');

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members by batch:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get members with fine
/**
 * @desc    Get members who have non-zero outstanding fines
 * @route   GET /api/admin/member/fines/all
 * @access  Private (Admin)
 * @returns {Object} Members with outstanding fines and count
 */
export const getMembersByFineStatus = async (req, res) => {
  try {
    const filter = { 'fines.0': { $exists: true } };
    if (req.query.batch) {
      filter.batch = req.query.batch;
    }

    const members = await Member.find(filter).select('-password');

    const formattedMembers = members.map(member => {
      const memberObj = member.toObject ? member.toObject() : { ...member };
      const fines = memberObj.fines || [];
      const totalAmount = fines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const totalPendingAmount = fines
        .filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      return {
        ...memberObj,
        totalAmount,
        totalPendingAmount
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMembers.length,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching members with fines:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get members with supplementary exams by semester
/**
 * @desc    Get members with supplementary exam records for a specific semester
 * @route   GET /api/admin/member/supplementary/semester/:semester
 * @access  Private (Admin)
 * @param   {string|number} req.params.semester - Semester number (1 to 8)
 * @returns {Object} Members with matching supplementary exam details
 */
export const getMembersBySupplementary = async (req, res) => {
  try {
    const { semester } = req.params;
    const semesterNum = parseInt(semester);

    // Validate semester
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester number. Must be between 1 and 8.'
      });
    }

    // Find members who have supplementary exams in the specified semester
    const members = await Member.find({
      'semesterSupplementary.semester': semesterNum
    }).select('-password');

    // For each member, only include the supplementary data for the requested semester
    const formattedMembers = members.map(member => {
      const memberObj = member.toObject();
      const supplementaryForSemester = member.semesterSupplementary.filter(
        sup => sup.semester === semesterNum
      );
      memberObj.semesterSupplementary = supplementaryForSemester;
      return memberObj;
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching members with supplementary exams:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get members with pending supplementary exams
/**
 * @desc    Get all members with unresolved pending supplementary exams
 * @route   GET /api/admin/member/supplementary/pending
 * @access  Private (Admin)
 * @returns {Object} Members with pending supplementary exam records
 */
export const getMembersWithPendingSupplementary = async (req, res) => {
  try {
    // Find members who have at least one supplementary exam with "pending" status
    const members = await Member.find({
      'semesterSupplementary.subjects.status': 'pending'
    }).select('-password');

    // For each member, filter to only include pending supplementaries
    const formattedMembers = members.map(member => {
      const memberObj = member.toObject();

      // Filter each semester to only include subjects with pending status
      memberObj.semesterSupplementary = member.semesterSupplementary.map(sem => {
        const semObj = sem.toObject();
        semObj.subjects = sem.subjects.filter(subj => subj.status === 'pending');
        return semObj;
      });

      // Remove any semesters that no longer have subjects after filtering
      memberObj.semesterSupplementary = memberObj.semesterSupplementary.filter(
        sem => sem.subjects.length > 0
      );

      return memberObj;
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching members with pending exams:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get aggregated member tab counts for admin and coordinator dashboards
 * @route   GET /api/admin/member/counts
 * @access  Private (Admin, Coordinator)
 */
export const getAdminMemberCounts = async (req, res) => {
  try {
    const [total, batch1, batch2, batch3, batch4, batch5, batch6, blocked] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ batch: "The Uniques 1.0" }),
      Member.countDocuments({ batch: "The Uniques 2.0" }),
      Member.countDocuments({ batch: "The Uniques 3.0" }),
      Member.countDocuments({ batch: "The Uniques 4.0" }),
      Member.countDocuments({ batch: "The Uniques 5.0" }),
      Member.countDocuments({ batch: "The Uniques 6.0" }),
      Member.countDocuments({ isSuspended: true }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin member counts retrieved successfully",
      data: {
        all: total,
        batch1,
        batch2,
        batch3,
        batch4,
        batch5,
        batch6,
        blocked,
      },
    });
  } catch (error) {
    console.error("Error fetching admin member counts:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};