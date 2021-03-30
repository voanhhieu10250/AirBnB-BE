const express = require("express");
const {
  createRentalProperty,
  getPropertyInfo,
  getListRentalType,
  updatePropertyFrontInfo,
  addImagesToProperty,
  removeImageFromProperty,
  updatePropertyAmenities,
  updatePropertyFacilities,
  updatePropertyRules,
  updatePropertyRequireForBooker,
  updatePropertyNoticeAbout,
  deleteProperty,
} = require("../controllers/property");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/QuanLyPhong/LayDanhSachLoaiHinhChoThue", getListRentalType);

router.post("/QuanLyPhong/TaoPhongChoThue", auth(), createRentalProperty);

router.get("/QuanLyPhong/LayThongTinPhong", getPropertyInfo);

router.post(
  "/QuanLyPhong/ThayDoiThongTinHienThiChung",
  auth(),
  updatePropertyFrontInfo
);

router.post(
  "/QuanLyPhong/ThemHinhAnhPhong",
  auth(),
  upload(uploadCallBack.fields([{ name: "photos" }])),
  addImagesToProperty
);

router.delete("/QuanLyPhong/XoaHinhAnhPhong", auth(), removeImageFromProperty);

router.post(
  "/QuanLyPhong/ThayDoiThongTinTienIch",
  auth(),
  updatePropertyAmenities
);

router.post(
  "/QuanLyPhong/ThayDoiThongTinCoSoVatChat",
  auth(),
  updatePropertyFacilities
);

router.post("/QuanLyPhong/ThayDoiThongTinQuyDinh", auth(), updatePropertyRules);

router.post(
  "/QuanLyPhong/ThayDoiYeuCauDoiVoiNguoiDung",
  auth(),
  updatePropertyRequireForBooker
);

router.post(
  "/QuanLyPhong/ThayDoiThongTinChuThich",
  auth(),
  updatePropertyNoticeAbout
);

router.delete("/QuanLyPhong/XoaPhong", auth(), deleteProperty);

module.exports = router;
