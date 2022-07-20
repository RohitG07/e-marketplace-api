const jwt = require("jsonwebtoken");

function createJWTToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_LIFETIME
  });
}

function checkTokenValidity(token) {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

function addCookieToResponse(res, payload) {
  const token = createJWTToken(payload);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
    signed: true
  });
}

module.exports = { createJWTToken, checkTokenValidity, addCookieToResponse };
