/**
 * @file leaveEmailService.js
 * @description Provides automated email notification services for member leave applications, approvals, and rejections.
 * @architecture Invoked by leave controllers to dispatch transactional HTML email notifications via Nodemailer transporter.
 * @agent_note Queries Member model for admin and coordinator email addresses; handles excluded recipients on approval/rejection.
 */

import transporter from "../config/emailConfig.js";
import Member from "../models/member/memberModel.js";

/**
 * @desc    Fetches email addresses for all members with admin or coordinator roles.
 * @returns {Promise<string[]>} Array of admin and coordinator email addresses.
 */
// Helper function to get all admin and coordinator emails
const getAdminAndCoordinatorEmails = async () => {
  try {
    const admins = await Member.find({ role: "admin" }, { email: 1 }).exec();
    const coordinators = await Member.find({ role: "coordinator" }, { email: 1 }).exec();
    
    const emails = [
      ...admins.map(admin => admin.email),
      ...coordinators.map(coord => coord.email)
    ];
    
    return emails;
  } catch (error) {
    console.error("Error fetching admin and coordinator emails:", error);
    return [];
  }
};

/**
 * @desc    Fetches admin and coordinator email addresses excluding a specific recipient.
 * @param   {string} excludeEmail - Email address to exclude from the results.
 * @returns {Promise<string[]>} Filtered array of admin and coordinator email addresses.
 */
// Helper function to get admin and coordinator emails excluding a specific person
const getAdminAndCoordinatorEmailsExcluding = async (excludeEmail) => {
  try {
    const admins = await Member.find({ role: "admin" }, { email: 1 }).exec();
    const coordinators = await Member.find({ role: "coordinator" }, { email: 1 }).exec();
    
    const emails = [
      ...admins.map(admin => admin.email),
      ...coordinators.map(coord => coord.email)
    ];
    
    // Filter out the excluded email
    return emails.filter(email => email !== excludeEmail);
  } catch (error) {
    console.error("Error fetching admin and coordinator emails:", error);
    return [];
  }
};

/**
 * @desc    Sends leave submission notification emails to all admins and coordinators.
 * @param   {Object} leave - Leave application details.
 * @param   {string} leave.memberName - Name of the applying member.
 * @param   {string} leave.memberEmail - Email of the applying member.
 * @param   {string} [leave.memberPhone] - Contact phone number of the applying member.
 * @param   {string} leave.type - Leave category/type.
 * @param   {Date|string} leave.startDate - Starting date of the leave.
 * @param   {Date|string} leave.endDate - Ending date of the leave.
 * @param   {number} leave.days - Duration of leave in days.
 * @param   {Date|string} leave.appliedDate - Date application was submitted.
 * @param   {string} leave.reason - Justification or reason for leave.
 * @returns {Promise<{success: boolean, error?: string}>} Outcome of email dispatch.
 */
