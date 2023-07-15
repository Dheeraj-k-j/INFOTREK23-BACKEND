const mongoose = require("mongoose");
const { Schema } = mongoose;
const Event = require("./Events");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const { use } = require("../routes/userRoutes");

const userSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  name: {
    type: String,
    required: [true, "A user must have some name"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "member"],
    default: "user",
  },
  registeredEvent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
});

// Instance methods of usser model

userSchema.methods.checkPassword = async function (
  providedPassword,
  actualPassword
) {
  return await bcrypt.compare(providedPassword, actualPassword);
};

userSchema.pre("save", async function (next) {
  // Returns if password is not modified
  if (!this.isModified("password")) return next();
  // Hashing the password with random salt and cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Don't need confirmPassword in DB
  this.confirmPassword = undefined;
  this.passwordChangedAt = Date.now()-1000;
  next();
});

userSchema.methods.changedPasswordAfterJWT = function (JWTiat) {
  const lastUpdateTime = this.passwordChangedAt.getDate();
  return JWTiat < lastUpdateTime;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiresAt = Date.now() + 600000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
