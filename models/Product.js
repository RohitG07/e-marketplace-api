const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter product name"],
      maxlength: [75, "Name can not be more than 75 characters"]
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      default: 0
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please enter product description"],
      maxlength: [750, "Description can not be more than 750 characters"]
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg"
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
      enum: ["washroom", "office", "kitchen", "bedroom", "garage"]
    },
    company: {
      type: String,
      required: [true, "Please enter company name"],
      enum: {
        values: ["ikea", "liddy", "marcos", "bernhardt", "drexel"],
        message: "{VALUE} is not supported"
      }
    },
    colors: {
      type: [String],
      default: ["#000"],
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    inventory: {
      type: Number,
      required: true,
      default: 25
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numOfReviews: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false
});

// DELETE REVIEWS IF A PRODUCT IS DELETED
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
