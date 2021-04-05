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
  getListProperty,
  getListPropertyPerPage,
} = require("../controllers/property");
const { auth } = require("../middleware/auth");
const { upload, uploadCallBack } = require("../middleware/uploadFile");

const router = express.Router();

router.get("/QuanLyPhong/LayDanhSachLoaiHinhChoThue", getListRentalType);

router.post("/QuanLyPhong/TaoPhongChoThue", auth(), createRentalProperty);

router.get("/QuanLyPhong/LayThongTinPhong", getPropertyInfo);

router.put(
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

router.put(
  "/QuanLyPhong/ThayDoiThongTinTienIch",
  auth(),
  updatePropertyAmenities
);

router.put(
  "/QuanLyPhong/ThayDoiThongTinCoSoVatChat",
  auth(),
  updatePropertyFacilities
);

router.put("/QuanLyPhong/ThayDoiThongTinQuyDinh", auth(), updatePropertyRules);

router.put(
  "/QuanLyPhong/ThayDoiYeuCauDoiVoiNguoiDung",
  auth(),
  updatePropertyRequireForBooker
);

router.put(
  "/QuanLyPhong/ThayDoiThongTinChuThich",
  auth(),
  updatePropertyNoticeAbout
);

router.delete("/QuanLyPhong/XoaPhong", auth(), deleteProperty);

router.get("/QuanLyPhong/LayThongTinPhongTheoDiaDiem", getListProperty);

router.get(
  "/QuanLyPhong/LayThongTinPhongTheoDiaDiemPhanTrang",
  getListPropertyPerPage
);

module.exports = router;
