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
    default: function () {
      return `${this.code} | ${this.name}`;
    },
  },
  listHostedProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],
  defaultCity: {
    type: Boolean,
    default: false,
  },
});

citySchema.methods.toJSON = function () {
  const city = this.toObject();
  delete city._id;
  delete city.defaultCity;
  return city;
};

const City = mongoose.model("City", citySchema);

module.exports = City;
