const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const generateMessage = require("../Helpers/generateMessage");
const getEmptyKeys = require("../Helpers/getEmptyKeys");
const { devError } = require("../Helpers/devError");

const jwtSignature = config.get("jwtSignature");

const auth = (roles) => async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return generateMessage("You are not authorized", res, 401);
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwtSignature);

    const emptyKeys = getEmptyKeys({
      _id: decoded._id,
      username: decoded.username,
      role: decoded.role,
    });
    if (emptyKeys.length > 0)
      return generateMessage("Something is not right", res, 401);

    const allowRoles = roles || ["Admin", "User"];

    const foundedUser = await User.findOne({
      _id: decoded._id,
      tokens: token,
      role: { $in: allowRoles },
      isActive: true,
    });
    if (!foundedUser)
      return generateMessage(
        "You don't have the permission do this functionality.",
        res,
        401
      );

    req.user = foundedUser;
    req.token = token;

    next();
  } catch (error) {
    if (error.message === "jwt expired")
      return generateMessage(
        "The login session has expired. Please log in again.",
        res
      );
    else if (error.message === "jwt malformed")
      return generateMessage(
        "You don't have the permission do this functionality.",
        res,
        403
      );
    return devError(error, res);
  }
};

module.exports = { auth };
