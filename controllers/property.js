const checkKeyValue = require("../Helpers/checkKeyValue");
const devError = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property, Rule, Require, Detail } = require("../models/property");
const User = require("../models/user");
const { Utility } = require("../models/utility");

const createRentalProperty = async (req, res) => {
  const {
    address,
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
    const emptyKeys = checkKeyValue({
      address,
      pricePerDay,
      title,
      description,
    });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} không được trống`, res);
    const newProperty = new Property({
      owner: req.user._id,
      address,
      pricePerDay,
      title,
      description,
      rentalType: rentalType || undefined,
      amountOfGuest: amountOfGuest || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      longitude: longitude || undefined,
      latitude: latitude || undefined,
      utilities: new Utility(),
      rules: new Rule(),
      requireForBooker: new Require(),
      moreDetails: new Detail(),
    });
    let result = await newProperty.save();
    const host = await User.findById(req.user._id);
    host.hostedList.push(result._id);
    await host.save();
    // result = result.toObject();
    // delete result.requireForBooker._id;
    // delete result.utilities._id;
    // delete result.rules._id;
    // delete result.moreDetails._id;
    result.owner = {
      username: host.username,
      email: host.email,
      name: host.name,
    };
    return res.send(result);
  } catch (error) {
    console.log(error);
    devError(error, res);
  }
};

module.exports = {
  createRentalProperty,
};
