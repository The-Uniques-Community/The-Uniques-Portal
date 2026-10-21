/**
 * @file adminControllers.js
 * @description Administrative controllers for approving profiles, blocking/unblocking members, imposing fines, creating events/admins, and onboarding members with temporary credentials.
 * @architecture Mounted at `/api/admin` via `routes/admin/adminRoute.js`, mutating Member and Event documents and dispatching welcome emails.
 * @agent_note Password hashing runs via bcrypt with 12 salt rounds. When creating or onboarding members, check both email and admno for uniqueness.
 */
import mongoose from 'mongoose';
import Member from '../../models/member/memberModel.js'
import Event from '../../models/member/eventModel.js'
import Admin from '../../models/admin/adminModel.js';
import bcrypt from 'bcryptjs';
import sendWelcomeCredentialsEmail from '../../services/members/sendWelcomeCredentialsEmail.js';

// approve pending member profile
/**
 * @desc    Approve a pending member profile and mark verified
 * @route   POST /api/admin/approveProfile
 * @access  Private (Admin)
 * @body    {Object} req.body
 * @body    {string} req.body.email - Member email address
 * @returns {Object} Success or failure message
 */
export const approveProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "User does not exist" });
        }
        await Member.updateOne(
            { email },
            {
                isVerified: true
            }
        );
        res.status(200).json({ message: "User profile approved successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

/**
 * @desc    Block and suspend a member account
 * @route   POST /api/admin/blockMember
 * @access  Private (Admin)
 * @body    {Object} req.body
 * @body    {string} req.body.email - Member email address
 * @returns {Object} Success or failure message
 */
export const blockMember = async (req, res) => {
    try {
        const { email } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "User does not exist" });
        }
        await Member.updateOne(
            { email },
            {
                isSuspended: true
            }
        );
        res.status(200).json({ message: "User blocked successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

/**
 * @desc    Unblock and restore an active member account
 * @route   POST /api/admin/unblockMember
 * @access  Private (Admin)
 * @body    {Object} req.body
 * @body    {string} req.body.email - Member email address
 * @returns {Object} Success or failure message
 */
export const unblockMember = async (req, res) => {
    try {
        const { email } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "User does not exist" });
        }
        await Member.updateOne(
            { email },
            {
                isSuspended: false
            }
        );
        res.status(200).json({ message: "User unblocked successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

// impose fine
/**
 * @desc    Impose legacy fine status on a member
 * @route   POST /api/admin/imposeFine
 * @access  Private (Admin)
 * @body    {Object} req.body
 * @body    {string} req.body.email - Member email address
 * @body    {string|number} req.body.fine - Fine amount or status string
 * @returns {Object} Success or failure message
 */
export const imposeFine = async (req, res) => {
    try {
        const { email, fine } = req.body;
        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const fineAmount = typeof fine === 'number' ? fine : Number(fine) || 0;
        await Member.updateOne(
            { email },
            {
                $push: {
                    fines: {
                        amount: fineAmount,
                        reason: req.body.reason || "Administrative fine",
                        dateImposed: new Date(),
                        status: "pending"
                    }
                }
            }
        );
        res.status(200).json({ message: "Fine imposed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

// list a new event
/**
 * @desc    Create and list a new event in the system
 * @route   POST /api/admin/listNewEvent
 * @access  Private (Admin)
 * @body    {Object} req.body - Event metadata
 * @returns {Object} Success or failure message
 */
export const listNewEvent = async (req, res) => {
    try {
        const { eventName, eventDescription, eventDate, eventTime, eventVenue, eventOrganizer, eventOrganizerBatch, eventType } = req.body;
        const event = new Event({
            eventName,
            eventDescription,
            eventDate,
            eventTime,
            eventVenue,
            eventOrganizerBatch: eventOrganizer || eventOrganizerBatch || "The Uniques 1.0",
            eventType
        });
        await event.save();
        res.status(200).json({ message: "Event listed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

/**
 * @desc    Create a new administrator account with hashed password
 * @route   POST /api/admin/createAdmin
 * @access  Private (Admin)
 * @body    {Object} req.body
 * @body    {string} req.body.email - Admin email
 * @body    {string} req.body.password - Admin plaintext password
 * @returns {Object} Success or failure message
 */
export const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = new Admin({ email, password: hashedPassword, role: "admin" });
        await admin.save();
        res.status(200).json({ message: "Admin created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

// Utility function to generate random passwords
/**
 * @desc    Generate a randomized alphanumeric password string
 * @param   {number} [length=8] - Number of characters to generate
 * @returns {string} Random password string
 */
export const generateRandomPassword = (length = 8) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };
// Add a new member (by admin)
/**
 * @desc    Onboard a new member, generate temporary password, and dispatch welcome credentials email
 * @route   POST /api/admin/member/add
 * @access  Private (Admin)
 * @body    {Object} req.body - Member onboarding details
 * @body    {string} req.body.fullName - Full name
 * @body    {string} req.body.email - Member email address
 * @body    {string} req.body.batch - Batch name (e.g., "The Uniques 1.0")
 * @body    {string} req.body.admno - Admission number
 * @body    {string} [req.body.course='B.Tech CSE'] - Course
 * @body    {string} [req.body.password] - Plaintext password (auto-generated if omitted)
 * @returns {Object} JSON response containing created member document and plaintext temporary password
 */
export const addMember = async (req, res) => {
    try {
      // Extract member details from request
      const { fullName, email, batch, admno, course } = req.body;
      
      // Validate required fields
      if (!fullName || !email || !batch || !admno) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: fullName, email, batch, and admno'
        });
      }
      
      // Check if member with same email or admission number already exists
      const existingMember = await Member.findOne({ 
        $or: [
          { email },
          { admno }
        ]
      });
      
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: `Member with this ${existingMember.email === email ? 'email' : 'admission number'} already exists`
        });
      }
      
      // Generate a random password or use the provided one
      const plainPassword = req.body.password || generateRandomPassword(8);
      
      // Hash the password before storing in database
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      // Create new member with hashed password
      const newMember = new Member({
        fullName,
        email,
        batch,
        admno,
        course: course || 'B.Tech CSE', // Default value if not provided
        password: hashedPassword, // Store hashed password
        role: 'member'
      });
      
      // Save the new member
      await newMember.save();
  
      // Send welcome email with credentials
      try {
        const userData = {
          fullName,
          email,
          batch,
          admno,
          course: course || 'B.Tech CSE'
        };
        
        await sendWelcomeCredentialsEmail(email, userData, plainPassword);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        // Log the error but don't fail the whole operation
        console.error('Failed to send welcome email:', emailError);
        // Consider adding this to a queue for retry later
      }
      
      // Response includes the temporary password that was set
      return res.status(201).json({
        success: true,
        message: 'Member added successfully and welcome email sent',
        data: {
          member: {
            _id: newMember._id,
            fullName: newMember.fullName,
            email: newMember.email,
            batch: newMember.batch,
            admno: newMember.admno,
            course: newMember.course
          },
          temporaryPassword: plainPassword // Include the plaintext password in the response
        }
      });
    } catch (error) {
      console.error('Error adding member:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

// You'll need a separate endpoint to hash the password after it's been shared
// This could be triggered when the member first logs in or by an admin
/**
 * @desc    Hash an existing member's stored password using bcrypt
 * @route   PUT /api/admin/member/:memberId/hash-password
 * @access  Private (Admin)
 * @param   {string} req.params.memberId - Member ObjectId
 * @returns {Object} JSON response confirming password hash update
 */
export const hashMemberPassword = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID'
      });
    }
    
    const member = await Member.findById(memberId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    member.password = await bcrypt.hash(member.password, salt);
    
    // Save the member with hashed password
    await member.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password has been securely hashed'
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};