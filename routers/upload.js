const express = require("express");
const {
  uploadFile,
  getListImages,
  deleteImage,
} = require("../controllers/upload");
const { auth } = require("../middleware/auth");
const { upload, uploadCallBack } = require("../middleware/uploadFile");

const router = express.Router();

router.post(
  "/QuanLyHinhAnh/ThemHinhAnh",
  auth(),
  upload(uploadCallBack.fields([{ name: "photos" }])),
  uploadFile
);

router.get("/QuanLyHinhAnh/LayDanhSachHinhAnhHienCo", auth(), getListImages);

router.delete("/QuanLyHinhAnh/XoaHinhAnh", auth(["Admin"]), deleteImage);

module.exports = router;
