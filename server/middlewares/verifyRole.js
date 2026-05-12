/**
 * Middleware to verify user role
 * @param {string|string[]} roles - Single role or array of roles that are allowed
 * @returns {Function} Express middleware function
 */
const verifyRole = (roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated. Please log in first." 
      });
    }

    // Convert single role to array for consistent handling
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Unauthorized: You need ${allowedRoles.length > 1 ? 'one of these roles' : 'the role'}: ${allowedRoles.join(', ')}` 
      });
    }
    
    // User is authorized, proceed
    req.user = req.user; // Attach decoded token (including role) to the request
    next();
  };
};

export default verifyRole;