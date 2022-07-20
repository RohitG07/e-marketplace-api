const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authentication");

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.post("/", authenticateUser, createReview);
router.get("/:id", getSingleReview);
router.patch("/:id", authenticateUser, updateReview);
router.delete("/:id", authenticateUser, deleteReview);

module.exports = router;
