const express = require("express");
const {
  createRentalProperty,
  getPropertyInfo,
} = require("../controllers/property");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuanLyPhong/TaoPhongChoThue", auth(), createRentalProperty);

router.get("/QuanLyPhong/LayThongTinPhong", getPropertyInfo);

module.exports = router;
