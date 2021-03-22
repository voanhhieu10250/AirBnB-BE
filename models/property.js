const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    group: { type: String, default: "gp01" },
    cityCode: { type: String, default: "all" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalType: { type: String, default: "PhongRieng" },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    amountOfGuest: { type: Number, default: 1 },
    address: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    images: { type: [String], default: [] },
    utilities: {
      hasTV: { type: Boolean, default: false },
      hasKitchen: { type: Boolean, default: false },
      hasAirConditioning: { type: Boolean, default: false },
      hasInternet: { type: Boolean, default: false },
      hasSwimmingPool: { type: Boolean, default: false },
      hasFreeParking: { type: Boolean, default: false },
      hasWasher: { type: Boolean, default: false },
      hasMicrowave: { type: Boolean, default: false },
      hasRefrigerator: { type: Boolean, default: false },
    },
    rules: {
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      partiesAllowed: { type: Boolean, default: false },
      longTermStaysAllowed: { type: Boolean, default: true },
      suitableForChildren: { type: Boolean, default: true },
      customRules: { type: [String], default: [] },
    },
    requireForBooker: {
      checkInTime: {
        from: { type: String, default: "3PM" },
        to: { type: String, default: "5PM" },
      },
      checkOutTime: { type: String, default: "1PM" },
      stayDays: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      identificationPapers: { type: Boolean, default: false },
      hasNoBadReview: { type: Boolean, default: false },
      customRequire: { type: [String], default: [] },
    },
    noticeAbout: {
      stairs: { type: String, default: null },
      noise: { type: String, default: null },
      petInTheHouse: { type: String, default: null },
      parkingSpace: { type: String, default: null },
      sharedSpace: { type: String, default: null },
      cameras: { type: String, default: null },
    },
    pricePerDay: { type: Number, required: true },
    serviceFee: { type: Number, default: null },
    coordinates: {
      longitude: { type: Number, default: null },
      latitude: { type: Number, default: null },
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
  },
  { timestamps: true }
);

propertySchema.methods.toJSON = function () {
  const property = this.toObject();
  delete property._id;
  return property;
};

propertySchema.pre("save", async function (next) {
  this.group = this.group.toLowerCase();
  next();
});

const Property = mongoose.model("Property", propertySchema);

module.exports = { Property };
