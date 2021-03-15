const checkFilled = require("../Helpers/checkFilled");
const devError = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const jwtSignature = config.get("jwtSignature");

const userSignUp = async (req, res) => {
  const { username, password, name, email, phone } = req.body;
  try {
    // for (const item in (obj = { username, password, email })) {
    //   if (!obj[item])
    //     return res.status(400).send({ message: `Vui lòng nhập ${item}` });
    // }
    const emptyKeys = checkFilled({ username, password, email });
    if (emptyKeys.length > 0)
      return generateMessage(`Vui lòng nhập ${emptyKeys[0]}`, res);

    const foundedUser = await User.findOne().or([{ username }, { email }]);
    if (foundedUser)
      return res
        .status(400)
        .send({ message: "Username hoặc email đã tồn tại. Vui lòng thử lại." });
    if (phone && !phone.match(/^\d+$/))
      return res.status(400).send({
        message: "Số điện thoại chỉ nên chứa số. Vui lòng thử lại.",
      });
    const newUser = new User({
      username,
      password,
      email,
      name: name ? name : username,
      phone,
      role: "NguoiDung",
    });
    const result = await newUser.save();

    res.send({
      message: "Đăng ký thành công.",
      username: result.username,
      email: result.email,
      name: result.name,
      role: result.role,
      phone: result.phone,
    });
  } catch (err) {
    devError(err, res);
  }
};

const adminSignUp = async (req, res) => {
  const { username, password, name, email, phone } = req.body;
  try {
    const emptyKeys = checkFilled({ username, password, email });
    if (emptyKeys.length > 0)
      return generateMessage(`Vui lòng nhập ${emptyKeys[0]}.`, res);

    const foundedUser = await User.findOne().or([{ username }, { email }]);
    if (foundedUser)
      return generateMessage(
        "Username hoặc email đã tồn tại. Vui lòng thử lại.",
        res
      );
    if (phone && !phone.match(/^\d+$/))
      return generateMessage(
        "Số điện thoại chỉ nên chứa số. Vui lòng thử lại.",
        res
      );
    const newUser = new User({
      username,
      password,
      email,
      name: name ? name : username,
      phone,
      role: "QuanTri",
    });
    const result = await newUser.save();

    res.send({
      message: "Đăng ký thành công.",
      username: result.username,
      email: result.email,
      name: result.name,
      role: result.role,
      phone: result.phone,
    });
  } catch (error) {
    devError(error, res);
  }
};

const signIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return generateMessage("Vui lòng nhập đầy đủ thông tin.", res);
    const foundedUser = await User.findOne({ username });
    if (!foundedUser) return generateMessage("Tài khoản không đúng", res, 401);

    const isMatch = await bcrypt.compare(password, foundedUser.password);
    if (!isMatch) return generateMessage("Mật khẩu không đúng", res, 401);

    //generate token
    const token = await jwt.sign(
      {
        _id: foundedUser._id,
        role: foundedUser.role,
        username: foundedUser.username,
      },
      jwtSignature,
      { expiresIn: 86400 }
    );

    foundedUser.tokens.push(token);
    await foundedUser.save();
    res.send({ message: "Đăng nhập thành công.", token });
  } catch (err) {
    devError(err, res);
  }
};

const userInfo = async (req, res) => {};

module.exports = { userSignUp, adminSignUp, signIn };
