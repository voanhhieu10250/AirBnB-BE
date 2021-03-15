const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const generateMessage = require("./generateMessage");
const checkKeyValue = require("./checkKeyValue");
const devError = require("./devError");

const jwtSignature = config.get("jwtSignature");

const auth = (roles) => async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSignature);
    console.log("Chay qua day");
    const emptyKeys = checkKeyValue({
      _id: decoded._id,
      username: decoded.username,
      role: decoded.role,
    });
    if (emptyKeys.length > 0) return generateMessage("Dữ liệu không hợp lệ");

    const allowRoles = roles || ["QuanTri", "NguoiDung"];

    const foundedUser = await User.findOne({
      _id: decoded._id,
      tokens: token,
      role: { $in: allowRoles },
    });
    if (!foundedUser)
      return generateMessage(
        "Bạn không có quyền thực hiện chức năng này",
        res,
        401
      );

    req.user = foundedUser;
    req.token = token;

    next();
  } catch (error) {
    // return generateMessage(
    //   "Bạn không có quyền thực hiện chức năng này",
    //   res,
    //   401
    // );
    // devError()
  }
};

module.exports = { auth };
