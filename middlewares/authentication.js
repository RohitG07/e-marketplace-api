const { checkTokenValidity } = require("../utils/jwt");
const UnauthenticatedError = require("../errors/unauthenticated");
const UnauthorizedError = require("../errors/unauthorized");

async function authenticateUser(req, res, next) {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError("Invalid Authentication");
  }

  try {
    const { name, userId, role } = checkTokenValidity(token);
    req.user = { name, userId, role };
    next();
  } catch (err) {
    throw new UnauthenticatedError("Invalid Authentication");
  }
}

function authorizePermissions(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Access Denied!");
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizePermissions
};
