const {
  nonAccentVietnamese,
  vietnameseRegexStr,
} = require("../Helpers/convertVietnameseStr");
const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const getEmptyKeys = require("../Helpers/getEmptyKeys");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");
const { find } = require("../models/city");
const City = require("../models/city");

// Dành cho Admin
const addNewCity = async (req, res) => {
  let { cityCode, cityName, searchKey } = req.body;

  if (!cityName) return generateMessage("CityName is required", res);
  const regex = /^[a-zA-Z ]+$/;
  if (!regex.test(nonAccentVietnamese(cityName).replace(/-/g, " ")))
    return generateMessage("Invalid cityName.", res);
  if (cityCode) {
    if (!regex.test(cityCode)) return generateMessage("Invalid cityCode.", res);
    const foundedCode = await City.findOne({
      code: cityCode.replace(/ /g, ""),
    });
    if (foundedCode) return generateMessage("City code already exists", res);
  }

  const foundedCityName = await City.findOne({
    name: { $regex: vietnameseRegexStr(cityName, true) },
  });
  if (foundedCityName) return generateMessage("City already exists", res);

  const newCity = new City({
    code:
      cityCode?.replace(/ /g, "") ||
      nonAccentVietnamese(cityName).replace(/ /g, ""),
    name: cityName,
    searchKey,
    defaultCity: true, // nhớ xóa dòng này ra khi hoàn thành dự án
  });
  const result = await newCity.save();
  res.send({
    code: result.code,
    name: result.name,
    searchKey: result.searchKey,
  });
};

// Chủ yếu dành cho list city có sẵn ở trang HomePage. Chứ người dùng đâu có nhập cityCode
const getCityDetails = async (req, res) => {
  const { cityCode, group = "gp01" } = req.query;
  const emptyKeys = getEmptyKeys({ cityCode });
  if (emptyKeys.length > 0)
    return generateMessage(`${emptyKeys[0]} is required`, res);
  if (!isKeysTypeCorrect("string", { cityCode, group }))
    return generateMessage("Invalid key type", res);
  if (!isValidGroup(group)) return generateMessage("Invalid group", res);

  try {
    const foundedCity = await City.findOne({ code: cityCode })
      .select("-_id -defaultCity")
      .populate({
        path: "listHostedProperties",
        match: {
          isActive: true,
          group: group.toLowerCase().trim(),
        },
        select:
          "owner rentalType address title description images cityCode roomsAndBeds amountOfGuest pricePerDay coords rating",
        populate: { path: "owner", select: "username name -_id" },
      });
    if (!foundedCity) return generateMessage("City is not exists", res);
    res.send(foundedCity);
  } catch (error) {
    devError(error, res);
  }
};

// Dành cho lúc list ra các thành phố để người dùng chọn ở trang homePage
const getListCity = async (req, res) => {
  let { cityCode } = req.query;
  try {
    if (cityCode) {
      if (typeof cityCode !== "string")
        return generateMessage("Invalid code", res);
      const cities = await City.findOne({ code: cityCode }).select(
        "code name searchKey -_id"
      );
      return res.send([cities]);
    }
    const cities = await City.find().select("code name searchKey -_id");
    res.send(cities);
  } catch (error) {
    devError(error, res);
  }
};

// Admin only. Only hieurom can change all things about cities
const updateCityInfo = async (req, res) => {
  const { cityCode, name, searchKey, defaultCity } = req.body;
  const regex = /^[a-zA-Z ]+$/;
  try {
    if (!cityCode) return generateMessage("City code is required", res);
    if (!isKeysTypeCorrect("string", { cityCode, name, searchKey }))
      return generateMessage("Invalid input type", res);
    const foundedCity = await City.findOne({ code: cityCode }).select(
      "-listHostedProperties"
    );
    if (!foundedCity) return generateMessage("City does not exist", res);

    if (req.user.username === "hieurom") {
      foundedCity.name = name || foundedCity.name;
      foundedCity.searchKey = searchKey || foundedCity.searchKey;
      foundedCity.code = cityCode || foundedCity.code;
      foundedCity.defaultCity = defaultCity || foundedCity.defaultCity;
      const result = await foundedCity.save();
      result.toJSON();
      delete result.listHostedProperties;
      return res.send({ message: "Update successful", result });
    } else if (foundedCity.defaultCity) {
      foundedCity.searchKey = searchKey
        ? foundedCity.searchKey + `|${searchKey}`
        : foundedCity.searchKey;
      const result = await foundedCity.save();
      result.toJSON();
      delete result.listHostedProperties;
      return res.send({
        message:
          "For default cities, you can only add more searchKey for them.",
        result,
      });
    } else {
      if (name) {
        const foundedCityName = await City.findOne({
          name: { $regex: vietnameseRegexStr(name, true) },
        });
        if (foundedCityName)
          return generateMessage("City name already exists", res);
        foundedCity.name = name.trim();
      }
      if (searchKey) foundedCity.searchKey = searchKey;
      const result = await foundedCity.save();
      result.toJSON();
      delete result.listHostedProperties;
      return res.send({ message: "Updated successful", result });
    }
  } catch (error) {
    devError(error, res);
  }
};

const deleteCityInfo = async (req, res) => {
  const { cityCode } = req.query;
  try {
    if (!cityCode) return generateMessage("City code is required", res);
    const foundedCity = await City.findOne({ code: cityCode }).populate({
      path: "listHostedProperties",
      select: "isActive isPublished",
    });
    if (!foundedCity) return generateMessage("City does not exist", res);

    if (foundedCity.listHostedProperties.length > 0)
      return generateMessage(
        "There are already some property been hosted in this city, you cannot delete this city."
      );
    if (foundedCity.defaultCity)
      return generateMessage("You can not delete default cities");
  } catch (error) {}
};

module.exports = {
  addNewCity,
  getCityDetails,
  getListCity,
  updateCityInfo,
};
