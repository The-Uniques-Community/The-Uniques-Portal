import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  // Get the token from cookies
  const token = req.cookies.token; // Make sure 'cookie-parser' middleware is used
  console.log("Token from cookies:", token);
  console.log(req.cookies)
  
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
