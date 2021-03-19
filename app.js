require("./db/connect");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const userRouter = require("./routers/user");
const uploadRouter = require("./routers/upload");
const propertyRouter = require("./routers/property");
const path = require("path");
const cors = require("cors");

//------------------------------------------------------

const app = express();
const port = process.env.PORT || config.get("port");

app.use(cors());

app.use(bodyParser.json());

const imagesFolderPath = path.join(__dirname, "images");
app.use("/image", express.static(imagesFolderPath));

app.use(userRouter);

app.use(uploadRouter);

app.use(propertyRouter);

app.listen(port, () => {
  console.log("listening...");
});
