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
const District = require("../models/district");

// Dành cho Admin
const addNewCity = async (req, res) => {
  let { cityCode, name } = req.body;

  if (!name) return generateMessage("City name is required", res);
  const regex = /^[a-zA-Z ]+$/;
  if (!regex.test(nonAccentVietnamese(name).replace(/,/, " ")))
    return generateMessage(
      "Invalid name. Please try something different.",
      res
    );

  const foundedCityName = await City.findOne({
    isAcitve: true,
    name: { $regex: vietnameseRegexStr(name) },
  });
  if (foundedCityName) return generateMessage("This city already exists", res);
  let newCode = "";
  if (cityCode) {
    if (!regex.test(cityCode.replace(/ /, "")))
      return generateMessage(
        "Invalid cityCode. Please try something different or let us generate the code for you.",
        res
      );
    const foundedCode = await City.findOne({
      isActive: true,
      code: cityCode.replace(/ /g, ""),
    });
    if (foundedCode) return generateMessage("City code already exists. ", res);
    newCode = cityCode.replace(/ /g, "");
  } else {
    newCode = nonAccentVietnamese(name).split(",")[0].replace(/ /g, "");
    let n = 0;
    while (
      await City.findOne({ isActive: true, code: newCode }).select("code")
    ) {
      n += 1;
    }
    newCode = n === 0 ? newCode : newCode + `-${n}`;
  }

  const newCity = new City({
    code: newCode,
    name,
  });
  const result = await newCity.save();
  res.send(result);
};

// Khi người dùng click vào 1 city bất kì đc listed ở HomePage thì sẽ hiển thị các nhà có sẵn gần
//vị trí của người dùng
const getCityDetails = async (req, res) => {
  // districtCode, pageSizePerDistrict, currentPagePerDistrict is optional
  const {
    cityCode,
    group = "gp01",
    districtCode,
    currentPagePerDistrict = 1,
    pageSizePerDistrict,
  } = req.query;
  const emptyKeys = getEmptyKeys({ cityCode, group });
  if (emptyKeys.length > 0)
    return generateMessage(`${emptyKeys[0]} is required`, res);
  if (
    !isKeysTypeCorrect("string", { cityCode, group, districtCode }) ||
    !isKeysTypeCorrect("number", { pageSizePerDistrict })
  )
    return generateMessage("Invalid key type", res);
  if (!isValidGroup(group)) return generateMessage("Invalid group", res);
  try {
    const populateOpt = {
      path: "listOfDistricts",
      match: { code: districtCode, isActive: true },
      select: "code name listOfProperties -_id",
      populate: {
        path: "listOfProperties",
        match: { group, isActive: true, isPublished: true },
        options: {
          sort: {
            "rating.totalReviews": "desc",
            "rating.scores.final": "desc",
          },
          skip: (currentPagePerDistrict - 1) * pageSizePerDistrict,
        },
        perDocumentLimit: pageSizePerDistrict,
        select:
          "group rentalType address images description title pricePerDay coords rating.scores rating.totalReviews amountOfGuest roomsAndBeds",
      },
    };
    if (!districtCode) delete populateOpt.match;
    if (!pageSizePerDistrict) {
      delete populateOpt.populate.perDocumentLimit;
      delete populateOpt.populate.options.skip;
    }

    const foundedCity = await City.findOne({
      isActive: true,
      code: cityCode,
    }).populate(populateOpt);
    if (!foundedCity) return generateMessage("City is not exists", res);
    if (currentPagePerDistrict && pageSizePerDistrict)
      await foundedCity.listOfDistricts.forEach(async (district) => {
        const totalProperty = await District.findOne({
          code: district.code,
          isActive: true,
        })
          .populate({
            path: "listOfProperties",
            match: { group, isActive: true, isPublished: true },
            select: "_id",
          })
          .countDocuments();

        district.currentPage = currentPagePerDistrict;
        district.totalPages =
          totalProperty < pageSizePerDistrict
            ? 1
            : Math.ceil(totalProperty / pageSizePerDistrict);
        district.propertiesCount = foundedCity.listOfDistricts.length;
        district.totalPropertiesCount = totalProperty;
      });

    res.send(foundedCity);
  } catch (error) {
    devError(error, res);
  }
};

// Dành cho lúc list ra các thành phố để người dùng chọn ở trang homePage
const getListCity = async (req, res) => {
  // cityCode is optional
  let { cityCode } = req.query;
  try {
    if (cityCode && typeof cityCode !== "string")
      return generateMessage("Invalid code", res);
    const findOpt = { isActive: true, code: cityCode };
    if (!cityCode) delete findOpt.code;
    const cities = await City.find(findOpt)
      .sort({ createdAt: "asc" })
      .populate("listOfDistricts", "code name -_id");
    res.send(cities);
  } catch (error) {
    devError(error, res);
  }
};

// Admin only. Only hieurom can change all things about cities
const updateCityInfo = async (req, res) => {
  const { cityCode, name, defaultCity } = req.body;
  try {
    if (!cityCode) return generateMessage("City code is required", res);
    if (!isKeysTypeCorrect("string", { cityCode, name }))
      return generateMessage("Invalid input type", res);
    const foundedCity = await City.findOne({
      isActive: true,
      code: cityCode,
    }).select("-listOfDistricts");
    if (!foundedCity)
      return generateMessage(
        "Can not find city that matches the city code you provided",
        res
      );
    if (name) {
      const foundedCityName = await City.findOne({
        isActive: true,
        name: { $regex: vietnameseRegexStr(name) },
      });
      if (foundedCityName)
        return generateMessage("City name already exists", res);
    }
    if (req.user.username === "hieurom") {
      foundedCity.name = name || foundedCity.name;
      // null or undefined will not set to the field
      foundedCity.defaultCity = defaultCity ?? foundedCity.defaultCity;
      const result = await foundedCity.save();
      result.toJSON();
      delete result.listOfDistricts;
      return res.send(result);
    } else if (foundedCity.defaultCity) {
      return generateMessage("You can not edit default cities.", res);
    } else {
      foundedCity.name = name || foundedCity.name;
      const result = await foundedCity.save();
      result.toJSON();
      delete result.listOfDistricts;
      return res.send(result);
    }
  } catch (error) {
    devError(error, res);
  }
};

// Admin only
const deleteCityInfo = async (req, res) => {
  const { cityCode } = req.query;
  try {
    if (!cityCode) return generateMessage("City code is required", res);
    const foundedCity = await City.findOne({
      isActive: true,
      code: cityCode,
    }).populate({
      path: "listOfDistricts",
      match: { isActive: true },
      select: "code name -_id",
    });
    if (!foundedCity) return generateMessage("City does not exist", res);
    if (foundedCity.defaultCity)
      return generateMessage("You can not delete default cities", res);
    if (foundedCity.listOfDistricts.length > 0)
      return generateMessage(
        "Already have some districts registed in this city, you cannot delete this city.",
        res
      );
    foundedCity.isAcitve = false;
    return res.send(await foundedCity.save());
  } catch (error) {
    devError(error, res);
  }
};

module.exports = {
  addNewCity,
  getCityDetails,
  getListCity,
  updateCityInfo,
  deleteCityInfo,
};
