
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Authentication must run before role authorization.
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check whether the user's role is allowed.
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      // User has the required permission.
      return next();

    } catch (error) {
      console.error("Authorization error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

export default authorizeRoles;
