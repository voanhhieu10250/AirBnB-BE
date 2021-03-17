const express = require("express");
const { uploadFile } = require("../controllers/upload");
const { auth } = require("../middleware/auth");
const { upload, uploadCallBack } = require("../middleware/uploadFile");

const router = express.Router();

router.post(
  "/QuanLyHinhAnh/ThemHinhAnh",
  auth(["QuanTri"]),
  upload(uploadCallBack.fields([{ name: "photos" }])),
  uploadFile
);

module.exports = router;
