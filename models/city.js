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
  searchKey: {
    type: String,
    default: null,
  },
  listHostedProperties: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Property",
    default: [],
  },
});

citySchema.methods.toJSON = function () {
  const city = this.toObject();
  delete city._id;
  return city;
};

const City = mongoose.model("City", citySchema);

module.exports = City;
