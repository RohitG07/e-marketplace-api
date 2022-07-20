const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const UnauthenticatedError = require("../errors/unauthenticated");
const BadRequestError = require("../errors/bad-request");
const { addCookieToResponse } = require("../utils/jwt");
const checkPermissions = require("../utils/checkPermissions");

// GET ALL USERS - ADMIN ROUTE
async function getAllUsers(req, res) {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
}

// GET SINGLE USER
async function getSingleUser(req, res) {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError("No user found");
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
}

// GET CURRENT USER
async function showCurrentUser(req, res) {
  res.status(StatusCodes.OK).json({ user: req.user });
}

// UPDATE USER INFO
async function updateUser(req, res) {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();

  const payload = {
    name: user.name,
    role: user.role,
    userId: user._id
  };
  addCookieToResponse(res, payload);
  res.status(StatusCodes.OK).json({ user: payload });
}

// UPDATE USER PASSWORD
async function updateUserPassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isCorrectPassword = await user.checkPassword(oldPassword);
  if (!isCorrectPassword) {
    throw new UnauthenticatedError("Invalid Password");
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Successfully updated!" });
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
};
