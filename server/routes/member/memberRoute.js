import express from 'express';

import { register, login, logout, editProfile, getProfile, uploadDummyMembers,updateAchievements,
  updateCertifications,
  updateProjects,
  updateInternships,
  updateEvents,
  updateAcademics,
  } from '../../controller/member/memberController.js';
import { updateMemberFines } from '../../controller/member/members.js';
const memberRoute = express.Router()
// Configure Multer for temporary file storage
import Member from '../../models/member/memberModel.js';
import verifyToken from '../../middlewares/verifyToken.js';
memberRoute.post('/register', register);
memberRoute.post('/login', login);
memberRoute.post('/logout', logout);
memberRoute.put('/members/:id/editProfile',  editProfile);
memberRoute.get('/getProfile', verifyToken, getProfile);
memberRoute.post('/bulk-upload', uploadDummyMembers)


// CRUD routes for achievements, certifications, projects, internships, events, and academics
memberRoute.put("/members/:id/achievements", updateAchievements);
memberRoute.put("/members/:id/certifications", updateCertifications);
memberRoute.put("/members/:id/projects",  updateProjects);
memberRoute.put("/members/:id/internships",  updateInternships);
memberRoute.put("/members/:id/events",  updateEvents);
memberRoute.put("/members/:id/academics",  updateAcademics);

// memberRoute.put("/members/:id/bio",  async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { bio } = req.body;

//     const member = await Member.findByIdAndUpdate(id, { bio }, { new: true });

//     if (!member) {
//       return res.status(404).json({ message: "Member not found" });
//     }
//     res.status(200).json({ message: "Bio updated successfully", bio: member.bio });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update bio", error: error.message });
//   }
// });

// memberRoute.put("/members/:id/skills",  async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { skills } = req.body;

//     const member = await Member.findByIdAndUpdate(id, { skills }, { new: true });

//     if (!member) {
//       return res.status(404).json({ message: "Member not found" });
//     }
//     res.status(200).json({ message: "Skills updated successfully", skills: member.skills });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update skills", error: error.message });
//   }
// });


memberRoute.post("/update-fine-data", async (req, res) => {
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