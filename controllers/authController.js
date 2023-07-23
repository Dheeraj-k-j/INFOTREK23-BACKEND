const User = require("../Models/User");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = ture;

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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
  
  createAndSendToken(newUser, 201, res);
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

  createAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // const userQuery = ;
  const user = await User.findOne({ email: req.body.email }).exec();
  if (!user) return next(new AppError("No user exist with this email!", 403));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // console.log(resetToken);

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your reset password token is valid for 10 minutes.",
      message: `This mail is from INFOTREK-ACM. Change your password by entering the following token during reset password -"${resetToken}" , If you didn't request this email please ignore it.`,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to you email.",
    });
  } catch (Error) {
    user.resetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;

    return next(
      new AppError(
        "There was an error in sending the email! Please try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError("Either token is invalid or expired!", 500));

  user.password = req.body.password;
  user.confirmPassword = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const oldPassword = req.body.oldPassword;

  const userIsValid = await user.checkPassword(oldPassword, user.password);
  if (!userIsValid) {
    return next(new AppError("Incorrect Password!", 401));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();

  createAndSendToken(user, 200, res);
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
  // console.log(token);

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
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission to perform this action!", 403)
      );
    next();
  };
};
