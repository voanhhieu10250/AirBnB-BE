const getEmptyKeys = require("../Helpers/getEmptyKeys");
const devError = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");

const createRentalProperty = async (req, res) => {
  const {
    address,
    cityCode,
    rentalType,
    amountOfGuest,
    pricePerDay,
    bedrooms,
    bathrooms,
    title,
    description,
    longitude,
    latitude,
  } = req.body;

  try {
    const emptyKeys = getEmptyKeys({
      address,
      pricePerDay,
      title,
      description,
    });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} không được trống`, res);
    if (
      !isKeysTypeCorrect("string", {
        address,
        cityCode,
        rentalType,
        title,
        description,
      }) ||
      !isKeysTypeCorrect("number", {
        amountOfGuest,
        pricePerDay,
        bedrooms,
        bathrooms,
        longitude,
        latitude,
      })
    )
      return generateMessage("Dữ liệu không hợp lệ", res);
    const newProperty = new Property({
      owner: req.user._id,
      group: req.user.group,
      address,
      cityCode,
      pricePerDay,
      title,
      description,
      rentalType,
      amountOfGuest,
      bedrooms,
      bathrooms,
      coordinates: {
        longitude,
        latitude,
      },
    });
    let result = await newProperty.save();
    req.user.hostedList.push(result._id);
    await req.user.save();
    result = result.toJSON();
    return res.send({
      ...result,
      owner: {
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
      },
    });
  } catch (error) {
    devError(error, res);
  }
};

module.exports = {
  createRentalProperty,
};
