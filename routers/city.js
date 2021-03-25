const express = require("express");
const {
  getCityDetails,
  addNewCity,
  getListCity,
} = require("../controllers/city");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuayLyThanhPho/ThemThanhPho", auth(), addNewCity);

router.get("/QuanLyThanhPho/LayThongTinThanhPho", getCityDetails);

router.get("/QuanLyThanhPho/LayDanhSachThanhPho", getListCity);

module.exports = router;
