const getEmptyKeys = require("../Helpers/getEmptyKeys");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");
const { devError } = require("../Helpers/devError");
const District = require("../models/district");
const config = require("config");
const moment = require("moment");
const {
  vnDateRegex,
  vietnameseRegexStr,
} = require("../Helpers/convertVietnameseStr");
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
    districtCode,
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
    isPublished,
  } = req.body;
  try {
    const emptyKeys = getEmptyKeys({
      address,
      pricePerDay,
      districtCode,
      rentalType,
      title,
      description,
      longitude,
      latitude,
    });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} không được trống`, res);
    if (
      isKeysTypeCorrect("object", req.body) ||
      isKeysTypeCorrect("array", req.body) ||
      !isKeysTypeCorrect("boolean", isPublished) ||
      !isKeysTypeCorrect("number", { longitude, latitude })
    )
      return generateMessage("Kiểu dữ liệu không hợp lệ", res);
    if (group && !isValidGroup(group))
      return generateMessage("Group không hợp lệ", res);
    const foundedDistrict = await District.findOne({
      code: districtCode,
      isActive: true,
    }).select("name listOfProperties cityCode");
    if (!foundedDistrict)
      return generateMessage("District does not exist", res);
    const foundedProperty = await Property.findOne({
      group,
      isActive: true,
      coords: { lng: longitude, lat: latitude },
    }).select("_id");
    if (foundedProperty)
      return generateMessage("This coords have already been occupate", res);
    const newProperty = new Property({
      owner: req.user._id,
      group: group?.toLowerCase() || req.user.group,
      address,
      districtCode,
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
      isPublished,
    });
    let result = await newProperty.save();
    req.user.hostedList.push(result._id);
    await req.user.save();
    foundedDistrict.listOfProperties.push(result._id);
    await foundedDistrict.save();
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
    res.status(500).send(error);
  }
};

const getPropertyInfo = async (req, res) => {
  const { id } = req.query;
  try {
    if (!id) return generateMessage("Property id is required", res);
    const property = await Property.findOne({
      _id: id,
      isActive: true,
    })
      .populate({
        path: "listOfReservation",
        match: { isActive: true },
        select: "-isActive -property",
        populate: { path: "booker", select: "username email name -_id" },
      })
      .populate({
        path: "rating.reviews",
        match: { isActive: true },
        select: "-isActive",
        populate: { path: "reviewer", select: "username email name -_id" },
      })
      .populate({
        path: "owner",
        match: { isActive: true },
        select: "name username avatar -_id",
      });
    if (!property) {
      return generateMessage("Property không tồn tại", res);
    }

    return res.send(property);
  } catch (error) {
    devError(error, res);
  }
};

// chia ra làm nhiều api update. Chia theo loại giống như Airbnb
const updatePropertyFrontInfo = async (req, res) => {
  const {
    propertyId,
    amountOfGuest,
    beds,
    bedrooms,
    bathrooms,
    pricePerDay,
    serviceFee,
    title,
    description,
    isPublished,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    if (
      !isKeysTypeCorrect("string", {
        title,
        description,
      }) ||
      isKeysTypeCorrect("number", {
        amountOfGuest,
        pricePerDay,
        serviceFee,
        beds,
        bedrooms,
        bathrooms,
      }) ||
      isKeysTypeCorrect("boolean", { isPublished })
    ) {
      return generateMessage("Invalid key type", res);
    }
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    }).populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    foundedProperty.amountOfGuest =
      amountOfGuest ?? foundedProperty.amountOfGuest;
    foundedProperty.roomsAndBeds.beds =
      beds ?? foundedProperty.roomsAndBeds.beds;
    foundedProperty.roomsAndBeds.bedrooms =
      bedrooms ?? foundedProperty.roomsAndBeds.bedrooms;
    foundedProperty.roomsAndBeds.bathrooms =
      bathrooms ?? foundedProperty.roomsAndBeds.bathrooms;
    foundedProperty.pricePerDay = pricePerDay ?? foundedProperty.pricePerDay;
    foundedProperty.serviceFee = serviceFee ?? foundedProperty.serviceFee;
    foundedProperty.title = title ?? foundedProperty.title;
    foundedProperty.description = description ?? foundedProperty.description;
    foundedProperty.isPublished = isPublished ?? foundedProperty.isPublished;
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const addImagesToProperty = async (req, res) => {
  const { propertyId } = req.body;
  try {
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("owner images")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );

    const imagesName = req.files.photos.map(
      (item) => `http://${config.get("hostUrl")}/image/${item.filename}`
    );
    foundedProperty.images = foundedProperty.images.concat(imagesName);
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const removeImageFromProperty = async (req, res) => {
  const { propertyId, imageLink } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    if (typeof imageLink !== "string" || typeof propertyId !== "string")
      return generateMessage("Invalid key type", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("owner images")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const imageIndex = foundedProperty.images.indexOf(imageLink);
    if (imageIndex === -1)
      return generateMessage("Can't find your link in this property.", res);
    foundedProperty.images.splice(imageIndex, 1);
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyAmenities = async (req, res) => {
  const {
    propertyId,
    television,
    kitchen,
    airConditioning,
    wifi,
    swimmingPool,
    washer,
    microwave,
    refrigerator,
    selfCheckIn,
    smokeAlarm,
    hangers,
    dryer,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("amenities owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const amenities = {
      television,
      kitchen,
      airConditioning,
      wifi,
      swimmingPool,
      washer,
      microwave,
      refrigerator,
      selfCheckIn,
      smokeAlarm,
      hangers,
      dryer,
    };
    if (!isKeysTypeCorrect("boolean", amenities))
      return generateMessage("Invalid key type", res);
    for (const key in amenities) {
      foundedProperty.amenities[key] =
        amenities[key] ?? foundedProperty.amenities[key];
    }
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyFacilities = async (req, res) => {
  const { propertyId, hotTub, gym, pool, freeParking } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("facilities owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const facilities = { hotTub, gym, pool, freeParking };
    if (!isKeysTypeCorrect("boolean", facilities))
      return generateMessage("Invalid key type", res);
    for (const key in facilities) {
      foundedProperty.facilities[key] =
        facilities[key] ?? foundedProperty.facilities[key];
    }
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyRules = async (req, res) => {
  const {
    propertyId,
    petsAllowed,
    smokingAllowed,
    partiesAllowed,
    longTermStaysAllowed,
    suitableForChildren,
    customRules,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("rules owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const rules = {
      petsAllowed,
      smokingAllowed,
      partiesAllowed,
      longTermStaysAllowed,
      suitableForChildren,
      customRules,
    };
    if (!isKeysTypeCorrect("boolean", rules))
      return generateMessage("Invalid key type", res);
    for (const key in rules) {
      foundedProperty.rules[key] = rules[key] ?? foundedProperty.rules[key];
    }
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyRequireForBooker = async (req, res) => {
  const {
    propertyId,
    checkInTime,
    checkOutTime,
    minStayDays,
    maxStayDays,
    identificationPapers,
    hasNoBadReview,
    customRequire,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("requireForBooker owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const requireForBooker = {
      checkInTime,
      checkOutTime,
      minStayDays,
      maxStayDays,
      identificationPapers,
      hasNoBadReview,
    };
    const objTypes = {
      checkInTime: "string",
      checkOutTime: "string",
      minStayDays: "number",
      maxStayDays: "number",
      identificationPapers: "boolean",
      hasNoBadReview: "boolean",
    };
    if (!isKeysTypeCorrect(objTypes, requireForBooker))
      return generateMessage("Invalid key type", res);
    foundedProperty.requireForBooker.checkInTime =
      checkInTime ?? foundedProperty.requireForBooker.checkInTime;
    foundedProperty.requireForBooker.checkOutTime =
      checkOutTime ?? foundedProperty.requireForBooker.checkOutTime;
    foundedProperty.requireForBooker.stayDays.min =
      minStayDays ?? foundedProperty.requireForBooker.stayDays.min;
    foundedProperty.requireForBooker.stayDays.max =
      maxStayDays ?? foundedProperty.requireForBooker.stayDays.max;
    foundedProperty.requireForBooker.identificationPapers =
      identificationPapers ??
      foundedProperty.requireForBooker.identificationPapers;
    foundedProperty.requireForBooker.hasNoBadReview =
      hasNoBadReview ?? foundedProperty.requireForBooker.hasNoBadReview;
    if (typeof customRequire === "string")
      foundedProperty.requireForBooker.customRequire.push(customRequire);
    if (Array.isArray(customRequire))
      foundedProperty.requireForBooker.customRequire =
        customRequire.length > 0
          ? [...customRequire]
          : foundedProperty.requireForBooker.customRequire;
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updatePropertyNoticeAbout = async (req, res) => {
  const {
    propertyId,
    stairs,
    noise,
    petInTheHouse,
    parkingSpace,
    sharedSpace,
    cameras,
  } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("noticeAbout owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    const noticeAbout = {
      stairs,
      noise,
      petInTheHouse,
      parkingSpace,
      sharedSpace,
      cameras,
    };
    if (!isKeysTypeCorrect("string", noticeAbout))
      return generateMessage("Invalid key type", res);
    for (const key in noticeAbout) {
      foundedProperty.noticeAbout[key] =
        noticeAbout[key] ?? foundedProperty.noticeAbout[key];
    }
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const deleteProperty = async (req, res) => {
  const { propertyId } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    if (typeof propertyId !== "string")
      return generateMessage("Invalid key type", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
    })
      .select("owner")
      .populate("owner", "username");
    if (!foundedProperty)
      return generateMessage("Property does not exist", res);
    if (
      foundedProperty.owner.username !== req.user.username &&
      req.user.role !== "Admin"
    )
      return generateMessage(
        "You don't have the permission do this functionality.",
        res
      );
    foundedProperty.isActive = false;
    const result = await foundedProperty.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const getListProperty = async (req, res) => {
  // city and district are required
  const {
    city,
    group = "gp01",
    district,
    rentalType,
    amountOfGuest,
    fromDate,
    toDate,
  } = req.query;
  try {
    if (!city || !district)
      return generateMessage("City name and district name are required", res);
    if (
      !isKeysTypeCorrect("string", {
        district,
        city,
        rentalType,
        fromDate,
        toDate,
      }) ||
      !isKeysTypeCorrect("number", { amountOfGuest })
    )
      return generateMessage("Invalid data type", res);
    if (!isValidGroup(group)) return generateMessage("Invalid group", res);

    const dateRegex = vnDateRegex();
    if (
      (fromDate || toDate) &&
      (!dateRegex.test(fromDate) || !dateRegex.test(toDate))
    )
      return generateMessage(
        "Invalid date format. Only dd/MM/yyyy formats are accepted",
        res
      );
    ///////////////////////////////////////////

    const propertyOptQuery = {
      group,
      isActive: true,
      isPublished: true,
      rentalType,
      amountOfGuest,
    };
    if (!rentalType) delete propertyOptQuery.rentalType;
    if (!amountOfGuest && amountOfGuest !== 0)
      delete propertyOptQuery.amountOfGuest;

    const foundedCity = await City.findOne({
      isActive: true,
      name: { $regex: vietnameseRegexStr(city) },
    }).select("name code");
    if (!foundedCity)
      return generateMessage("Cannot find the city you provided", res);

    const foundedDistrict = await District.findOne({
      isActive: true,
      cityCode: foundedCity.code,
      name: { $regex: vietnameseRegexStr(district) },
    })
      .select("name code listOfProperties")
      .populate({
        path: "listOfProperties",
        match: { ...propertyOptQuery },
        options: {
          sort: {
            "rating.totalReviews": "desc",
            "rating.scores.final": "desc",
          },
        },
        select:
          "group listOfReservation rentalType address images description title pricePerDay coords rating.scores rating.totalReviews amountOfGuest roomsAndBeds",
        populate: {
          path: "listOfReservation",
          match: { isActive: true },
          select: "startDate endDate -_id",
        },
      });
    if (!foundedDistrict)
      return generateMessage("Cannot find the district you provided", res);
    ////////////////////////////////////////////////////
    if (!fromDate && toDate)
      return generateMessage(
        "'toDate' need to go with 'fromDate'. Please enter 'fromDate'.",
        res
      );
    if (
      fromDate &&
      toDate &&
      moment(fromDate, "DD-MM-YYYY").isAfter(moment(toDate, "DD-MM-YYYY"))
    )
      return generateMessage("'fromDate' cannot be later than 'toDate'", res);
    if (fromDate || toDate) {
      const isDateBetween = (date, startDate, endDate) =>
        moment(date, "DD-MM-YYYY").isBetween(
          moment(startDate, "DD-MM-YYYY"),
          moment(endDate, "DD-MM-YYYY"),
          undefined,
          "[]"
        );
      foundedDistrict.listOfProperties.forEach(({ listOfReservation }) => {
        let reservate = null;
        for (const item of listOfReservation) {
          const inavailFromDate = isDateBetween(
            fromDate,
            item.startDate,
            item.endDate
          );
          const inavailToDate = isDateBetween(
            toDate,
            item.startDate,
            item.endDate
          );
          const overBookedDays =
            isDateBetween(item.startDate, fromDate, toDate) ||
            (moment(item.startDate, "DD-MM-YYYY").isBefore(fromDate) &&
              (isDateBetween(item.endDate, fromDate, toDate) || !item.endDate));
          if (inavailFromDate || inavailToDate || overBookedDays) {
            reservate = item;
            break;
          }
        }
        // const index = listOfReservation.indexOf()
        // if (reservate) foundedDistrict.listOfProperties.
      });
    }

    //////////////////////////////////////////////

    res.send(foundedProperty);
  } catch (error) {
    if (error.errors?.rentalType?.message)
      return generateMessage(error.errors.rentalType.message, res);
    if (error.errors?.group?.message)
      return generateMessage(error.errors.group.message, res);
    devError(error, res);
  }
};

const getListPropertyPerPage = async (req, res) => {};

module.exports = {
  createRentalProperty,
  getPropertyInfo,
  updatePropertyFrontInfo,
  getListRentalType,
  addImagesToProperty,
  removeImageFromProperty,
  updatePropertyAmenities,
  updatePropertyFacilities,
  updatePropertyRules,
  updatePropertyRequireForBooker,
  updatePropertyNoticeAbout,
  deleteProperty,
};
