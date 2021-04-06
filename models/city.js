const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  listOfDistricts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  ],
  defaultCity: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

citySchema.methods.toJSON = function () {
  const city = this.toObject();
  delete city._id;
  // delete city.defaultCity;
  delete city.isActive;
  return city;
};

const City = mongoose.model("City", citySchema);

module.exports = City;
