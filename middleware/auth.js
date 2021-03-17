const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const generateMessage = require("../Helpers/generateMessage");
const checkKeyValue = require("../Helpers/checkKeyValue");
const devError = require("../Helpers/devError");

const jwtSignature = config.get("jwtSignature");

const auth = (roles) => async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, jwtSignature);

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
    if (error.message === "jwt expired")
      return generateMessage(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
        res
      );
    else if (error.message === "jwt malformed")
      return generateMessage(
        "Bạn không có quyền thực hiện chức năng này.",
        res,
        403,
        { error }
      );
    return devError(error, res);
  }
};

module.exports = { auth };