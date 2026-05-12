// routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import { googleCallback, emailLogin, getCurrentUser , logout } from '../../controller/Authentication/auth.controller.js';
import verifyRole from '../../middlewares/verifyRole.js';
import verifyToken from '../../middlewares/verifyToken.js';


const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=not-member', session: false }),
  googleCallback
);

router.post('/emaillogin', emailLogin);
router.get('/get_user', getCurrentUser);

// Route to check if the user is authenticated and return user info
router.get("/verify_user", verifyToken, (req, res) => {
  res.status(200).json({ message: "Authenticated", user: req.user });
});

// Route to check if the user has a specific role
router.get("/verify_role", verifyToken, (req, res, next) => {
  const { role } = req.query; // Get role from query params

  if (!role) {
    return res.status(400).json({ error: "Role parameter is required" });
  }

  // Use the verifyRole middleware dynamically
  const roleMiddleware = verifyRole(role);
  roleMiddleware(req, res, () => {
    res.status(200).json({ message: "Authorized", user: req.user });
  });
});

router.post("/logout", logout);

export default router;
