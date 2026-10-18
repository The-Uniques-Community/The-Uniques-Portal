/**
 * @file memberRoute.js
 * @description Core member management router handling authentication, profile edits, career portfolios, and bulk imports.
 * @architecture Mounted at `/api/member` in server/index.js, routing member-specific registration, login, and portfolio updates.
 * @agent_note Profile updates (achievements, projects, certifications, etc.) receive `:id` param and modify subdocument arrays on the Member model.
 */
import express from 'express';
import {
  register,
  login,
  logout,
  editProfile,
  getProfile,
  uploadDummyMembers,
  updateAchievements,
  updateCertifications,
  updateProjects,
  updateInternships,
  updateEvents,
  updateAcademics,
} from '../../controller/member/memberController.js';
import { updateMemberFines } from '../../controller/member/members.js';
import Member from '../../models/member/memberModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';
import verifySelfOrAdmin from '../../middlewares/verifySelfOrAdmin.js';

const memberRoute = express.Router();

memberRoute.post('/register', register);
memberRoute.post('/login', login);
memberRoute.post('/logout', logout);

// Self-service member endpoints guarded by verifyToken and verifySelfOrAdmin
memberRoute.put('/members/:id/editProfile', verifyToken, verifySelfOrAdmin('id'), editProfile);
memberRoute.get('/getProfile', verifyToken, getProfile);
memberRoute.post('/bulk-upload', verifyToken, verifyRole(['admin']), uploadDummyMembers);

// CRUD routes for achievements, certifications, projects, internships, events, and academics
memberRoute.put("/members/:id/achievements", verifyToken, verifySelfOrAdmin('id'), updateAchievements);
memberRoute.put("/members/:id/certifications", verifyToken, verifySelfOrAdmin('id'), updateCertifications);
memberRoute.put("/members/:id/projects", verifyToken, verifySelfOrAdmin('id'), updateProjects);
memberRoute.put("/members/:id/internships", verifyToken, verifySelfOrAdmin('id'), updateInternships);
memberRoute.put("/members/:id/events", verifyToken, verifySelfOrAdmin('id'), updateEvents);
memberRoute.put("/members/:id/academics", verifyToken, verifySelfOrAdmin('id'), updateAcademics);

// Admin-only maintenance route
memberRoute.post("/update-fine-data", verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const result = await updateMemberFines(Member);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default memberRoute;