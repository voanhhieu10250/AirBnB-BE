const {
  nonAccentVietnamese,
  vietnameseRegexStr,
} = require("../Helpers/convertVietnameseStr");
const generateMessage = require("../Helpers/generateMessage");
const City = require("../models/city");

/// tự searchKey người dùng new city mà ko thêm searchKey. Thêm chức năng tự lọc khi
// getUserInfo, chỉ hiện các property nào đã được published thôi

const addNewCity = async (req, res) => {
  let { cityCode, cityName, searchKey } = req.body;
  if (!cityName) return generateMessage("Vui lòng nhập cityName", res);
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
  });
  const result = await newCity.save();
  res.send(result);
};
