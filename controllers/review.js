const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");

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
      .select("owner rating")
      .populate({ path: "owner", select: "username" })
      .populate({ path: "rating.reviews", match: { isActive: true } });
    if (!foundedProperty)
      return generateMessage("This property does not exist.", res);

    // push review vào list review của proprety, push review mới vào list review của người review. Tính tổng điểm và lưu lại vào property
  } catch (error) {
    devError(error, res);
  }
};

const getReviewDetails = async (req, res) => {};

const updateReview = async (req, res) => {};

const deleteReview = async (req, res) => {};

module.exports = {};
