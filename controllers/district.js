const {
  vietnameseRegexStr,
  nonAccentVietnamese,
} = require("../Helpers/convertVietnameseStr");
const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const getEmptyKeys = require("../Helpers/getEmptyKeys");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");
const City = require("../models/city");
const District = require("../models/district");
const { Property } = require("../models/property");

const addNewDistrict = async (req, res) => {
  const { cityCode, name } = req.query;
  try {
    const emptyKeys = getEmptyKeys({ cityCode, name });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} is required`, res);
    const foundedCity = await City.findOne({ code: cityCode, isActive: true });
    if (!foundedCity) return generateMessage("Can't find city", res);
    const foundedDistrict = await District.findOne({
      cityCode,
      name: { $regex: vietnameseRegexStr(name) },
      isActive: true,
    });
    if (foundedDistrict)
      return generateMessage(
        "District name already existed in this city.",
        res
      );
    let tempDistrictCode = `${foundedCity.code}-${nonAccentVietnamese(name)
      .split(",")[0]
      .replace(/ /, "")}`;
    let n = 0;
    while (
      await District.findOne({ code: tempDistrictCode, isActive: true }).select(
        "_id"
      )
    )
      n += 1;
    tempDistrictCode = n === 0 ? tempDistrictCode : `${tempDistrictCode}-${n}`;
    const newDistrict = new District({
      cityCode,
      code: tempDistrictCode,
      name,
    });
    const result = await newDistrict.save();
    foundedCity.listOfDistricts.push(result._id);
    await foundedCity.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const getDistrictDetails = async (req, res) => {
  const { districtCode, group = "gp01" } = req.query;
  try {
    if (!districtCode) return generateMessage("District code is required", res);
    if (!isValidGroup(group)) return generateMessage("Invalid group", res);
    const foundedDistrict = await District.findOne({
      code: districtCode,
      isActive: true,
    }).populate({
      path: "listOfProperties",
      match: { isActive: true, isPublished: true, group },
      options: {
        sort: { "rating.totalReviews": "desc", "rating.scores.final": "desc" },
      },
      select:
        "group rentalType address images description title pricePerDay coords rating.scores rating.totalReviews amountOfGuest roomsAndBeds",
    });
    if (!foundedDistrict)
      return generateMessage("District does not exist", res);
    res.send(foundedDistrict);
  } catch (error) {
    devError(error, res);
  }
};

const getDistrictDetailsPerPage = async (req, res) => {
  const {
    districtCode,
    group = "gp01",
    currentPage = 1,
    pageSize = 20,
  } = req.query;
  try {
    if (!districtCode) return generateMessage("District code is required", res);
    if (
      !isKeysTypeCorrect("string", { districtCode, group }) ||
      !isKeysTypeCorrect("number", { currentPage, pageSize })
    )
      return generateMessage("Invalid key type", res);
    if (!isValidGroup(group)) return generateMessage("Invalid group", res);
    const foundedDistrict = await District.findOne({
      code: districtCode,
      isActive: true,
    }).populate({
      path: "listOfProperties",
      match: { isActive: true, isPublished: true, group },
      options: {
        sort: {
          "rating.totalReviews": "desc",
          "rating.scores.final": "desc",
        },
        skip: (currentPage - 1) * pageSize,
      },
      perDocumentLimit: pageSize,
      select:
        "group rentalType address images description title pricePerDay coords rating.scores rating.totalReviews amountOfGuest roomsAndBeds",
    });
    if (!foundedDistrict)
      return generateMessage("District does not exist", res);
    const totalCount = await Property.find({
      group,
      districtCode,
      isPublished: true,
      isActive: true,
    })
      .select("_id")
      .countDocuments();
    foundedDistrict.currentPage = currentPage;
    foundedDistrict.totalPages =
      totalCount < pageSize ? 1 : Math.ceil(totalCount / pageSize);
    foundedDistrict.propertiesCount = foundedDistrict.listOfProperties.length;
    foundedDistrict.totalPropertiesCount = totalCount;
    res.send(foundedDistrict);
  } catch (error) {
    devError(error, res);
  }
};

const updateDistrictInfo = async (req, res) => {
  const { districtCode, name, defaultDistrict } = req.body;
  try {
    if (!districtCode) return generateMessage("District code is required", res);
    if (typeof districtCode !== "string" || typeof name !== "string")
      return generateMessage("Invalid key type");
    const foundedDistrict = await District.findOne({
      isActive: true,
      code: districtCode,
    });
    if (!foundedDistrict)
      return generateMessage("District does not exist", res);
    if (req.user.username === "hieurom") {
      foundedDistrict.name = name || foundedDistrict.name;
      foundedDistrict.defaultDistrict =
        defaultDistrict ?? foundedDistrict.defaultDistrict;
      const result = await foundedDistrict.save();
      result.toJSON();
      delete result.listOfProperties;
      res.send(result);
    } else if (foundedDistrict.defaultDistrict)
      return generateMessage("You can not edit default district.", res);
    else {
      foundedDistrict.name = name || foundedDistrict.name;
      const result = await foundedDistrict.save();
      result.toJSON();
      delete result.listOfProperties;
      res.send(result);
    }
  } catch (error) {
    devError(error, res);
  }
};

const deleteDistrict = async (req, res) => {
  const { districtCode } = req.query;
  try {
    if (!districtCode) return generateMessage("District code is required", res);
    const foundedDistrict = await District.findOne({
      code: districtCode,
      isActive: true,
    }).populate({
      path: "listOfProperties",
      match: { isActive: true },
      select: "_id",
    });
    if (!foundedDistrict)
      return generateMessage("District does not exist", res);
    if (foundedDistrict.defaultDistrict)
      return generateMessage("You can not delete default district", res);
    if (foundedDistrict.listOfProperties.length > 0)
      return generateMessage(
        "Already have some properties registed in this district, you cannot delete this district.",
        res
      );
    foundedDistrict.isActive = false;
    res.send(await foundedDistrict.save());
  } catch (error) {
    devError(error, res);
  }
};

module.exports = {
  addNewDistrict,
  getDistrictDetails,
  getDistrictDetailsPerPage,
  updateDistrictInfo,
  deleteDistrict,
};
