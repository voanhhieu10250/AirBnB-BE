const moment = require("moment");
const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    group: {
      type: String,
      default: "gp01",
      index: true,
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
    username: { type: String, required: true, index: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    name: { type: String, required: true },
    role: { type: String, default: "User", enum: ["User", "Admin"] },
    description: { type: String, default: null },
    hostedList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    bookedList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    avatar: { type: String, default: null },
    tokens: { type: [String], default: [] },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    manageReservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user._id;
  // delete user.password;
  delete user.tokens;
  delete user.isActive;
  user.createdAt = moment(user.createdAt).utc().format();
  user.updatedAt = moment(user.updatedAt).utc().format();
  return user;
};

userSchema.pre("save", async function (next) {
  // if (this.isModified("password"))
  //   this.password = await bcrypt.hash(this.password, 7);
  this.group = this.group.toLowerCase();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
