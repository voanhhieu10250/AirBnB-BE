const express = require("express");
const {
  createReservation,
  reservationDetails,
  updateReservation,
  declineReservationRequest,
} = require("../controllers/reservation");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuanLyDatPhong/TaoYeuCauDatPhong", auth(), createReservation);

router.get("/QuanLyDatPhong/LayThongTinDatPhong", auth(), reservationDetails);

router.put(
  "/QuanLyDatPhong/ThayDoiThongTinDatPhong",
  auth(),
  updateReservation
);

router.delete(
  "/QuanLyDatPhong/HuyYeuCauDatPhong",
  auth(),
  declineReservationRequest
);

module.exports = router;
