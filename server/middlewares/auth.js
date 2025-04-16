const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header or cookies
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: "Authentication invalid" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Authentication invalid" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "You are not authorized to access this route",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
