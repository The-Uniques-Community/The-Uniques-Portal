/**
 * @file verifySelfOrAdmin.js
 * @description Authorization guard verifying that the authenticated user owns the target
 * entity matching req.params[paramKey] or has administrative privileges.
 * @param {string} [paramKey='id'] - The route parameter containing the target user ID
 */
export const verifySelfOrAdmin = (paramKey = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const targetId = req.params[paramKey];
    const currentUserId = req.user._id || req.user.id;
    const currentUserRole = (req.user.role || "").toLowerCase();

    const isSelf = Boolean(
      currentUserId && targetId && currentUserId.toString() === targetId.toString()
    );
    const isAdmin = currentUserRole === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: You can only view or modify your own profile.",
      });
    }

    next();
  };
};

export default verifySelfOrAdmin;
