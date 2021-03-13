const mongoose = require("mongoose");
const { utilitySchema } = require("./utility");

const addressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  province: { type: String, default: null },
  street: { type: String, default: null },
});

const rulesSchema = new mongoose.Schema({
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date, required: true },
  petsAllowed: { type: Boolean, default: false },
  smokingAllowed: { type: Boolean, default: false },
  partiesAllowed: { type: Boolean, default: false },
  longTermStays: { type: Boolean, default: false },
});

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyType: {
      type: String,
      default: "ToanBoNha",
    },
    bedrooms: {
      type: Number,
      default: null,
    },
    bathrooms: {
      type: Number,
      default: null,
    },
    guestsMax: {
      type: Number,
      required: true,
    },
    address: addressSchema,
    description: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    utilities: { type: utilitySchema, default: null },
    rules: rulesSchema,
    pricePerDay: {
      type: Number,
      require: true,
    },
    serviceFee: {
      type: Number,
      default: null,
    },
    listOfReservation: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Reservation",
      default: [],
    },
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
      default: [],
    },
    longitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
