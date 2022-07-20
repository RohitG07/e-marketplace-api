const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions
} = require("../middlewares/authentication");
const { getSingleProductReviews } = require("../controllers/reviewController");

const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
} = require("../controllers/productController");

router.get("/", getAllProducts);

router.post(
  "/",
  [authenticateUser, authorizePermissions("admin")],
  createProduct
);

router.post(
  "/uploadImage",
  [authenticateUser, authorizePermissions("admin")],
  uploadImage
);

router.get("/:id", getSingleProduct);

router.patch(
  "/:id",
  [authenticateUser, authorizePermissions("admin")],
  updateProduct
);

router.delete(
  "/:id",
  [authenticateUser, authorizePermissions("admin")],
  deleteProduct
);

router.get("/:id/reviews", getSingleProductReviews);

module.exports = router;