// Send email to admin and coordinator when leave is submitted
export const sendLeaveSubmissionNotification = async (leave) => {
  try {
    const adminCoordEmails = await getAdminAndCoordinatorEmails();
    
    if (adminCoordEmails.length === 0) {
      console.warn("No admin or coordinator emails found for leave submission notification");
      return { success: false, error: "No admin/coordinator emails found" };
    }

    const leaveStartDate = new Date(leave.startDate).toLocaleDateString();
    const leaveEndDate = new Date(leave.endDate).toLocaleDateString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminCoordEmails.join(","),
      subject: `New Leave Request - ${leave.memberName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; border-bottom: 3px solid #4CAF50; padding-bottom: 15px;">New Leave Request Submitted</h2>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Member Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333; width: 30%;">Name:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.memberName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Email:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.memberEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Phone:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.memberPhone || "N/A"}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Leave Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333; width: 30%;">Leave Type:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.type}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Start Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveStartDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">End Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveEndDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Number of Days:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.days}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Applied On:</td>
                  <td style="padding: 10px 0; color: #666;">${new Date(leave.appliedDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Reason</h3>
              <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #4CAF50; border-radius: 4px; color: #666;">
                ${leave.reason}
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #FFF3CD; border-left: 4px solid #FFC107; border-radius: 4px;">
              <p style="color: #856404; margin: 0;">
                <strong>Action Required:</strong> Please review this leave request and approve or reject it.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This email was sent by The Uniques Community Leave Management System. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending leave submission notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * @desc    Sends leave approval notification to the applicant member and other admins/coordinators.
 * @param   {Object} leave - Approved leave application details.
 * @param   {string} leave.memberName - Name of the applying member.
 * @param   {string} leave.memberEmail - Email of the applying member.
 * @param   {string} leave.type - Leave category/type.
 * @param   {Date|string} leave.startDate - Starting date of the leave.
 * @param   {Date|string} leave.endDate - Ending date of the leave.
 * @param   {number} leave.days - Duration of leave in days.
 * @param   {string} leave.approvedBy - Name/identifier of the approving authority.
 * @param   {Date|string} leave.approvedDate - Date when leave was approved.
 * @param   {string} leave.reason - Original justification for leave.
 * @param   {string} approverEmail - Email of the approving admin/coordinator (excluded from cc).
 * @returns {Promise<{success: boolean, error?: string}>} Outcome of email dispatch.
 */
// Send email to member when leave is approved
export const sendLeaveApprovalNotification = async (leave, approverEmail) => {
  try {
    // Get all admin and coordinator emails except the approver
    const adminCoordEmails = await getAdminAndCoordinatorEmailsExcluding(approverEmail);
    
    // Include member email and other admins/coordinators (excluding approver)
    const recipientEmails = [leave.memberEmail, ...adminCoordEmails];

    const leaveStartDate = new Date(leave.startDate).toLocaleDateString();
    const leaveEndDate = new Date(leave.endDate).toLocaleDateString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails.join(","),
      subject: `Leave Request Approved - ${leave.memberName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745; margin-top: 0; border-bottom: 3px solid #28a745; padding-bottom: 15px;">✓ Leave Request Approved</h2>
            
            <div style="margin: 25px 0;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                Dear <strong>${leave.memberName}</strong>,
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Your leave request has been <strong>approved</strong> by ${leave.approvedBy}.
              </p>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Leave Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333; width: 30%;">Leave Type:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.type}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Start Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveStartDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">End Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveEndDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Number of Days:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.days}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Approved By:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.approvedBy}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Approved On:</td>
                  <td style="padding: 10px 0; color: #666;">${new Date(leave.approvedDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Reason</h3>
              <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #28a745; border-radius: 4px; color: #666;">
                ${leave.reason}
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #D4EDDA; border-left: 4px solid #28a745; border-radius: 4px;">
              <p style="color: #155724; margin: 0;">
                <strong>Status:</strong> Your leave has been approved and recorded in the system. Enjoy your leave!
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This email was sent by The Uniques Community Leave Management System. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending leave approval notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * @desc    Sends leave rejection notification to the applicant member and other admins/coordinators.
 * @param   {Object} leave - Rejected leave application details.
 * @param   {string} leave.memberName - Name of the applying member.
 * @param   {string} leave.memberEmail - Email of the applying member.
 * @param   {string} leave.type - Leave category/type.
 * @param   {Date|string} leave.startDate - Starting date of the leave.
 * @param   {Date|string} leave.endDate - Ending date of the leave.
 * @param   {number} leave.days - Duration of leave in days.
 * @param   {string} leave.rejectedBy - Name/identifier of the rejecting authority.
 * @param   {Date|string} leave.rejectedDate - Date when leave was rejected.
 * @param   {string} leave.rejectionReason - Detailed reason for rejection.
 * @param   {string} leave.reason - Original justification for leave.
 * @param   {string} rejectorEmail - Email of the rejecting admin/coordinator (excluded from cc).
 * @returns {Promise<{success: boolean, error?: string}>} Outcome of email dispatch.
 */
// Send email to member when leave is rejected
export const sendLeaveRejectionNotification = async (leave, rejectorEmail) => {
  try {
    // Get all admin and coordinator emails except the rejector
    const adminCoordEmails = await getAdminAndCoordinatorEmailsExcluding(rejectorEmail);
    
    // Include member email and other admins/coordinators (excluding rejector)
    const recipientEmails = [leave.memberEmail, ...adminCoordEmails];

    const leaveStartDate = new Date(leave.startDate).toLocaleDateString();
    const leaveEndDate = new Date(leave.endDate).toLocaleDateString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails.join(","),
      subject: `Leave Request Rejected - ${leave.memberName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #dc3545; margin-top: 0; border-bottom: 3px solid #dc3545; padding-bottom: 15px;">✕ Leave Request Rejected</h2>
            
            <div style="margin: 25px 0;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                Dear <strong>${leave.memberName}</strong>,
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Unfortunately, your leave request has been <strong>rejected</strong> by ${leave.rejectedBy}.
              </p>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Leave Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333; width: 30%;">Leave Type:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.type}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Start Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveStartDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">End Date:</td>
                  <td style="padding: 10px 0; color: #666;">${leaveEndDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Number of Days:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.days}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Rejected By:</td>
                  <td style="padding: 10px 0; color: #666;">${leave.rejectedBy}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #333;">Rejected On:</td>
                  <td style="padding: 10px 0; color: #666;">${new Date(leave.rejectedDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Rejection Reason</h3>
              <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #dc3545; border-radius: 4px; color: #666;">
                ${leave.rejectionReason}
              </div>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #555; margin-bottom: 15px;">Original Reason</h3>
              <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #6c757d; border-radius: 4px; color: #666;">
                ${leave.reason}
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #F8D7DA; border-left: 4px solid #dc3545; border-radius: 4px;">
              <p style="color: #721c24; margin: 0;">
                <strong>Status:</strong> Your leave request has been rejected. You may resubmit your request or contact the admin/coordinator for more information.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This email was sent by The Uniques Community Leave Management System. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending leave rejection notification:", error);
    return { success: false, error: error.message };
  }
};
