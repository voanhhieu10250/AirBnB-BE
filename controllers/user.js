const checkKeyValue = require("../Helpers/checkKeyValue");
const devError = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const User = require("../models/user");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");

// -------------------------------------------------------------

const jwtSignature = config.get("jwtSignature");
const tokenLiveTime = config.get("tokenLifeTime");

const userSignUp = async (req, res) => {
  const { username, password, name, email, phone, group } = req.body;
  try {
    const emptyKeys = checkKeyValue({ username, password, email, group });
    if (emptyKeys.length > 0)
      return generateMessage(`Vui lòng nhập ${emptyKeys[0]}`, res);
    if (
      !isKeysTypeCorrect("string", {
        username,
        password,
        name,
        email,
        phone,
        group,
      })
    )
      return generateMessage("Dữ liệu truyền vào không đúng định dạng.", res);

    if (!isValidGroup(group)) return generateMessage("Group không hợp lệ", res);
    const foundedUser = await User.findOne().or([
      { username, group },
      { email, group },
    ]);
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
      group,
    });
    const result = await newUser.save();

    res.send({
      message: "Đăng ký thành công.",
      username: result.username,
      email: result.email,
      name: result.name,
      role: result.role,
      phone: result.phone,
      group: result.group,
    });
  } catch (err) {
    devError(err, res);
  }
};

const adminSignUp = async (req, res) => {
  const { username, password, name, email, phone } = req.body;
  try {
    if (
      !isKeysTypeCorrect("string", { username, password, name, email, phone })
    )
      return generateMessage("Dữ liệu truyền vào không đúng định dạng.", res);

    const emptyKeys = checkKeyValue({ username, password, email });
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
    if (!isKeysTypeCorrect("string", { username, password }))
      return generateMessage("Dữ liệu truyền vào không đúng định dạng.", res);

    const foundedUser = await User.findOne({ username });
    if (!foundedUser) return generateMessage("Tài khoản không đúng", res, 401);

    // const isMatch = await bcrypt.compare(password, foundedUser.password);
    const isMatch = foundedUser.password === password;
    if (!isMatch) return generateMessage("Mật khẩu không đúng", res, 401);

    //generate token
    const token = jwt.sign(
      {
        _id: foundedUser._id,
        role: foundedUser.role,
        username: foundedUser.username,
      },
      jwtSignature,
      { expiresIn: tokenLiveTime }
    );

    foundedUser.tokens.push(token);
    await foundedUser.save();
    res.send({
      message: "Đăng nhập thành công.",
      username: foundedUser.username,
      name: foundedUser.name,
      email: foundedUser.email,
      phone: foundedUser.phone,
      role: foundedUser.role,
      accessToken: token,
    });
  } catch (err) {
    devError(err, res);
  }
};

const userInfo = async (req, res) => {
  // const result = req.user;
  // return res.send(result);

  const { username } = req.query;
  try {
    const foundedUser = await User.findOne({ username }).populate(
      "hostedList bookedList reviews wishList",
      "reviewer rating comment booker property startDate endDate totalPrice username propertyType reviews longitude latitude"
    );
    res.send(foundedUser);
  } catch (error) {
    devError(error, res);
  }
};

const userSignout = async (req, res) => {
  const index = req.user.tokens.findIndex((token) => token === req.token);
  req.user.tokens.splice(index, 1);
  await req.user.save();
  return res.send({ message: "Đăng xuất thành công" });
};

const uploadAvatar = async (req, res) => {
  req.user.avatar = `http://${config.get("hostUrl")}/image/${
    req.file.filename
  }`;
  const user = await req.user.save();

  const result = user.toJSON();
  delete result.password;

  return res.send({ message: "Thêm avatar thành công", result });
};

const getListRolesOfUser = async (req, res) => {
  res.send([
    {
      role: "NguoiDung",
      roleName: "Người dùng",
    },
    {
      role: "QuanTri",
      roleName: "Quản trị",
    },
  ]);
};

const getAllUser = async (req, res) => {
  const { keyWord } = req.query;
  let regex = new RegExp(keyWord, "i");
  const users = await User.find().or([
    { username: { $regex: regex } },
    { name: { $regex: regex } },
    { email: { $regex: regex } },
  ]);
  res.send(users);
};

const getUsersPerPage = async (req, res) => {
  const { keyWord, currentPage = 1, pageSize = 20 } = req.query;
  let regex = new RegExp(keyWord, "i");

  const listUser = await User.find()
    .or([
      { username: { $regex: regex } },
      { name: { $regex: regex } },
      { email: { $regex: regex } },
    ])
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  const totalCount = await User.find()
    .or([
      { username: { $regex: regex } },
      { name: { $regex: regex } },
      { email: { $regex: regex } },
    ])
    .count();

  const totalPages =
    listUser.length < pageSize ? 1 : Math.ceil(listUser.length / pageSize);

  res.send({
    currentPage,
    count: listUser.length,
    totalPages,
    totalCount,
    items: listUser,
  });
};

const updateUser = async (req, res) => {
  const { phone, name, description, email, password } = req.body;
  try {
    if (email) {
      const foundedEmail = await User.findOne({ email });
      if (foundedEmail) return generateMessage("Email đã tồn tại", res);
    }
    req.user.phone = phone || req.user.phone;
    req.user.name = name || req.user.name;
    req.user.description = description || req.user.description;
    req.user.email = email || req.user.email;
    req.user.password = password || req.user.password;

    res.send(await req.user.save());
  } catch (error) {
    devError(error, res);
  }
};

const deleteUser = async (req, res) => {
  const { username } = req.query;
  console.log("username", username);
  if (!username) return generateMessage("Username?", res);
  else if (username === req.user.username || req.user.role === "QuanTri") {
    await User.findOneAndRemove({ username });
    return res.send({ message: "Xóa thành công" });
  } else
    return generateMessage("Bạn không có quyền thực hiện chức năng này", res);
};

module.exports = {
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
};
