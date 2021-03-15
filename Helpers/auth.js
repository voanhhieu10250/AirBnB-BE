const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const generateMessage = require("./generateMessage");

const jwtSignature = config.get("jwtSignature");

const auth = (roles) => async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSignature);

    const allowRoles = roles || ["QuanTri", "NguoiDung"];

    const foundedUser = await User.findOne({
      _id: decoded._id,
      tokens: token,
      role: { $in: allowRoles },
    });

    if (!foundedUser) return generateMessage("Bạn không có quyền truy cập");
  } catch (error) {
    generateMessage("Bạn không có quyền truy cập.", res, 401);
  }
};
