const express = require("express");
const { createRentalProperty } = require("../controllers/property");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/QuanLyPhong/TaoPhongChoThue", auth(), createRentalProperty);

module.exports = router;
