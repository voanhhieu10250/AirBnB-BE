const express = require("express");
const {
  createRentalProperty,
  getPropertyInfo,
  getListRentalType,
} = require("../controllers/property");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/QuanLyPhong/LayDanhSachLoaiHinhChoThue", getListRentalType);

router.post("/QuanLyPhong/TaoPhongChoThue", auth(), createRentalProperty);

router.get("/QuanLyPhong/LayThongTinPhong", getPropertyInfo);

module.exports = router;
