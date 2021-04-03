const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const Review = require("../models/review");

const createPropertyReview = async (req, res) => {
  const {
    propertyId,
    cleanliness,
    accuracy,
    communication,
    location,
    checkIn,
    comment,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("rating")
      .populate({
        path: "rating.reviews",
        match: { isActive: true },
        select: "rating",
      });
    if (!foundedProperty)
      return generateMessage("This property does not exist.", res);
    if (comment && typeof comment !== "string")
      return generateMessage("Invalid key type", res);
    const newReview = new Review({
      reviewer: req.user._id,
      rating: {
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn,
      },
      comment,
    });
    const result = await newReview.save();
    req.user.reviews.push(result._id);
    await result
      .populate("reviewer", "username name email avatar -_id")
      .execPopulate();
    await req.user.save();
    foundedProperty.rating.reviews.push(result._id);
    foundedProperty.ratting.totalReviews += 1;

    const scores = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkIn: 0,
      final: 0,
    };

    foundedProperty.rating.reviews.forEach((review) => {
      scores.cleanliness += review.rating.cleanliness;
      scores.accuracy += review.rating.accuracy;
      scores.communication += review.rating.communication;
      scores.location += review.rating.location;
      scores.checkIn += review.rating.checkIn;
    });

    scores.cleanliness /= foundedProperty.rating.totalReviews;
    scores.accuracy /= foundedProperty.rating.totalReviews;
    scores.communication /= foundedProperty.rating.totalReviews;
    scores.location /= foundedProperty.rating.totalReviews;
    scores.checkIn /= foundedProperty.rating.totalReviews;
    scores.final =
      (scores.cleanliness +
        scores.accuracy +
        scores.communication +
        scores.location +
        scores.checkIn) /
      5;

    foundedProperty.rating.scores = scores;
    await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const getReviewDetails = async (req, res) => {
  const { reviewId } = req.query;
  try {
    if (!reviewId) return generateMessage("Review id is required", res);
    const foundedReview = await Review.findOne({
      _id: reviewId,
      isActive: true,
    }).populate("reviewer", "username name email avatar");
    if (!foundedReview) return generateMessage("Cannot find this review.", res);
    res.send(foundedReview);
  } catch (error) {
    devError(error, res);
  }
};

const updateReview = async (req, res) => {};

const deleteReview = async (req, res) => {};

module.exports = { createPropertyReview };
