const mongoose = require("mongoose");
const { utilitySchema } = require("./utility");

const roomSchema = new mongoose.Schema(
  {
    chuNha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maLoaiHinhChoThue: {
      type: String,
      default: "ToanBoNha",
    },
    soPhongNgu: {
      type: Number,
      default: null,
    },
    soPhongTam: {
      type: Number,
      default: null,
    },
    soKhachToiDa: {
      type: Number,
      default: 1,
    },
    diaChi: {
      type: String,
      required: true,
    },
    moTa: {
      type: String,
      default: null,
    },
    danhSachHinhAnh: {
      type: [String],
      default: [],
    },
    tienIch: utilitySchema,
    giaTien: {
      type: Number,
      require: true,
    },
    danhSachNgayDuocBook: {
      type: [Date],
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

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
