const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please enter rating"]
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please enter review title"],
      maxlength: 50
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Please enter review comment"]
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true
    }
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgRating = async function (productId) {
  const res = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(res[0]?.averageRating || 0),
        numOfReviews: res[0]?.numOfReviews || 0
      }
    );
  } catch (err) {
    console.log(err);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAvgRating(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAvgRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
