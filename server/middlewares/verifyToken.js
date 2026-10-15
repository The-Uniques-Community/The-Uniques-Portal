import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

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

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
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
