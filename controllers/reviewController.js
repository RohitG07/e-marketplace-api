const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const checkPermissions = require("../utils/checkPermissions");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");

// GET ALL REVIEWS
async function getAllReviews(req, res) {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price category"
  });
  res.status(StatusCodes.OK).json({ reviews, length: reviews.length });
}

// GET A SINGLE REVIEW
async function getSingleReview(req, res) {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
}

// CREATE REVIEW FOR A PRODUCT
async function createReview(req, res) {
  const { product: productId } = req.body;
  const productExist = await Product.findOne({ _id: productId });
  if (!productExist) {
    throw new NotFoundError(`No product found with id : ${productId}`);
  }

  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user.userId
  });
  if (alreadyReviewed) {
    throw new BadRequestError("Product already reviewed");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
}

// UPDATE SINGLE REVIEW
async function updateReview(req, res) {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
}

// DELETE SINGLE REVIEW
async function deleteReview(req, res) {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  checkPermissions(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Successfully deleted review!" });
}

// GET REVIEWS FOR SINGLE PRODUCT
async function getSingleProductReviews(req, res) {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, length: reviews.length });
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
};
