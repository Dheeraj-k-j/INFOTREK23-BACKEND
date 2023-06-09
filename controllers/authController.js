const User = require("../Models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // User entered email & Password
  const { email, password } = req.body;
  // console.log({email, password});

  // Check whether feild are empty
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  // console.log(user);
  if (!user) {
    return next(new AppError("No user found with this email!", 401));
  }

  const userIsValid = await user.checkPassword(password, user.password);
  if (!userIsValid) {
    return next(new AppError("Incorrect Password!", 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // console.log(req.headers);
  // 1. Check whether JWT exist or not.
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("You are not logged in!", 401));
  }

  const token = req.headers.authorization.split(" ")[1];
  console.log(token);

  // 2. Validate the token.(Validation, Expiration, User Existance and password change)
  // Error handled by the global error handling middleware.
  const decode = await promisify(jwt.verify)(token, process.env.JWT_KEY);

  const freshUser = await User.findById(decode.id);
  if (!freshUser)
    return next(new AppError("User no longer exist. Sign up again!", 401));
  if (freshUser.changedPasswordAfterJWT(decode.iat))
    return next(new AppError("Token Expired! Log in again.", 401));

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, err) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission to perform this action!", 403)
      );
    next();
  };
};
