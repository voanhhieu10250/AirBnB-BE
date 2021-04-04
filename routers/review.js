const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createPropertyReview,
  getReviewDetails,
  updateReviewComment,
  deleteReview,
} = require("../controllers/review");

const router = express.Router();

router.post("/QuanLyDanhGiaPhong/TaoDanhGia", auth(), createPropertyReview);

router.get("/QuanLyDanhGiaPhong/LayThongTinDanhGia", auth(), getReviewDetails);

router.put(
  "/QuanLyDanhGiaPhong/ThayDoiThongTinDanhGia",
  auth(),
  updateReviewComment
);

router.delete("/QuanLyDanhGiaPhong/XoaDanhGia", auth(), deleteReview);

module.exports = router;
