/**
 * @file auth.controller.js
 * @description Authentication controller handling Google OAuth callback, multi-role email login, current session retrieval, and logout.
 * @architecture Mounted at `/auth` via `auth.routes.js`, issuing JWTs in HTTP-only cookies and resolving roles across Member, Admin, and CommunityAdmin collections.
 * @agent_note Persists coordinator identity to database and synchronizes JWT token and user profile via postMessage and localStorage.
 */
import jwt from "jsonwebtoken";
import Member from "../../models/member/memberModel.js";
import Admin from "../../models/admin/adminModel.js";
import bcrypt from "bcryptjs";
import CommunityAdmin from "../../models/community/communityAdmin.js";

const getJwtSecret = () =>
  process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "the_uniques_portal_jwt_secret_dev_key" : undefined);

const generateToken = (member, fallbackRole) => {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  const payload = {
    id: member._id || member.id,
    email: member.email,
    role: member.role || fallbackRole,
    batch: member.batch || null,
  };
  return jwt.sign(payload, secret, { expiresIn: "1d" });
};

/**
 * @desc    Handle Google OAuth callback, generate JWT, set auth cookie, and postMessage credentials to opener window
 * @route   GET /auth/google/callback
 * @access  Public
 * @returns {HTML} HTML script triggering window.postMessage with token, user, and role, then closing popup
 */
export const googleCallback = (req, res, _next) => {
  if (!req.user) {
    return res.status(400).send("Authentication failed. Please try again.");
  }

  const userRole = (req.user.role || "member").toLowerCase();
  const token = generateToken(req.user, userRole);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
  if (safeUser.password) delete safeUser.password;
  if (safeUser.__v !== undefined) delete safeUser.__v;

  const targetOrigin = process.env.FRONTEND_URL || process.env.CLIENT_URL || "";

  const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Successful</title>
      </head>
      <body>
        <script>
          (function() {
            if (window.opener) {
              const targetOrigin = "${targetOrigin}" || window.location.origin;
              window.opener.postMessage({
                token: "${token}",
                role: "${userRole}",
                user: ${JSON.stringify(safeUser)}
              }, targetOrigin);
              window.close();
            }
          })();
        </script>
        <p>Login successful! You can close this window.</p>
      </body>
    </html>
  `;
  return res.send(htmlResponse);
};

/**
 * @desc    Authenticate user against Member, Admin, or CommunityAdmin collections
 * @route   POST /auth/emaillogin
 * @access  Public
 * @returns {Object} JSON response with JWT token, role, and sanitized user profile
 */
export const emailLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = (email || "").toLowerCase().trim();
    let member = null;
    let role = "member";

    // 1. Try Member collection
    try {
      member = await Member.findOne({ email: normalizedEmail }).select("+password");
      if (member) {
        role = member.role || "member";
      }
    } catch (error) {
      console.error("Error loading Member model:", error);
    }

    // 2. Try Admin collection
    if (!member) {
      try {
        member = await Admin.findOne({ email: normalizedEmail }).select("+password");
        if (member) {
          role = member.role || "admin";
        }
      } catch (error) {
        console.error("Error loading Admin model:", error);
      }
    }

    // 3. Try CommunityAdmin collection (coordinators and community admins)
    if (!member) {
      try {
        member = await CommunityAdmin.findOne({ email: normalizedEmail }).select("+password");
        if (member) {
          role = member.role || "coordinator";
        }
      } catch (error) {
        console.error("Error loading CommunityAdmin model:", error);
      }
    }

    if (!member) {
      return res.status(401).json({ message: "Not a member, please contact tech team." });
    }

    // Check password based on model methods or bcrypt
    let isMatch = false;
    try {
      if (member.comparePassword) {
        isMatch = await member.comparePassword(password);
      } else if (member.password) {
        isMatch = await bcrypt.compare(password, member.password);
      } else {
        return res.status(401).json({ message: "Invalid password format for this account." });
      }
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Error verifying password" });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const memberObj = member.toObject ? member.toObject() : { ...member };
    delete memberObj.password;

    const token = generateToken(member, role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({
      message: "Logged in successfully.",
      token,
      role: member.role || role,
      member: memberObj,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Retrieve currently authenticated user payload from verified request
 * @route   GET /auth/get_user
 * @access  Private
 * @returns {Object} Authenticated user profile data
 */
export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
  if (safeUser.password) delete safeUser.password;
  if (safeUser.__v !== undefined) delete safeUser.__v;
  return res.status(200).json(safeUser);
};

/**
 * @desc    Clear authentication JWT cookie from browser and invalidate session
 * @route   POST /auth/logout
 * @access  Public
 * @returns {Object} JSON response confirming logout
 */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
