const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const { Property } = require("../models/property");
const Review = require("../models/review");
const User = require("../models/user");

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
      .select("rating owner")
      .populate({
        path: "rating.reviews",
        match: { isActive: true },
        select: "rating reviewer",
      })
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("This property does not exist.", res);
    if (
      (comment && typeof comment !== "string") ||
      !isKeysTypeCorrect("number", {
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn,
      })
    )
      return generateMessage("Invalid key type", res);

    const isReviewed = foundedProperty.rating.reviews.filter(
      (item) => item.reviewer.toString() === req.user._id
    );
    if (isReviewed.length > 0)
      return generateMessage("You have already reviewed this property.", res);

    const newReview = new Review({
      reviewer: req.user._id,
      property: propertyId,
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
    const foundedUser = await User.findOne({
      username: foundedProperty.owner.username,
    }).select("group reviews");
    foundedUser.reviews.push(result._id);
    await foundedUser.save();

    await result
      .populate("reviewer", "username name email avatar -_id")
      .execPopulate();
    foundedProperty.depopulate("rating.reviews");
    foundedProperty.rating.reviews.push(result._id);

    foundedProperty.rating.totalReviews = foundedProperty.rating.reviews.length;
    await foundedProperty.populate("rating.reviews").execPopulate();
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

const updateReview = async (req, res) => {
  const {
    reviewId,
    comment,
    cleanliness,
    accuracy,
    communication,
    location,
    checkIn,
  } = req.body;
  try {
    if (!reviewId) return generateMessage("Review id is required", res);
    if (
      (comment && typeof comment !== "string") ||
      !isKeysTypeCorrect("number", {
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn,
      })
    )
      return generateMessage("Invalid key type", res);
    const foundedReview = await Review.findOne({
      _id: reviewId,
      isActive: true,
    }).populate("reviewer", "name email username -_id");
    if (!foundedReview) return generateMessage("Cannot find this review.", res);
    if (req.user.username !== foundedReview.reviewer.username)
      return generateMessage("You are not authorized.", res);

    foundedReview.rating.cleanliness =
      cleanliness ?? foundedReview.rating.cleanliness;
    foundedReview.rating.accuracy = accuracy ?? foundedReview.rating.accuracy;
    foundedReview.rating.communication =
      communication ?? foundedReview.rating.communication;
    foundedReview.rating.location = location ?? foundedReview.rating.location;
    foundedReview.rating.checkIn = checkIn ?? foundedReview.rating.checkIn;
    foundedReview.comment = comment || foundedReview.comment;
    const result = await foundedReview.save();

    const foundedProperty = await Property.findOne({
      _id: foundedReview.property,
    })
      .select("rating")
      .populate({
        path: "rating.reviews",
        match: { isActive: true },
        select: "rating",
      });

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

const deleteReview = async (req, res) => {
  const { reviewId } = req.query;
  try {
    if (!reviewId) return generateMessage("Review id is required", res);
    const foundedReview = await Review.findOne({
      _id: reviewId,
      isActive: true,
    }).populate("reviewer", "name email username -_id");
    if (!foundedReview) return generateMessage("Cannot find this review.", res);
    if (req.user.username !== foundedReview.reviewer.username)
      return generateMessage("You are not authorized.", res);
    foundedReview.isActive = false;
    await foundedReview.save();

    const foundedProperty = await Property.findOne({
      _id: foundedReview.property,
    })
      .select("rating")
      .populate({
        path: "rating.reviews",
        match: { isActive: true },
        select: "rating",
      });
    foundedProperty.rating.totalReviews = foundedProperty.rating.reviews.length;
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
    if (foundedProperty.rating.totalReviews !== 0) {
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
    }

    foundedProperty.rating.scores = scores;
    await foundedProperty.save();
    res.send({ message: "Deleted successfully." });
  } catch (error) {
    devError(error, res);
  }
};

module.exports = {
  createPropertyReview,
  updateReview,
  deleteReview,
};
