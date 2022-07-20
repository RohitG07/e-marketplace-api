const express = require("express");
const router = express.Router();

const { authorizePermissions } = require("../middlewares/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
} = require("../controllers/userController");

router.get("/", authorizePermissions("admin"), getAllUsers);
router.get("/showMe", showCurrentUser);
router.patch("/updateUser", updateUser);
router.patch("/updateUserPassword", updateUserPassword);
router.get("/:id", getSingleUser);

module.exports = router;
