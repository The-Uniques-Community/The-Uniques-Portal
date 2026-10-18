/**
 * @file verifyToken.js
 * @description Primary JWT authentication middleware extracting tokens from cookies or headers and attaching the decoded user identity.
 * @architecture Frontline authentication barrier for protected API routes, normalizing user identifier fields on req.user.
 * @agent_note Extracts token from cookies ('token'), Authorization header ('Bearer <token>' or raw), or custom 'token' header. Normalizes both `req.user.id` and `req.user._id`.
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const getJwtSecret = () =>
  process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "the_uniques_portal_jwt_secret_dev_key" : undefined);

/**
 * @desc Validates JWT from cookie or request headers and populates req.user with normalized user identity.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware callback
 * @mutates {Object} req.user - Decoded payload with guaranteed id and _id fields
 */
const verifyToken = (req, res, next) => {
  // Get token from cookies, Authorization header, or token header
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  if (!token && req.headers.token) {
    token = req.headers.token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const secret = getJwtSecret();
  if (!secret) {
    console.error("JWT Verification Error: JWT_SECRET is not configured");
    return res.status(500).json({ error: 'Server authentication misconfigured' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log("Decoded Token Payload:", decoded);
    // Normalize common id fields so downstream controllers can rely on req.user.id
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id || decoded.userId || decoded.sub || null,
      _id: decoded._id || decoded.id || decoded.userId || decoded.sub || null,
    };
    next(); // Proceed to the next middleware/route handler
  });
};

export default verifyToken;
