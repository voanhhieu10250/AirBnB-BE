const express = require("express");
const {
  getCityDetails,
  addNewCity,
  getListCity,
  updateCityInfo,
} = require("../controllers/city");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuayLyThanhPho/ThemThanhPho", auth(), addNewCity);

router.get("/QuanLyThanhPho/LayThongTinThanhPho", getCityDetails);

router.get("/QuanLyThanhPho/LayDanhSachThanhPho", getListCity);

router.post(
  "/QuanLyThanhPho/ThayDoiThongTinThanhPho",
  auth(["Admin"]),
  updateCityInfo
);
module.exports = router;
