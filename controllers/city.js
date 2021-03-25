const {
  nonAccentVietnamese,
  vietnameseRegexStr,
} = require("../Helpers/convertVietnameseStr");
const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const getEmptyKeys = require("../Helpers/getEmptyKeys");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");
const City = require("../models/city");

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

const getCityInfo = async (req, res) => {
  const { cityCode, group } = req.query;
  // tại sao lại cần phải lấy city theo code ta? người dùng nhập tên mà, chứ có phải nhập code đâu
  const emptyKeys = getEmptyKeys({ cityCode, group });
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

const getListCityInfo = async (req, res) => {};

const updateCityInfo = async (req, res) => {};

const deleteCityInfo = async (req, res) => {};

module.exports = {
  addNewCity,
  getCityInfo,
};
