const getEmptyKeys = require("../Helpers/getEmptyKeys");
const fs = require("fs");
const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const User = require("../models/user");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const isKeysTypeCorrect = require("../Helpers/isKeysTypeCorrect");
const isValidGroup = require("../Helpers/validateGroup");
const { vietnameseRegexStr } = require("../Helpers/convertVietnameseStr");
const { Property } = require("../models/property");

// -------------------------------------------------------------

const jwtSignature = config.get("jwtSignature");
const tokenLiveTime = config.get("tokenLifeTime");

const userSignUp = async (req, res) => {
  const { username, password, name, email, phone, group } = req.body;
  try {
    const emptyKeys = getEmptyKeys({ username, password, email });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} id required`, res);
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
      return generateMessage("Invalid key type", res, 406);

    if (!isValidGroup(group)) return generateMessage("Invalid group", res, 406);
    const foundedUser = await User.findOne().or([
      { username, isActive: true },
      { email, isActive: true },
    ]);
    if (foundedUser)
      return res
        .status(400)
        .send({ message: "Username/email already exists. Please try again." });
    if (phone && !phone.match(/^\d+$/))
      return res.status(406).send({
        message: "Phone numbers should only contain numbers. Please try again.",
      });
    const newUser = new User({
      username,
      password,
      email,
      name: name ? name : username,
      phone,
      role: "User",
      group: group?.toLowerCase(),
    });
    const result = await newUser.save();

    res.send({
      message: "Sign Up Successfully",
      username: result.username,
      email: result.email,
      name: result.name,
      role: result.role,
      phone: result.phone,
      group: result.group,
    });
  } catch (err) {
    if (err.errors?.group?.message)
      return generateMessage(error.errors.group.message, res);
    if (err.errors?.role?.message)
      return generateMessage(error.errors.role.message, res);
    devError(err, res);
  }
};

const adminSignUp = async (req, res) => {
  const { username, password, name, email, phone, group } = req.body;
  try {
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
      return generateMessage("Invalid key type", res, 406);

    const emptyKeys = getEmptyKeys({ username, password, email });
    if (emptyKeys.length > 0)
      return generateMessage(`${emptyKeys[0]} is required`, res);
    if (!isValidGroup(group)) return generateMessage("Invalid group", res, 406);
    const foundedUser = await User.findOne().or([
      { username, isActive: true },
      { email, isActive: true },
    ]);
    if (foundedUser)
      return generateMessage(
        "Username/email already exist. Please try again.",
        res
      );
    if (phone && !phone.match(/^\d+$/))
      return generateMessage(
        "Phone numbers should only contain numbers. Please try again.",
        res,
        406
      );
    const newUser = new User({
      username,
      password,
      email,
      name: name ? name : username,
      phone,
      role: "Admin",
      group: group?.toLowerCase(),
    });
    const result = await newUser.save();

    res.send({
      message: "Sign Up Successfully",
      username: result.username,
      email: result.email,
      name: result.name,
      role: result.role,
      phone: result.phone,
    });
  } catch (error) {
    if (err.errors?.group?.message)
      return generateMessage(error.errors.group.message, res);
    if (err.errors?.role?.message)
      return generateMessage(error.errors.role.message, res);
    devError(error, res);
  }
};

const signIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return generateMessage("Username and password are required", res);
    if (!isKeysTypeCorrect("string", { username, password }))
      return generateMessage("Invalid key type", res, 406);

    const foundedUser = await User.findOne({ username, isActive: true });
    if (!foundedUser)
      return generateMessage("Cannot find this username", res, 404);

    // const isMatch = await bcrypt.compare(password, foundedUser.password);
    const isMatch = foundedUser.password === password;
    if (!isMatch) return generateMessage("Incorrect password", res, 401);

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
      message: "Signed in successfully",
      name: foundedUser.name,
      role: foundedUser.role,
      accessToken: token,
    });
  } catch (err) {
    devError(err, res);
  }
};

const userInfo = async (req, res) => {
  const { username } = req.query;
  try {
    const foundedUser = await User.findOne({
      username,
      isActive: true,
    })
      .populate({
        path: "hostedList",
        match: { isActive: true },
        select:
          "group cityCode rentalType roomsAndBeds amountOfGuest address title description pricePerDay rating.scores rating.totalReviews isPublished",
      })
      .populate({
        path: "bookedList manageReservations",
        match: { isActive: true },
        populate: { path: "booker", select: "username name -_id" },
      })
      .populate({
        path: "reviews",
        match: { isActive: true },
        select: "reviewer rating comment -_id",
        populate: {
          path: "reviewer",
          select: "username name email avatar -_id",
        },
      });
    if (!foundedUser) return generateMessage("User does not exist", res, 404);
    res.send(foundedUser);
  } catch (error) {
    devError(error, res);
  }
};

const userSignout = async (req, res) => {
  const index = req.user.tokens.findIndex((token) => token === req.token);
  if (index !== -1) {
    req.user.tokens.splice(index, 1);
    await req.user.save();
  }

  return res.send({ message: "Signed out successfully" });
};

const uploadAvatar = async (req, res) => {
  const oldAvatar = req.user.avatar.slice(
    req.user.avatar.indexOf("/image/") + 7
  );
  try {
    if (oldAvatar && fs.existsSync(`./images/${oldAvatar}`))
      fs.unlinkSync(`./images/${oldAvatar}`);

    req.user.avatar = `http://${config.get("hostUrl")}/image/${
      req.file.filename
    }`;
    const { avatar, username, email, name } = await req.user.save();
    return res.send({
      message: "Avatar successfully added",
      result: { avatar, username, email, name },
    });
  } catch (error) {
    devError(error, res);
  }
};

const getListRolesOfUser = async (req, res) => {
  res.send([
    {
      role: "User",
      desc: "Can be a host or just a regular user",
    },
    {
      role: "Admin",
      desc: "Like user but more power",
    },
  ]);
};

const getAllUser = async (req, res) => {
  let { keyWord, group = "gp01" } = req.query;
  if (!isValidGroup(group)) return generateMessage("Invalid group", res, 406);
  if (keyWord) {
    const regex = vietnameseRegexStr(keyWord);
    const users = await User.find({ group, isActive: true })
      .or([
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ])
      .select(
        "group username password email phone name role description avatar -_id"
      );
    res.send(users);
  } else {
    const users = await User.find({ group, isActive: true }).select(
      "group username password email phone name role description avatar -_id"
    );
    res.send(users);
  }
};

const getUsersPerPage = async (req, res) => {
  let { keyWord, currentPage = 1, pageSize = 20, group = "gp01" } = req.query;
  if (!isValidGroup(group)) return generateMessage("Invalid group", res, 406);
  currentPage = Number(currentPage);
  pageSize = Number(pageSize);
  if (isNaN(currentPage) || isNaN(pageSize))
    return generateMessage("Invalid type of currentPage/pageSize", res, 406);
  let listUser = null;
  let totalCount = null;
  if (keyWord) {
    const regex = vietnameseRegexStr(keyWord);
    listUser = await User.find({ group, isActive: true })
      .or([
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ])
      .select(
        "group username password email phone name role description avatar -_id"
      )
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);
    totalCount = await User.find({ group, isActive: true })
      .or([
        { username: { $regex: regex } },
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ])
      .countDocuments();
  } else {
    listUser = await User.find({ group, isActive: true })
      .select(
        "group username password email phone name role description avatar -_id"
      )
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    totalCount = await User.find({ group, isActive: true }).countDocuments();
  }

  const totalPages =
    listUser.length < pageSize ? 1 : Math.ceil(listUser.length / pageSize);

  res.send({
    currentPage,
    totalPages,
    count: listUser.length,
    totalCount,
    items: listUser,
  });
};

const updateUser = async (req, res) => {
  const { phone, name, description, email, password } = req.body;
  try {
    if (email) {
      const foundedEmail = await User.findOne({ email, isActive: true });
      if (foundedEmail && foundedEmail.username !== req.user.username)
        return generateMessage("Email already exist", res);
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
  if (!username) return generateMessage("Username?", res);
  else if (username === req.user.username || req.user.role === "Admin") {
    const user = await User.findOne({ username, isActive: true });
    if (!user) return generateMessage("Cannot find this username", res, 404);
    user.isActive = false;
    await user.save();
    if (user.hostedList.length > 0)
      await user.hostedList.forEach(async (property) => {
        const prop = await Property.findOne({ _id: property, isActive: true });
        prop.isActive = false;
        await prop.save();
      });
    return res.send({ message: "Deleted successfully" });
  } else return generateMessage("You are not authorized to do this", res, 401);
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
