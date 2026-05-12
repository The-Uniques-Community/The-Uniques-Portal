import { sendContactEmail } from '../../services/members/sendContactEmail.js';
import sendEnquiryReplyEmail from '../../services/members/sendEnquiryReplyEmail.js';
import Enquiry from '../../models/Enquiry/enquiryModel.js';

// Submit contact form
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

export const replyToEnquiry = async (req, res) => {
    try {
        const { replyMessage } = req.body;
        
        if (!replyMessage || replyMessage.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }
        
        const enquiry = await Enquiry.findById(req.params.id);
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }
        
        // Handle the respondedBy field properly to avoid ObjectId errors
        let respondedBy;
        if (req.user && req.user._id) {
            // If user is authenticated, use their ID
            respondedBy = req.user._id;
        } else {
            // For system responses, don't set the field (schema should handle default)
            respondedBy = null;
        }
        
        const responderName = req.user ? (req.user.fullName || req.user.name || 'The Uniques Team') : 'The Uniques Team';
        
        // Update enquiry with response details
        enquiry.status = 'resolved';
        enquiry.responseDetails = {
            // Only include respondedBy if it's a valid ObjectId
            ...(respondedBy && { respondedBy }),
            responseDate: new Date(),
            responseMessage: replyMessage
        };
        
        await enquiry.save();
        
        try {
            // Send email reply to the user
            const emailSent = await sendEnquiryReplyEmail({
                email: enquiry.email,
                firstName: enquiry.firstName,
                lastName: enquiry.lastName,
                originalMessage: enquiry.message,
                replyMessage: replyMessage,
                respondedBy: responderName
            });
            
            if (!emailSent) {
                console.warn(`Email reply failed to send for enquiry ID: ${enquiry._id}`);
                return res.status(200).json({
                    success: true,
                    message: 'Enquiry updated, but email notification failed to send',
                    emailSent: false,
                    data: enquiry
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Reply sent successfully',
                emailSent: true,
                data: enquiry
            });
        } catch (emailError) {
            console.error('Error sending reply email:', emailError);
            return res.status(200).json({
                success: true,
                message: 'Enquiry updated, but email notification failed to send',
                emailSent: false,
                data: enquiry,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error(`Error replying to enquiry ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Server error while sending reply',
            error: error.message
        });
    }
};

// Get all enquiries (admin access only)
export const getAllEnquiries = async (req, res) => {
    try {
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Add filtering
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Add sorting
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Default sort by creation date (newest first)
        }
        
        const enquiries = await Enquiry.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
            
        const total = await Enquiry.countDocuments(filter);
        
        return res.status(200).json({
            success: true,
            data: enquiries,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching enquiries',
            error: error.message
        });
    }
};

// Get enquiry by ID (admin access only)
export const getEnquiryById = async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: enquiry
        });
    } catch (error) {
        console.error(`Error fetching enquiry ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching enquiry',
            error: error.message
        });
    }
};

// Update enquiry status (admin access only)
export const updateEnquiryStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        // Validate status
        const validStatuses = ['new', 'reviewed', 'in-progress', 'resolved', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id, 
            { 
                status,
                notes: notes || undefined,
                ...(status === 'resolved' && {
                    'responseDetails.respondedBy': req.user._id,
                    'responseDetails.responseDate': new Date()
                })
            },
            { new: true }
        );
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Enquiry status updated successfully',
            data: enquiry
        });
    } catch (error) {
        console.error(`Error updating enquiry ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating enquiry',
            error: error.message
        });
    }
};

// Delete enquiry (admin access only)
export const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Enquiry deleted successfully'
        });
    } catch (error) {
        console.error(`Error deleting enquiry ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting enquiry',
            error: error.message
        });
    }
};

// export default { 
//     submitContactForm,
//     getAllEnquiries,
//     getEnquiryById,
//     updateEnquiryStatus,
//     deleteEnquiry,
//     replyToEnquiry
// };