const UnauthorizedError = require("../errors/unauthorized");

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnauthorizedError("Access Denied!");
};

module.exports = checkPermissions;
