/**
 * @file verifyRole.js
 * @description Role-based access control (RBAC) middleware factory to authorize requests by user role.
 * @architecture Enforces authorization barriers across administrative, coordinator, or specific member route endpoints.
 * @agent_note Must be used after an authentication middleware (e.g. verifyToken or isAuthenticated) that populates req.user.
 */

/**
 * @desc Higher-order middleware factory that creates a role-checking guard matching req.user.role against permitted roles.
 * @param {string|string[]} roles - Single role string or array of allowed roles (e.g., 'admin', ['admin', 'coordinator'])
 * @returns {import('express').RequestHandler} Express middleware handler enforcing role permissions
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