const express = require("express");
const {
  getCityDetails,
  addNewCity,
  getListCity,
  updateCityInfo,
  deleteCityInfo,
  getListCityCode,
} = require("../controllers/city");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuayLyThanhPho/ThemThanhPho", auth(["Admin"]), addNewCity);

router.get("/QuanLyThanhPho/LayThongTinThanhPho", getCityDetails);

router.get("/QuanLyThanhPho/LayDanhSachThanhPho", getListCity);

router.get("/QuanLyThanhPho/LayDanhSachCodeThanhPho", getListCityCode);

router.put(
  "/QuanLyThanhPho/ThayDoiThongTinThanhPho",
  auth(["Admin"]),
  updateCityInfo
);

router.delete("/QuanLyThanhPho/XoaThanhPho", auth(["Admin"]), deleteCityInfo);

module.exports = router;
