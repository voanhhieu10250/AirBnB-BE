const mongoose = require("mongoose");
const moment = require("moment");

const propertySchema = new mongoose.Schema(
  {
    group: {
      type: String,
      default: "gp01",
      index: true,
      lowercase: true,
      enum: [
        "gp00",
        "gp01",
        "gp02",
        "gp03",
        "gp04",
        "gp05",
        "gp06",
        "gp07",
        "gp08",
        "gp09",
        "gp10",
        "gp11",
        "gp12",
        "gp13",
        "gp14",
        "gp15",
      ],
    },
    districtCode: { type: String, required: true, index: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalType: {
      type: String,
      default: "PrivateRoom",
      enum: ["PrivateRoom", "EntirePlace", "SharedRoom"],
    },
    roomsAndBeds: {
      beds: { type: Number, default: 1 },
      bedrooms: { type: Number, default: 1 },
      bathrooms: { type: Number, default: 1 },
    },
    amountOfGuest: { type: Number, default: 1 },
    address: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    images: { type: [String], default: [] },
    amenities: {
      television: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      washer: { type: Boolean, default: false },
      microwave: { type: Boolean, default: false },
      refrigerator: { type: Boolean, default: false },
      selfCheckIn: { type: Boolean, default: false },
      smokeAlarm: { type: Boolean, default: false },
      hangers: { type: Boolean, default: false },
      dryer: { type: Boolean, default: false },
    },
    facilities: {
      hotTub: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      freeParking: { type: Boolean, default: false },
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
      checkInTime: { type: String, default: "3PM", uppercase: true },
      checkOutTime: { type: String, default: "1PM", uppercase: true },
      stayDays: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      identificationPapers: { type: Boolean, default: false },
      hasNoBadReview: { type: Boolean, default: false },
      customRequire: { type: [String], default: [] },
    },
    noticeAbout: {
      stairs: { type: String, default: null, trim: true },
      noise: { type: String, default: null, trim: true },
      petInTheHouse: { type: String, default: null, trim: true },
      parkingSpace: { type: String, default: null, trim: true },
      sharedSpace: { type: String, default: null, trim: true },
      cameras: { type: String, default: null, trim: true },
    },
    pricePerDay: { type: Number, required: true },
    serviceFee: { type: Number, default: null },
    coords: {
      lng: { type: Number, required: true },
      lat: { type: Number, required: true },
    },
    listOfReservation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    rating: {
      scores: {
        final: { type: Number, default: 0 },
        cleanliness: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        location: { type: Number, default: 0 },
        checkIn: { type: Number, default: 0 },
      },
      totalReviews: {
        type: Number,
        default: function () {
          return this.rating.reviews.length;
        },
      },
      reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
      ],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

propertySchema.methods.toJSON = function () {
  const property = this.toObject();
  delete property.isActive;
  property.createdAt = moment(property.createdAt).utc().format();
  property.updatedAt = moment(property.updatedAt).utc().format();
  return property;
};

const Property = mongoose.model("Property", propertySchema);

module.exports = { Property };
