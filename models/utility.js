const mongoose = require("mongoose");

const utilitySchema = new mongoose.Schema({
  hasTV: {
    type: Boolean,
    default: false,
  },
  hasKitchen: {
    type: Boolean,
    default: false,
  },
  hasAirConditioning: {
    type: Boolean,
    default: false,
  },
  hasInternet: {
    type: Boolean,
    default: false,
  },
  hasSwimmingPool: {
    type: Boolean,
    default: false,
  },
  hasFreeParking: {
    type: Boolean,
    default: false,
  },
  hasWasher: {
    type: Boolean,
    default: false,
  },
  hasMicrowave: {
    type: Boolean,
    default: false,
  },
  hasRefrigerator: {
    type: Boolean,
    default: false,
  },
});

const Utility = mongoose.model("Utilities", utilitySchema);

module.exports = { Utility, utilitySchema };
