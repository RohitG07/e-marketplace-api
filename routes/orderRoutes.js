const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions
} = require("../middlewares/authentication");

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
} = require("../controllers/orderController");

router.get("/", authenticateUser, authorizePermissions("admin"), getAllOrders);
router.post("/", authenticateUser, createOrder);
router.get("/showAllMyOrders", authenticateUser, getCurrentUserOrders);
router.get("/:id", authenticateUser, getSingleOrder);
router.patch("/:id", authenticateUser, updateOrder);

module.exports = router;
