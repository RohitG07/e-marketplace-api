const Order = require("../models/Order");
const Product = require("../models/Product");

const checkPermissions = require("../utils/checkPermissions");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");

async function fakeStripeAPI({ amount, currency }) {
  const client_secret = "fromStripe";
  return { client_secret, amount };
}

// GET ALL ORDERS
async function getAllOrders(req, res) {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, length: orders.length });
}

// GET SINGLE ORDER
async function getSingleOrder(req, res) {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
}

// GET CURRENT USER ORDERS
async function getCurrentUserOrders(req, res) {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, length: orders.length });
}

// CREATE SINGLE ORDER
async function createOrder(req, res) {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || !cartItems.length) {
    throw new BadRequestError("No items in cart");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    };
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }

  const total = tax + shippingFee + subtotal;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "USD"
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
}

// UPDATE SINGLE ORDER
async function updateOrder(req, res) {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
};
