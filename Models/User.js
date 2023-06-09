const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");

const userSchema = new mongoose.Schema({
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
});

userSchema.methods.checkPassword = async function(providedPassword, actualPassword){
  return await bcrypt.compare(providedPassword, actualPassword);
};

userSchema.pre("save", async function (next) {
  // Returns if password is not modified
  if (!this.isModified("password")) return next();

  // Hashing the password with random salt and cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Don't need confirmPassword in DB
  this.confirmPassword = undefined;

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
