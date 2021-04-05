require("./db/connect");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");
const uploadRouter = require("./routers/upload");
const userRouter = require("./routers/user");
const reviewRouter = require("./routers/review");
const reservationRouter = require("./routers/reservation");
const propertyRouter = require("./routers/property");
const districtRouter = require("./routers/district");
const cityRouter = require("./routers/city");
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

app.use(reviewRouter);

app.use(reservationRouter);

app.use(propertyRouter);

app.use(districtRouter);

app.use(cityRouter);

app.listen(port, () => {
  console.log("listening...");
});
