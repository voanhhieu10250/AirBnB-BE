const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    index: true,
  },
  cityCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  listOfProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],
  defaultDistrict: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

districtSchema.methods.toJSON = function () {
  const district = this.toObject();
  delete district._id;
  delete district.defaultDistrict;
  delete district.isActive;
  return district;
};

const District = mongoose.model("District", districtSchema);

module.exports = District;
