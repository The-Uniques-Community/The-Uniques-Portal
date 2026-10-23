/**
 * @file auth.routes.js
 * @description Authentication router managing Google OAuth, email/password login, token verification, and role authorization checks.
 * @architecture Mounted at `/auth` in server/index.js, coordinating Passport OAuth workflows and JWT authentication endpoints.
 * @agent_note Handles both browser-based OAuth redirection flows and stateless API token verification endpoints (`/verify_user`, `/verify_role`).
 */
// routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import { googleCallback, emailLogin, getCurrentUser, logout, findUserById } from '../../controller/Authentication/auth.controller.js';
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
router.get('/get_user', verifyToken, getCurrentUser);

// Route to check if the user is authenticated and return user info
router.get("/verify_user", verifyToken, async (req, res) => {
  try {
    const fullUser = await findUserById(req.user.id || req.user._id);
    if (!fullUser) {
      return res.status(200).json({ message: "Authenticated", user: req.user });
    }
    const safeUser = fullUser.toObject ? fullUser.toObject() : { ...fullUser };
    if (safeUser.password) delete safeUser.password;
    if (safeUser.__v !== undefined) delete safeUser.__v;
    return res.status(200).json({ message: "Authenticated", user: safeUser });
  } catch (error) {
    console.error("Error in /auth/verify_user:", error);
    return res.status(200).json({ message: "Authenticated", user: req.user });
  }
});

// Route to check if the user has a specific role
router.get("/verify_role", verifyToken, (req, res, _next) => {
  const { role } = req.query; // Get role from query params

  if (!role) {
    return res.status(400).json({ error: "Role parameter is required" });
  }

  // Use the verifyRole middleware dynamically
  const roleMiddleware = verifyRole(role);
  roleMiddleware(req, res, async () => {
    try {
      const fullUser = await findUserById(req.user.id || req.user._id);
      const safeUser = fullUser
        ? (fullUser.toObject ? fullUser.toObject() : { ...fullUser })
        : req.user;
      if (safeUser.password) delete safeUser.password;
      if (safeUser.__v !== undefined) delete safeUser.__v;
      res.status(200).json({ message: "Authorized", user: safeUser });
    } catch (_err) {
      res.status(200).json({ message: "Authorized", user: req.user });
    }
  });
});

router.post("/logout", logout);

export default router;
