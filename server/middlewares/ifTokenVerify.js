/**
 * @file ifTokenVerify.js
 * @description Optional authentication middleware. Extracts JWT token from cookies or
 * Authorization headers. If valid, attaches normalized req.user. If absent or invalid,
 * safely allows execution to continue as guest (req.user = null).
 */
import jwt from "jsonwebtoken";
const ifTokenVerify = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || "the_uniques_portal_jwt_secret_dev_key";
  
  // Extract token from cookies, Authorization header, or token header
  let token = req.cookies?.token;

  if (!token && req.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  if (!token && req.headers?.token) {
    token = req.headers.token;
  }

  // If no token provided, proceed as unauthenticated guest
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // In optional auth, treat invalid or expired tokens as guest traffic
      req.user = null;
      return next();
    }

    req.user = {
      ...decoded,
      id: decoded.id || decoded._id || decoded.userId || decoded.sub || null,
      _id: decoded._id || decoded.id || decoded.userId || decoded.sub || null,
    };
    return next();
  });
};

export default ifTokenVerify;
