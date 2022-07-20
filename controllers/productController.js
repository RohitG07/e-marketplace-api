const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");
const path = require("path");

// GET ALL PRODUCTS
async function getAllProducts(req, res) {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, length: products.length });
}

// GET SINGLE PRODUCT
async function getSingleProduct(req, res) {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
}

// CREATE SINGLE PRODUCT
async function createProduct(req, res) {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
}

// UPDATE SINGLE PRODUCT
async function updateProduct(req, res) {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
}

// DELETE SINGLE PRODUCT
async function deleteProduct(req, res) {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Successfully deleted product" });
}

// UPLOAD PRODUCT IMAGE
async function uploadImage(req, res) {
  if (!req.files) {
    throw new BadRequestError("No file found");
  }

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Only images are allowed");
  }

  const maxSize = 1024 * 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError("Max Size limit is 10MB");
  }

  const imgPath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imgPath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
}

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
};
