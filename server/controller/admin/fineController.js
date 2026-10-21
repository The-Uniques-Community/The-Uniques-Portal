/**
 * @file fineController.js
 * @description Controller managing member disciplinary fines, penalty tracking, payment status workflows, and fine analytics.
 * @architecture Mounted at `/api/admin/fine` and `/api/fine` via `fineRoute.js`, operating on embedded `fines` subdocuments in Member documents.
 * @agent_note Fines are subdocuments inside Member schema (`member.fines`). Status transitions include 'pending', 'paid', and 'waived'. Payment receipts link to File collection.
 */
import Member from "../../models/member/memberModel.js";
import mongoose from "mongoose";
import { parsePaginationParams, buildSearchQuery } from "../../utils/queryHelper.js";

/**
 * @desc    Search members by name, email, or admission number for fine operations
 * @route   GET /api/admin/members/search
 * @access  Private (Admin)
 * @param   {string} [req.query.query] - Search string (name, email, or exact admno pattern)
 * @param   {string} [req.query.batch] - Filter by batch
 * @param   {number} [req.query.limit=10] - Result limit
 * @returns {Object} List of matching members with fine details
 */
export const searchMembers = async (req, res) => {
  try {
    const { query, batch, limit = 10 } = req.query;
    
    // Build search criteria
    let searchCriteria = {};
    
    if (query) {
      // Check if query is an admission number (exact match)
      if (/^[0-9]{4}(BTCS|BTCED|BTCSD|BCAPU|BCAPTU|BTAIML)[0-9]{3}$/i.test(query)) {
        searchCriteria.admno = query.toUpperCase();
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
 * @desc    Impose a monetary fine on a specified member
 * @route   POST /api/admin/members/:memberId/fines
 * @access  Private (Admin)
 * @param   {string} req.params.memberId - Member ObjectId
 * @body    {Object} req.body
 * @body    {number} req.body.amount - Fine amount in INR
 * @body    {string} req.body.reason - Reason for fine imposition
 * @body    {Date} [req.body.dateImposed=new Date()] - Date fine was incurred
 * @returns {Object} Newly created fine record and updated total pending amount
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
 * @desc    Update fine status (mark as paid, waived, or pending) with optional receipt link
 * @route   PATCH /api/admin/members/:memberId/fines/:fineId
 * @access  Private (Admin)
 * @param   {string} req.params.memberId - Member ObjectId
 * @param   {string} req.params.fineId - Fine subdocument ObjectId
 * @body    {Object} req.body
 * @body    {string} req.body.status - New status ('pending' | 'paid' | 'waived')
 * @body    {string} [req.body.proofOfPaymentId] - Optional File ObjectId proof
 * @returns {Object} Updated fine object and pending fine sum
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
    if (req.body.proofOfPayment && typeof req.body.proofOfPayment === 'object') {
      const p = req.body.proofOfPayment;
      const rawUrl = typeof p.fileUrl === 'string' ? p.fileUrl : (typeof p.url === 'string' ? p.url : '');
      const safeUrl = rawUrl.startsWith('https://') ? rawUrl : '';
      const safeId = (p._id && mongoose.Types.ObjectId.isValid(p._id)) ? p._id : new mongoose.Types.ObjectId();
      member.fines[fineIndex].proofOfPayment = {
        _id: safeId,
        fileId: String(p.fileId || ''),
        fileUrl: safeUrl,
        url: safeUrl,
        fileName: String(p.fileName || p.name || '')
      };
    } else if (proofOfPaymentId) {
      const pIdStr = typeof proofOfPaymentId === 'object' ? proofOfPaymentId._id || proofOfPaymentId.fileId : proofOfPaymentId;
      const isDriveId = typeof pIdStr === 'string' && !mongoose.Types.ObjectId.isValid(pIdStr);
      member.fines[fineIndex].proofOfPayment = {
        _id: mongoose.Types.ObjectId.isValid(pIdStr) ? pIdStr : new mongoose.Types.ObjectId(),
        fileId: isDriveId ? pIdStr : (typeof proofOfPaymentId === 'object' ? proofOfPaymentId.fileId || '' : ''),
        fileUrl: isDriveId ? `https://drive.google.com/file/d/${pIdStr}/preview` : (typeof proofOfPaymentId === 'object' ? proofOfPaymentId.fileUrl || proofOfPaymentId.url || '' : ''),
        url: isDriveId ? `https://drive.google.com/file/d/${pIdStr}/preview` : (typeof proofOfPaymentId === 'object' ? proofOfPaymentId.url || proofOfPaymentId.fileUrl || '' : ''),
        fileName: typeof proofOfPaymentId === 'object' ? proofOfPaymentId.fileName || proofOfPaymentId.name || 'receipt.pdf' : 'receipt.pdf'
      };
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
 * @desc    Remove and delete a fine record from a member's record
 * @route   DELETE /api/admin/members/:memberId/fines/:fineId
 * @access  Private (Admin)
 * @param   {string} req.params.memberId - Member ObjectId
 * @param   {string} req.params.fineId - Fine subdocument ObjectId
 * @returns {Object} Confirmation and removed fine details
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
 * @desc    Get all unresolved pending fines for a specific member
 * @route   GET /api/admin/members/:memberId/fines/pending OR GET /api/fine/profile/fines/pending
 * @access  Private (Admin / Member)
 * @param   {string} req.params.memberId - Member ObjectId
 * @returns {Object} Member pending fines and outstanding amount
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
      .select('fullName admno email batch fines');
    
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
 * @desc    Get complete fine history and summary totals for a member
 * @route   GET /api/admin/members/:memberId/fines OR GET /api/fine/profile/fines
 * @access  Private (Admin / Member)
 * @param   {string} req.params.memberId - Member ObjectId
 * @param   {string} [req.query.status] - Optional filter by status ('pending' | 'paid' | 'waived')
 * @returns {Object} Fine history records and status sum breakdown
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
      .select('fullName admno email batch fines');
    
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
 * @desc    Aggregate fine statistics across all community members
 * @route   GET /api/admin/fines/statistics
 * @access  Private (Admin)
 * @returns {Object} Aggregated totals for issued, collected, pending, and waived fines
 */
export const getFineStatistics = async (req, res) => {
  try {
    const pipeline = [
      { $match: { "fines.0": { $exists: true } } },
      {
        $facet: {
          metrics: [
            { $unwind: "$fines" },
            {
              $group: {
                _id: null,
                totalFinesIssued: { $sum: 1 },
                totalAmount: { $sum: "$fines.amount" },
                totalPendingAmount: {
                  $sum: { $cond: [{ $eq: ["$fines.status", "pending"] }, "$fines.amount", 0] },
                },
                totalPaidAmount: {
                  $sum: { $cond: [{ $eq: ["$fines.status", "paid"] }, "$fines.amount", 0] },
                },
                totalWaivedAmount: {
                  $sum: { $cond: [{ $eq: ["$fines.status", "waived"] }, "$fines.amount", 0] },
                },
              },
            },
          ],
          pendingCount: [
            { $match: { "fines.status": "pending" } },
            { $count: "count" },
          ],
          recentFines: [
            { $unwind: "$fines" },
            { $sort: { "fines.dateImposed": -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: "$fines._id",
                amount: "$fines.amount",
                reason: "$fines.reason",
                dateImposed: "$fines.dateImposed",
                status: "$fines.status",
                memberName: "$fullName",
                memberId: "$_id",
              },
            },
          ],
        },
      },
    ];

    const [result] = await Member.aggregate(pipeline).exec();
    const metric = result?.metrics?.[0] || {
      totalFinesIssued: 0,
      totalAmount: 0,
      totalPendingAmount: 0,
      totalPaidAmount: 0,
      totalWaivedAmount: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Fine statistics retrieved successfully",
      data: {
        totalFinesIssued: metric.totalFinesIssued,
        totalAmount: metric.totalAmount,
        totalPendingAmount: metric.totalPendingAmount,
        totalPaidAmount: metric.totalPaidAmount,
        totalWaivedAmount: metric.totalWaivedAmount,
        membersWithPendingFines: result?.pendingCount?.[0]?.count || 0,
        recentFines: result?.recentFines || [],
      },
    });
  } catch (error) {
    console.error("Error retrieving fine statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving fine statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Retrieve all members with at least one fine, with filtering and stats
 * @route   GET /api/admin/fines/members OR GET /api/admin/member/get-all-fine-history
 * @access  Private (Admin)
 * @param   {string} [req.query.batch] - Filter by batch
 * @param   {string} [req.query.search] - Search by name, admno, or email
 * @param   {string} [req.query.status] - Filter by fine status ('pending' | 'paid' | 'waived')
 * @returns {Object} List of members with fine statistics
 */
export const getAllMembersWithFines = async (req, res) => {
  try {
    const { batch, search, status } = req.query;
    const { page, limit, skip } = parsePaginationParams(req.query, { defaultLimit: 10 });
    
    // Build query filter - starts empty to get all members with fines
    let filter = { 'fines.0': { $exists: true } }; // Only members who have at least one fine
    
    // Filter by status if provided
    if (status && ['pending', 'paid', 'waived'].includes(status.toLowerCase())) {
      filter['fines.status'] = status.toLowerCase();
    }
    
    // Filter by batch if provided
    if (batch && batch !== 'All Batches' && batch !== 'All') {
      filter.batch = batch;
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      filter = {
        ...filter,
        ...buildSearchQuery(search, ['fullName', 'admno', 'email']),
      };
    }
    
    // Fetch matching members
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
        _id: member._id,
        name: member.fullName,
        fullName: member.fullName,
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
        totalPendingFine: totalPendingAmount,
        totalPaidFine: totalPaidAmount,
        totalFinesCount: allFines.length,
        updatedAt: member.updatedAt,
        createdAt: member.createdAt
      };
    });
    
    // Sort results based on status filter
    if (status === 'paid') {
      membersWithDetails.sort((a, b) => b.totalPaidAmount - a.totalPaidAmount);
    } else if (status === 'waived') {
      membersWithDetails.sort((a, b) => b.totalWaivedAmount - a.totalWaivedAmount);
    } else {
      // Default sort - prioritize members with pending fines
      membersWithDetails.sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
    }
    
    const totalCount = membersWithDetails.length;
    const paginatedMembers = membersWithDetails.slice(skip, skip + limit);
    const pages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      success: true,
      message: 'Members with fines retrieved successfully',
      data: {
        count: totalCount,
        members: paginatedMembers
      },
      members: paginatedMembers,
      count: totalCount,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
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
 * @desc    Get summary list of all members with currently pending fines
 * @route   GET /api/admin/fines/pending/members
 * @access  Private (Admin)
 * @returns {Object} Sorted list of members by highest pending fine balance
 */
export const getMembersWithPendingFines = async (req, res) => {
  try {
    const filter = {
      'fines.status': 'pending'
    };
    if (req.query.batch) {
      filter.batch = req.query.batch;
    }

    const members = await Member.find(filter).select('fullName admno email batch fines');
    
    const membersWithDetails = members.map(member => {
      const allFines = member.fines || [];
      const pendingFines = allFines.filter(fine => fine.status === 'pending');
      const totalPendingAmount = pendingFines.reduce((sum, fine) => sum + (Number(fine.amount) || 0), 0);
      const totalAmount = allFines.reduce((sum, fine) => sum + (Number(fine.amount) || 0), 0);
      
      return {
        id: member._id,
        _id: member._id,
        name: member.fullName,
        fullName: member.fullName,
        admno: member.admno,
        email: member.email,
        batch: member.batch,
        pendingFinesCount: pendingFines.length,
        totalPendingAmount,
        totalAmount
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