import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const ifTokenVerify = (req, res, next) => {
  // Get the token from cookies
  const token = req.cookies.token; // Make sure 'cookie-parser' middleware is used

  if (!token) {
    next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded; // Attach decoded token (including role) to the request
    next(); // Proceed to the next middleware/route handler
  });
};

export default ifTokenVerify;
