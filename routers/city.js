const express = require("express");
const { getCityInfo, addNewCity } = require("../controllers/city");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuayLyThanhPho/ThemThanhPho", auth(), addNewCity);

router.get("/QuanLyThanhPho/LayThongTinThanhPho", getCityInfo);

module.exports = router;
