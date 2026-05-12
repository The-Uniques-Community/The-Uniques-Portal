import Member from "../../models/member/memberModel.js";
import mongoose from "mongoose";

/**
 * Search for members by name, email or admission number
 * @route GET /api/admin/members/search
 */
export const searchMembers = async (req, res) => {
  try {
    const { query, batch, limit = 10 } = req.query;
    
    // Build search criteria
    let searchCriteria = {};
    
    if (query) {
      // Check if query is an admission number (exact match)
      if (/^[0-9]{4}(BTCS|BTCSD)[0-9]{3}$/.test(query)) {
        searchCriteria.admno = query;
      } else {
        // Search by name or email (partial match)
        searchCriteria.$or = [
          { fullName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ];
      }
    }
    
    // Filter by batch if provided
    if (batch) {
      searchCriteria.batch = batch;
    }
    
    // Execute search
    const members = await Member.find(searchCriteria)
      .select("fullName admno email batch profilePic fines")
      .limit(parseInt(limit));
    
    // Return search results
    return res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: members
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching members: " + error.message
    });
  }
};

/**
 * Impose a fine on a member
 * @route POST /api/admin/members/:memberId/fines
 */
export const imposeFine = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { amount, reason, dateImposed = new Date() } = req.body;
    
    // Validate parameters
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    // Find the member
    const member = await Member.findById(memberId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Create new fine object
    const newFine = {
      amount: Number(amount),
      reason,
      dateImposed,
      status: 'pending'
    };

    // Add fine to member's fines array
    member.fines.push(newFine);
    await member.save();
    
    // Get the newly added fine with its generated ID
    const addedFine = member.fines[member.fines.length - 1];

    return res.status(201).json({
      success: true,
      message: `Fine of ₹${amount} imposed successfully`,
      data: {
        fine: addedFine,
        memberId: member._id,
        memberName: member.fullName,
        totalPendingFines: member.fines
          .filter(f => f.status === 'pending')
          .reduce((sum, fine) => sum + fine.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error imposing fine:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update fine status (mark as paid, waived or pending)
 * @route PATCH /api/admin/members/:memberId/fines/:fineId
 */
export const updateFineStatus = async (req, res) => {
  try {
    const { memberId, fineId } = req.params;
    const { status, proofOfPaymentId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(memberId) || 
        !mongoose.Types.ObjectId.isValid(fineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Validate status
    if (!status || !['paid', 'waived', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be paid, waived, or pending'
      });
    }

    // Find the member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Find the specific fine
    const fineIndex = member.fines.findIndex(
      fine => fine._id.toString() === fineId
    );

    if (fineIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Update fine status
    member.fines[fineIndex].status = status;
    
    // Update proof of payment if provided
    if (proofOfPaymentId && mongoose.Types.ObjectId.isValid(proofOfPaymentId)) {
      member.fines[fineIndex].proofOfPayment = proofOfPaymentId;
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Fine marked as ${status} successfully`,
      data: {
        fine: member.fines[fineIndex],
        totalPendingFines: member.fines
          .filter(f => f.status === 'pending')
          .reduce((sum, fine) => sum + fine.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error updating fine status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating fine status',
      error: error.message
    });
  }
};

/**
 * Remove a fine
 * @route DELETE /api/admin/members/:memberId/fines/:fineId
 */
export const removeFine = async (req, res) => {
  try {
    const { memberId, fineId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(memberId) || 
        !mongoose.Types.ObjectId.isValid(fineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Find the member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Find and store the fine before removal for reference
    const fineToRemove = member.fines.find(fine => fine._id.toString() === fineId);
    if (!fineToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Remove the fine
    member.fines = member.fines.filter(fine => fine._id.toString() !== fineId);
    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Fine removed successfully',
      data: {
        removedFine: fineToRemove,
        totalPendingFines: member.fines
          .filter(f => f.status === 'pending')
          .reduce((sum, fine) => sum + fine.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error removing fine:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing fine',
      error: error.message
    });
  }
};

/**
 * Get all pending fines for a member
 * @route GET /api/admin/members/:memberId/fines/pending
 */
export const getPendingFines = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }

    // Find the member
    const member = await Member.findById(memberId)
      .select('fullName admno email batch fines')
      .populate('fines.proofOfPayment');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Filter pending fines
    const pendingFines = member.fines.filter(fine => fine.status === 'pending');
    
    // Calculate total amount
    const totalAmount = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);

    return res.status(200).json({
      success: true,
      message: 'Pending fines retrieved successfully',
      data: {
        member: {
          id: member._id,
          name: member.fullName,
          admno: member.admno,
          email: member.email,
          batch: member.batch
        },
        pendingFines,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Error retrieving pending fines:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving pending fines',
      error: error.message
    });
  }
};

/**
 * Get fine history for a member
 * @route GET /api/admin/members/:memberId/fines
 */
export const getFineHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status } = req.query;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }

    // Find the member
    const member = await Member.findById(memberId)
      .select('fullName admno email batch fines')
      .populate('fines.proofOfPayment');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Filter by status if provided
    let fines = member.fines;
    if (status && ['pending', 'paid', 'waived'].includes(status)) {
      fines = fines.filter(fine => fine.status === status);
    }

    // Sort by date imposed (newest first)
    fines.sort((a, b) => new Date(b.dateImposed) - new Date(a.dateImposed));

    // Calculate totals
    const totals = {
      total: member.fines.reduce((sum, fine) => sum + fine.amount, 0),
      pending: member.fines
        .filter(f => f.status === 'pending')
        .reduce((sum, fine) => sum + fine.amount, 0),
      paid: member.fines
        .filter(f => f.status === 'paid')
        .reduce((sum, fine) => sum + fine.amount, 0),
      waived: member.fines
        .filter(f => f.status === 'waived')
        .reduce((sum, fine) => sum + fine.amount, 0)
    };

    return res.status(200).json({
      success: true,
      message: 'Fine history retrieved successfully',
      data: {
        member: {
          id: member._id,
          name: member.fullName,
          admno: member.admno,
          email: member.email,
          batch: member.batch
        },
        fines,
        totals
      }
    });
  } catch (error) {
    console.error('Error retrieving fine history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving fine history',
      error: error.message
    });
  }
};

/**
 * Get fine statistics across all members
 * @route GET /api/admin/fines/statistics
 */
export const getFineStatistics = async (req, res) => {
  try {
    const members = await Member.find()
      .select('fullName fines')
      .populate('fines.proofOfPayment');
    
    const statistics = {
      totalFinesIssued: 0,
      totalAmount: 0,
      totalPendingAmount: 0,
      totalPaidAmount: 0,
      totalWaivedAmount: 0,
      membersWithPendingFines: 0,
      recentFines: []
    };

    const allFines = [];
    
    members.forEach(member => {
      if (!member.fines || member.fines.length === 0) return;
      
      // Count total fines
      statistics.totalFinesIssued += member.fines.length;
      
      // Sum amounts by status
      member.fines.forEach(fine => {
        statistics.totalAmount += fine.amount;
        
        if (fine.status === 'pending') {
          statistics.totalPendingAmount += fine.amount;
        } else if (fine.status === 'paid') {
          statistics.totalPaidAmount += fine.amount;
        } else if (fine.status === 'waived') {
          statistics.totalWaivedAmount += fine.amount;
        }
        
        // Add to all fines for sorting later
        allFines.push({
          ...fine.toObject(),
          memberName: member.fullName,
          memberId: member._id
        });
      });
      
      // Count members with pending fines
      if (member.fines.some(fine => fine.status === 'pending')) {
        statistics.membersWithPendingFines++;
      }
    });
    
    // Get 5 most recent fines
    statistics.recentFines = allFines
      .sort((a, b) => new Date(b.dateImposed) - new Date(a.dateImposed))
      .slice(0, 5);
    
    return res.status(200).json({
      success: true,
      message: 'Fine statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Error retrieving fine statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving fine statistics',
      error: error.message
    });
  }
};

export const getAllMembersWithFines = async (req, res) => {
  try {
    const { batch, search, status } = req.query;
    
    // Build query filter - starts empty to get all members with fines
    let filter = { 'fines.0': { $exists: true } }; // Only members who have at least one fine
    
    // Filter by status if provided
    if (status && ['pending', 'paid', 'waived'].includes(status.toLowerCase())) {
      filter['fines.status'] = status.toLowerCase();
    }
    
    // Filter by batch if provided
    if (batch && batch !== 'All Batches') {
      filter.batch = batch;
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { admno: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch all matching members without pagination
    const members = await Member.find(filter)
      .select('fullName admno email batch fines profilePic createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    // Process members to include fine statistics
    const membersWithDetails = members.map(member => {
      // Get all fines
      const allFines = member.fines || [];
      
      // Get pending fines
      const pendingFines = allFines.filter(fine => fine.status === 'pending');
      // Get paid fines
      const paidFines = allFines.filter(fine => fine.status === 'paid');
      // Get waived fines
      const waivedFines = allFines.filter(fine => fine.status === 'waived');
      
      // Calculate total amounts by status
      const totalPendingAmount = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);
      const totalPaidAmount = paidFines.reduce((sum, fine) => sum + fine.amount, 0);
      const totalWaivedAmount = waivedFines.reduce((sum, fine) => sum + fine.amount, 0);
      
      return {
        id: member._id,
        name: member.fullName,
        admno: member.admno,
        fineId: member.fines.map(fine => fine._id),
        email: member.email,
        batch: member.batch,
        profilePic: member.profilePic,
        pendingFinesCount: pendingFines.length,
        paidFinesCount: paidFines.length,
        waivedFinesCount: waivedFines.length,
        totalPendingAmount,
        totalPaidAmount,
        totalWaivedAmount,
        totalFinesCount: allFines.length,
        updatedAt: member.updatedAt,
        createdAt: member.createdAt
      };
    });
    
    // Sort results based on status filter
    if (status === 'pending') {
      membersWithDetails.sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
    } else if (status === 'paid') {
      membersWithDetails.sort((a, b) => b.totalPaidAmount - a.totalPaidAmount);
    } else if (status === 'waived') {
      membersWithDetails.sort((a, b) => b.totalWaivedAmount - a.totalWaivedAmount);
    } else {
      // Default sort - prioritize members with pending fines
      membersWithDetails.sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Members with fines retrieved successfully',
      data: {
        count: membersWithDetails.length,
        members: membersWithDetails
      }
    });
  } catch (error) {
    console.error('Error retrieving members with fines:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving members with fines',
      error: error.message
    });
  }
};

/**
 * Get members with pending fines
 * @route GET /api/admin/fines/pending/members
 */
export const getMembersWithPendingFines = async (req, res) => {
  try {
    const members = await Member.find({
      'fines.status': 'pending'
    }).select('fullName admno email batch fines');
    
    const membersWithDetails = members.map(member => {
      const pendingFines = member.fines.filter(fine => fine.status === 'pending');
      const totalPendingAmount = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);
      
      return {
        id: member._id,
        name: member.fullName,
        admno: member.admno,
        email: member.email,
        batch: member.batch,
        pendingFinesCount: pendingFines.length,
        totalPendingAmount
      };
    });
    
    // Sort by amount (highest first)
    membersWithDetails.sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
    
    return res.status(200).json({
      success: true,
      message: 'Members with pending fines retrieved successfully',
      data: {
        count: membersWithDetails.length,
        members: membersWithDetails
      }
    });
  } catch (error) {
    console.error('Error retrieving members with pending fines:', error);
    return res.status(500).json({
      
      success: false,
      message: 'Error retrieving members with pending fines',
      error: error.message
    });
  }
};