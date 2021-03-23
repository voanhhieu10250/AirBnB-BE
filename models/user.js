const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    group: { type: String, default: "gp01" },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    name: { type: String, required: true },
    role: { type: String, default: "NguoiDung" },
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
    wishList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Property",
      default: [],
    },
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
