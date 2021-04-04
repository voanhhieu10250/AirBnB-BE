const mongoose = require("mongoose");
const moment = require("moment");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    rating: {
      cleanliness: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      checkIn: { type: Number, default: 0 },
    },
    comment: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
reviewSchema.methods.toJSON = function () {
  const review = this.toObject();
  delete review.isActive;
  delete review.property;
  review.createdAt = moment(review.createdAt).utc().format();
  review.updatedAt = moment(review.updatedAt).utc().format();
  return review;
};
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
