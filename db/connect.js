const mongoose = require("mongoose");
const config = require("config");

const dbUrl = config.get("dbUrl");

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("mongodb atlas connected!");
  })
  .catch(console.log);
