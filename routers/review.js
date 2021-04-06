const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createPropertyReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");

const router = express.Router();

router.post("/QuanLyDanhGiaPhong/TaoDanhGia", auth(), createPropertyReview);

router.put("/QuanLyDanhGiaPhong/ThayDoiThongTinDanhGia", auth(), updateReview);

router.delete("/QuanLyDanhGiaPhong/XoaDanhGia", auth(), deleteReview);

module.exports = router;
