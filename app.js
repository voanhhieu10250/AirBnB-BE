require("./db/connect");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || config.get("port");

app.use(bodyParser.json());

app.post("/QuanLyNguoiDung/DangKy", async (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const foundedUser = await User.findOne().or([{ username }, { email }]);
    if (foundedUser)
      return res.status(400).send({ message: "User already existed" });
    const newUser = new User({
      username,
      password,
      email,
      name,
    });
    let result = await newUser.save();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Backend's problem" });
  }
});

app.listen(port, () => {
  console.log("listening...");
});
