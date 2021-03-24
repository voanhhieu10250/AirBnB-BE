const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const generateMessage = require("../Helpers/generateMessage");
const getEmptyKeys = require("../Helpers/getEmptyKeys");
const devError = require("../Helpers/devError");

const jwtSignature = config.get("jwtSignature");

const auth = (roles) => async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return generateMessage("Lỗi xác thực", res, 401);
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSignature);

    const emptyKeys = getEmptyKeys({
      _id: decoded._id,
      username: decoded.username,
      role: decoded.role,
    });
    if (emptyKeys.length > 0)
      return generateMessage("Dữ liệu không hợp lệ", res);

    const allowRoles = roles || ["Admin", "User"];

    const foundedUser = await User.findOne({
      _id: decoded._id,
      tokens: token,
      role: { $in: allowRoles },
      isActive: true,
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
