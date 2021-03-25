const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    group: {
      type: String,
      default: "gp01",
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
    cityCode: { type: String, required: true },
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
    address: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    images: { type: [String], default: [] },
    amenities: {
      TV: { type: Boolean, default: false },
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
      reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
      ],
    },
    isPublished: {
      type: Boolean,
      default: false,
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
  return property;
};

propertySchema.pre("save", async function (next) {
  this.group = this.group.toLowerCase();
  next();
});

const Property = mongoose.model("Property", propertySchema);

module.exports = { Property };
