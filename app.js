const express = require("express");
const app = express();

require("dotenv").config();
require("express-async-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");

const authenticationRouter = require("./routes/authenticationRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

const { authenticateUser } = require("./middlewares/authentication");
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const connectDB = require("./db/connect");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    max: 60
  })
);
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/auth", authenticationRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", authenticateUser, userRouter);
app.use("/api/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
async function startServer() {
  try {
    await connectDB(process.env.MONGO_CONNECTION_URL);
    app.listen(port, () => {
      console.log("Server listening..");
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
