const mongoose = require("mongoose");
const { utilitySchema } = require("./utility");

const rulesSchema = new mongoose.Schema({
  petsAllowed: { type: Boolean, default: false },
  smokingAllowed: { type: Boolean, default: false },
  partiesAllowed: { type: Boolean, default: false },
  longTermStays: { type: Boolean, default: true },
  suitableForChildren: { type: Boolean, default: true },
  customRules: {
    type: [String],
    default: [],
  },
});

const detailSchema = new mongoose.Schema({
  stairsDetail: { type: String, default: null },
  noiseDetail: { type: String, default: null },
  petInTheHouse: { type: String, default: null },
  parkingSpaceDetail: { type: String, default: null },
  sharedSpace: { type: String, default: null },
  camerasDetail: { type: String, default: null },
});

const requireSchema = new mongoose.Schema({
  checkInTime: {
    type: Object,
    default: {
      from: "3PM",
      to: "5PM",
    },
  },
  checkOutTime: { type: String, default: "1PM" },
  stayDays: {
    type: Object,
    default: {
      min: 0,
      max: 0,
    },
  },
  identificationPapers: { type: Boolean, default: false },
  hasNoBadReview: { type: Boolean, default: false },
  customRequire: { type: [String], default: [] },
});

const propertySchema = new mongoose.Schema(
  {
    group: { type: String, default: "gp01" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalType: { type: String, default: "ToanBoNha" },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    amountOfGuest: { type: Number, default: 1 },
    address: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    images: { type: [String], default: [] },
    utilities: utilitySchema,
    rules: rulesSchema,
    requireForBooker: requireSchema,
    moreDetails: detailSchema,
    pricePerDay: { type: Number, required: true },
    serviceFee: { type: Number, default: null },
    longitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
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
  },
  { timestamps: true }
);

propertySchema.methods.toJSON = function () {
  const property = this.toObject();
  delete property._id;
  delete property.requireForBooker._id;
  delete property.utilities._id;
  delete property.rules._id;
  delete property.moreDetails._id;
  return property;
};

propertySchema.pre("save", async function (next) {
  this.group = this.group.toLowerCase();
  next();
});

const Property = mongoose.model("Property", propertySchema);
const Require = mongoose.model("Require", requireSchema);
const Detail = mongoose.model("Detail", detailSchema);
const Rule = mongoose.model("Rule", rulesSchema);

module.exports = { Property, Require, Detail, Rule };
