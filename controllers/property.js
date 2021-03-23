const getEmptyKeys = require("../Helpers/getEmptyKeys");
const devError = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const User = require("../models/user");

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

const getPropertyInfo = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) return generateMessage("Id không hợp lệ");
    const property = await Property.findOne({
      _id: id,
      isActive: true,
    }).populate("listOfReservation reviews");
    if (!property) return generateMessage("Property không tồn tại", res);
    let propertyOwner = await User.findOne({
      _id: property.owner,
      isActive: true,
    });
    if (!propertyOwner) return generateMessage("Owner no longer exists");
    propertyOwner = propertyOwner.toJSON();
    delete propertyOwner.wishList;
    delete propertyOwner.bookedList;
    delete propertyOwner.hostedList;
    delete propertyOwner.role;
    delete propertyOwner.createdAt;
    delete propertyOwner.updatedAt;
    delete propertyOwner.description;
    delete propertyOwner.password;
    delete propertyOwner.group;
    return res.send({
      ...property._doc,
      owner: propertyOwner,
    });
  } catch (error) {}
};

const updateProperty = async (req, res) => {};

const deleteProperty = async (req, res) => {};

const getListProperty = async (req, res) => {};

module.exports = {
  createRentalProperty,
  getPropertyInfo,
  updateProperty,
  deleteProperty,
  getListProperty,
};
