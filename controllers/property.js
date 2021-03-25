const getEmptyKeys = require("../Helpers/getEmptyKeys");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const User = require("../models/user");
const isValidGroup = require("../Helpers/validateGroup");
const { devError } = require("../Helpers/devError");
const City = require("../models/city");

const getListRentalType = (req, res) => {
  res.send([
    {
      rentalType: "PrivateRoom",
      name: "Private room",
      desc:
        "Guests have their own private room for sleeping. Other areas could be shared.",
    },
    {
      rentalType: "EntirePlace",
      name: "Entire place",
      desc:
        " Guests have the whole place to themselves. This usually includes a bedroom, a bathroom, and a kitchen. Hosts should note in the description if they'll be on the property (ex: 'Host occupies first floor of the home')",
    },
    {
      rentalType: "SharedRoom",
      name: "Shared room",
      desc:
        "Guests sleep in a bedroom or a common area that could be shared with others.",
    },
  ]);
};

const createRentalProperty = async (req, res) => {
  const {
    address,
    cityCode,
    rentalType,
    amountOfGuest,
    pricePerDay,
    beds,
    bedrooms,
    bathrooms,
    title,
    description,
    longitude,
    latitude,
    group,
  } = req.body;

  try {
    const emptyKeys = getEmptyKeys({
      address,
      pricePerDay,
      title,
      cityCode,
      description,
      longitude,
      latitude,
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
        group,
      }) ||
      !isKeysTypeCorrect("number", {
        amountOfGuest,
        pricePerDay,
        bedrooms,
        bathrooms,
        longitude,
        latitude,
        beds,
      })
    )
      return generateMessage("Kiểu dữ liệu không hợp lệ", res);
    if (group && !isValidGroup(group))
      return generateMessage("Group không hợp lệ", res);
    const foundedCity = await City.findOne({ code: cityCode });
    if (!foundedCity) return generateMessage("Invalid cityCode", res);
    const newProperty = new Property({
      owner: req.user._id,
      group: group.toLowerCase() || req.user.group,
      address,
      cityCode,
      pricePerDay,
      title,
      description,
      rentalType,
      amountOfGuest,
      roomsAndBeds: {
        beds,
        bedrooms,
        bathrooms,
      },
      coords: {
        lng: longitude,
        lat: latitude,
      },
    });
    let result = await newProperty.save();
    req.user.hostedList.push(result._id);
    await req.user.save();
    foundedCity.listHostedProperties.push(result._id);
    await foundedCity.save();
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
    if (error.errors?.rentalType?.message)
      return generateMessage(error.errors.rentalType.message, res);
    if (error.errors?.group?.message)
      return generateMessage(error.errors.group.message, res);
  }
};

const getPropertyInfo = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) return generateMessage("Id không hợp lệ");
    const property = await Property.findOne({
      _id: id,
      isActive: true,
    })
      // .populate("listOfReservation", "-_id")
      // .populate("reviews", "-_id")
      .populate({
        path: "owner",
        match: { isActive: true },
        select: "name username avatar -_id",
      });
    if (!property) {
      return generateMessage("Property không tồn tại", res);
    }
    if (!property.owner || property.owner.length === 0) {
      property.isActive = false;
      property.isPublished = false;
      await property.save();
      return generateMessage("Property không tồn tại", res);
    }
    return res.send({
      ...property._doc,
    });
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyInfo = async (req, res) => {
  // chia ra làm nhiều api update. Chia theo loại giống như Airbnb
  const {
    propertyId,
    rentalType,
    cityCode,
    amountOfGuest,
    address,
    pricePerDay,
    serviceFee,
    title,
    description,
    isPublished,
    latitude,
    longitude,
  } = req.body;
};

const updatePropertyImages = async (req, res) => {};

const deleteProperty = async (req, res) => {};

const getListProperty = async (req, res) => {};

module.exports = {
  createRentalProperty,
  getPropertyInfo,
  updatePropertyInfo,
  getListRentalType,
};
