const User = require("../Models/User");
const Event = require("../Models/Events")
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError")

// exports.checkId = (req, res, next, val) => {
//   // Write code to check param id here for user
// }

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: "success",
    result: allUsers.length,
    data: {
      users: allUsers,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // const user = await User.findById(req.params.id);

  // if(!user){
  //   return next(new AppError("User not found!", 404));
  // }

  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {});

exports.updateUser = catchAsync(async (req, res, next) => {});

exports.deleteUser = catchAsync(async (req, res, next) => {});

// Api to register for event
exports.register = catchAsync(async (req, res, next) => {
  const eventId = req.body.eventId;
  const event = await Event.findById(eventId);
  if(!event){
    return next(new AppError("Event you are registering for is not found!", 404));
  }

  const user = await User.findById(req.params.id);
  user.registeredEvent.push(eventId);
  await user.save({ validateBeforeSave: false }); // confirmPassword is required so to avoid validation of required data fields

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
})

exports.checkUserBody = (req, res, next) => {
  // console.log(req.body);
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.confirmPassword){
    return res.status(400).json({
      status: "Failed",
      message: "Fill all fields completely in the form!"
    });
  }
  next();
};
