const mongoose = require("mongoose");
const moment = require("moment");

const reservateSchema = new mongoose.Schema(
  {
    booker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      default: null,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
reservateSchema.methods.toJSON = function () {
  const reservate = this.toObject();
  // delete reservate.isActive;
  reservate.createdAt = moment(reservate.createdAt).utc().format();
  reservate.updatedAt = moment(reservate.updatedAt).utc().format();
  return reservate;
};
const Reservation = mongoose.model("Reservation", reservateSchema);

module.exports = Reservation;
