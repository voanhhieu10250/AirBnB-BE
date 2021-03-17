require("./db/connect");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const {
  userSignUp,
  adminSignUp,
  signIn,
  userInfo,
} = require("./controllers/auth");
const { auth } = require("./middleware/auth");

const app = express();
const port = process.env.PORT || config.get("port");

app.use(bodyParser.json());

app.post("/QuanLyNguoiDung/DangKy", userSignUp);

app.post(
  "/QuanLyNguoiDung/DangKyNguoiDungQuanTri",
  auth(["QuanTri"]),
  adminSignUp
);

app.post("/QuanLyNguoiDung/DangNhap", signIn);

app.get("/QuanLyNguoiDung/ThongTinTaiKhoan", auth(), userInfo);

app.listen(port, () => {
  console.log("listening...");
});
