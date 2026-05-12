import Member from "../../models/member/memberModel.js";
import mongoose from "mongoose";
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
      .populate('certifications')
      .populate('profilePic')
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

    // Toggle block status
    const newStatus = member.profileStatus === 'blocked' ? 'active' : 'blocked';
    member.profileStatus = newStatus;

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Member has been ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      data: {
        id: member._id,
        profileStatus: member.profileStatus
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
        const File = mongoose.model("File"); // Ensure File model is available
        await File.findByIdAndDelete(fileId);
      } catch (fileError) {
        console.error("Error deleting member profile picture:", fileError);
        // Continue with member deletion
      }
    }

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
export const getAllMembers = async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc' } = req.query;

    // Create sort object
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Get total count
    const total = await Member.countDocuments();

    // Fetch all members without pagination and populate needed fields
    const members = await Member.find()
      .select('-password')
      .populate('certifications')
      .populate('profilePic')
      .populate('event_participation')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      data: members,
      count: total
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get members by profile status
export const getMembersByProfileStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ["inactive", "active", "pending", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile status'
      });
    }

    const members = await Member.find({ profileStatus: status })
      .select('-password');

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
export const getMembersByBatch = async (req, res) => {
  try {
    const { batch } = req.params;

    // Validate batch
    const validBatches = ["The Uniques 1.0", "The Uniques 2.0", "The Uniques 3.0"];
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
export const getMembersByFineStatus = async (req, res) => {
  try {
    // If fineStatus is a string that represents a number, we can query members with fines > 0
    const members = await Member.find({
      fineStatus: { $ne: "0" }
    }).select('-password');

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members
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