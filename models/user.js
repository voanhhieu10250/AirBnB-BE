const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    taiKhoan: {
      type: String,
      required: true,
    },
    matKhau: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    soDT: {
      type: String,
      default: null,
    },
    hoTen: {
      type: String,
      required: true,
    },
    maLoaiNguoiDung: {
      type: String,
      default: "user",
    },
    moTa: {
      type: String,
      default: null,
    },
    danhSachPhongDaTao: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Room",
      default: [],
    },
    danhSachPhongDaDat: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Room",
      default: [],
    },
    avatar: {
      type: String,
      default: null,
    },
    tokens: {
      type: [String],
      default: [],
    },
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
