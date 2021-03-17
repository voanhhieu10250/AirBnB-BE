const express = require("express");
const {
  userSignUp,
  adminSignUp,
  signIn,
  userInfo,
  userSignout,
  uploadAvatar,
  getAllUser,
  getListRolesOfUser,
  getUsersPerPage,
  updateUser,
  deleteUser,
} = require("../controllers/user");
const { auth } = require("../middleware/auth");
const { upload, uploadCallBack } = require("../middleware/uploadFile");

// ------------------------------------------------------------------

const router = express.Router();

router.post("/QuanLyNguoiDung/DangKy", userSignUp);

router.post(
  "/QuanLyNguoiDung/DangKyNguoiDungQuanTri",
  auth(["QuanTri"]),
  adminSignUp
);

router.post("/QuanLyNguoiDung/DangNhap", signIn);

router.get("/QuanLyNguoiDung/ThongTinTaiKhoan" /*, auth()*/, userInfo);

router.post("/QuanLyNguoiDung/DangXuat", auth(), userSignout);

router.post(
  "/QuanLyNguoiDung/UploadAvatar",
  auth(),
  upload(uploadCallBack.single("avatar")),
  uploadAvatar
);

router.get("/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung", getListRolesOfUser);

router.get("/QuanLyNguoiDung/LayDanhSachNguoiDung", getAllUser);

router.get("/QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang", getUsersPerPage);

router.put("/QuanLyNguoiDung/CapNhatThongTinNguoiDung", auth(), updateUser);

router.delete("/QuanLyNguoiDung/XoaNguoiDung", auth(), deleteUser);

module.exports = router;
