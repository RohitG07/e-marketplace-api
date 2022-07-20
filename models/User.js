const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter username"],
    minlength: 3,
    maxlength: 100
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter email"],
    validate: {
      validator: validator.isEmail,
      message: "Invalid Email"
    }
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: 8
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.checkPassword = async function (curPassword) {
  const isCorrectPassword = await bcrypt.compare(curPassword, this.password);
  return isCorrectPassword;
};

module.exports = mongoose.model("User", UserSchema);
