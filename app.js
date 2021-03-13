require("./db/connect");
const express = require("express");
const config = require("config");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || config.get("port");

app.use(bodyParser.json());

app.listen(port, () => {
  console.log("listening...");
});
