const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const UnauthenticatedError = require("../errors/unauthenticated");
const { addCookieToResponse } = require("../utils/jwt");

// SIGNUP USER
async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    throw new BadRequestError("Please provide all details");
  }

  const emailFound = await User.findOne({ email });
  if (emailFound) {
    throw new BadRequestError("Account already exists");
  }

  const firstAcc = (await User.countDocuments({})) === 0;
  const role = firstAcc ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const payload = {
    name: user.name,
    role: user.role,
    userId: user._id
  };

  addCookieToResponse(res, payload);
  res.status(StatusCodes.CREATED).json({ user: payload });
}

// LOGIN USER
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide all details");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Email");
  }

  const isCorrectPassword = await user.checkPassword(password);
  if (!isCorrectPassword) {
    throw new UnauthenticatedError("Invalid Password");
  }

  const payload = {
    name: user.name,
    role: user.role,
    userId: user._id
  };
  addCookieToResponse(res, payload);
  res.status(StatusCodes.OK).json({ user: payload });
}

// LOGOUT USER
async function logout(req, res) {
  res.cookie("token", "done", {
    httpOnly: true,
    expires: new Date(Date.now() + 500)
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out!" });
}

module.exports = { signup, login, logout };
