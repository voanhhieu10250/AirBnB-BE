const express = require("express");
const { auth } = require("../middleware/auth");
const {
  addNewDistrict,
  getDistrictDetails,
  getDistrictDetailsPerPage,
  updateDistrictInfo,
  deleteDistrict,
} = require("../controllers/district");
const router = express.Router();

router.post("/QuanLyQuanHuyen/ThemQuanHuyen", auth(["Admin"]), addNewDistrict);

router.get("/QuanLyQuanHuyen/LayThongTinQuanHuyen", getDistrictDetails);

router.get(
  "/QuanLyQuanHuyen/LayThongTinQuanHuyenPhanTrang",
  getDistrictDetailsPerPage
);

router.put(
  "/QuanLyQuanHuyen/ThayDoiThongTinQuanHuyen",
  auth(["Admin"]),
  updateDistrictInfo
);

router.delete(
  "/QuanLyQuanHuyen/XoaThongTinQuanHuyen",
  auth(["Admin"]),
  deleteDistrict
);

module.exports = router;
