const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  keyName: {
    type: String,
    default: null,
  },
  listAvailableProperties: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Property",
  },
});

const City = mongoose.model("City", citySchema);

module.exports = City;
