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

    // Convert single role to array for consistent handling and make them lowercase
    const allowedRoles = (Array.isArray(roles) ? roles : [roles]).map(r => r.toLowerCase());
    
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    console.log(`Checking authorization. User role: ${userRole}, Allowed roles: ${allowedRoles}`);

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(userRole)) {
      console.log(`Authorization failed for user role: ${userRole}`);
      return res.status(403).json({ 
        success: false, 
        message: `Unauthorized: You need ${allowedRoles.length > 1 ? 'one of these roles' : 'the role'}: ${allowedRoles.join(', ')}` 
      });
    }
    
    // User is authorized, proceed
    next();
  };
};

export default verifyRole;