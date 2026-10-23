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
import User from "../../models/user/userModel.js";
import mongoose from "mongoose";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  console.warn(
    "[Security Warning] JWT_SECRET environment variable is missing. Using fallback secret. Please configure JWT_SECRET in production!"
  );
  return "the_uniques_portal_jwt_secret_dev_key";
};

const generateToken = (member, fallbackRole) => {
  const secret = getJwtSecret();
  const payload = {
    id: member._id ? member._id.toString() : (member.id ? member.id.toString() : ""),
    email: member.email,
    role: member.role || fallbackRole,
    batch: member.batch || null,
  };
  return jwt.sign(payload, secret, { expiresIn: "1d" });
};

/**
 * Normalizes user documents from raw collections so profilePic, avatarUrl, and fullName are guaranteed.
 * @param {Object} raw - Plain user document from MongoDB collection
 * @returns {Object} Normalized user document
 */
export const normalizeUserProfilePic = (raw) => {
  if (!raw) return raw;
  if (raw.name && !raw.fullName) {
    raw.fullName = raw.name;
  }
  if (typeof raw.profilePic === "string" && raw.profilePic.trim()) {
    const url = raw.profilePic.trim();
    raw.avatarUrl = raw.avatarUrl || url;
    raw.profilePic = {
      fileId: url,
      fileUrl: url,
      url: url,
      fileName: "profile_pic",
    };
  } else if (
    raw.profilePic &&
    typeof raw.profilePic === "object" &&
    !(raw.profilePic.fileUrl || raw.profilePic.url || raw.profilePic.fileId)
  ) {
    const fileIdStr = raw.profilePic._id
      ? raw.profilePic._id.toString()
      : raw.profilePic.toString();
    raw.profilePic = {
      fileId: fileIdStr,
      fileUrl: "",
      url: "",
      fileName: "profile_pic",
    };
  } else if (
    (!raw.profilePic || !raw.profilePic.fileUrl) &&
    raw.avatarUrl &&
    typeof raw.avatarUrl === "string"
  ) {
    const url = raw.avatarUrl.trim();
    raw.profilePic = {
      fileId: url,
      fileUrl: url,
      url: url,
      fileName: "avatar",
    };
  }

  if (raw.profilePic && typeof raw.profilePic === "object") {
    if (raw.profilePic.fileUrl && !raw.profilePic.url) {
      raw.profilePic.url = raw.profilePic.fileUrl;
    } else if (raw.profilePic.url && !raw.profilePic.fileUrl) {
      raw.profilePic.fileUrl = raw.profilePic.url;
    }
    if (!raw.avatarUrl && (raw.profilePic.fileUrl || raw.profilePic.url)) {
      raw.avatarUrl = raw.profilePic.fileUrl || raw.profilePic.url;
    }
  }
  return raw;
};

/**
 * Robust multi-collection user lookup helper resolving identity by ObjectId or string ID.
 * @param {string|mongoose.Types.ObjectId} userId - ID of user document
 * @returns {Promise<Object|null>} Fully hydrated and normalized user document
 */
export const findUserById = async (userId) => {
  if (!userId) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(userId);
  const objectId = isObjectId ? new mongoose.Types.ObjectId(userId) : null;
  const idQuery = objectId
    ? { $or: [{ _id: objectId }, { _id: userId.toString() }] }
    : { _id: userId };

  // 1. Try canonical User model
  if (User) {
    try {
      const user = await User.findOne(idQuery).select("-password");
      if (user) return user;
    } catch (_err) {}
  }

  // 2. Try Member model
  try {
    const member = await Member.findOne(idQuery).select("-password");
    if (member) return member;
  } catch (_err) {}

  // 3. Try Admin model
  try {
    const admin = await Admin.findOne(idQuery).select("-password");
    if (admin) return admin;
  } catch (_err) {}

  // 4. Try CommunityAdmin model
  try {
    const commAdmin = await CommunityAdmin.findOne(idQuery).select("-password");
    if (commAdmin) return commAdmin;
  } catch (_err) {}

  // 5. Direct raw collection fallbacks for split-state or unmigrated databases
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    for (const collName of ["users", "members", "admins", "communityadmins"]) {
      try {
        const raw = await mongoose.connection.db.collection(collName).findOne(idQuery);
        if (raw) {
          delete raw.password;
          return normalizeUserProfilePic(raw);
        }
      } catch (_e) {}
    }
  }

  return null;
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

  const targetOrigin = process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://the-uniques-portal.vercel.app";

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
              const configuredTarget = "${targetOrigin}";
              const target = configuredTarget || window.location.origin;
              try {
                window.opener.postMessage({
                  token: "${token}",
                  role: "${userRole}",
                  user: ${JSON.stringify(safeUser)}
                }, target);
              } catch (e) {
                // Fallback to wildcard if origin handshake fails across preview domains
                window.opener.postMessage({
                  token: "${token}",
                  role: "${userRole}",
                  user: ${JSON.stringify(safeUser)}
                }, "*");
              }
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

    // 4. Fallback to direct legacy collection queries if unified model returned null (e.g. pre-migration or split-state)
    if (!member && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

      // Check legacy 'members' collection
      try {
        const rawMember = await mongoose.connection.db.collection("members").findOne({ email: emailRegex });
        if (rawMember) {
          member = normalizeUserProfilePic(rawMember);
          role = rawMember.role || "member";
        }
      } catch (err) {
        console.error("Error querying legacy members collection:", err.message);
      }

      // Check legacy 'admins' collection
      if (!member) {
        try {
          const rawAdmin = await mongoose.connection.db.collection("admins").findOne({ email: emailRegex });
          if (rawAdmin) {
            member = normalizeUserProfilePic(rawAdmin);
            role = rawAdmin.role || "admin";
          }
        } catch (err) {
          console.error("Error querying legacy admins collection:", err.message);
        }
      }

      // Check legacy 'communityadmins' collection
      if (!member) {
        try {
          const rawCommAdmin = await mongoose.connection.db.collection("communityadmins").findOne({ email: emailRegex });
          if (rawCommAdmin) {
            member = normalizeUserProfilePic(rawCommAdmin);
            role = rawCommAdmin.role || "coordinator";
          }
        } catch (err) {
          console.error("Error querying legacy communityadmins collection:", err.message);
        }
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
    if (memberObj.__v !== undefined) delete memberObj.__v;

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
export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const userId = req.user.id || req.user._id;
    const fullUser = await findUserById(userId);
    if (!fullUser) {
      const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
      if (safeUser.password) delete safeUser.password;
      if (safeUser.__v !== undefined) delete safeUser.__v;
      return res.status(200).json(safeUser);
    }
    const safeUser = fullUser.toObject ? fullUser.toObject() : { ...fullUser };
    if (safeUser.password) delete safeUser.password;
    if (safeUser.__v !== undefined) delete safeUser.__v;
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
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
