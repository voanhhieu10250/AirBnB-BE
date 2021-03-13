const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    name: { type: String, required: true },
    role: { type: String, default: "user" },
    description: { type: String, default: null },
    hostedList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Property",
      default: [],
    },
    bookedList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Reservation",
      default: [],
    },
    avatar: { type: String, default: null },
    tokens: { type: [String], default: [] },
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

const User = mongoose.model("User", userSchema);

module.exports = User;
