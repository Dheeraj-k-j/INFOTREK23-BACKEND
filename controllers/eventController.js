const Event = require("../Models/Events");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// exports.checkId = (req, res, next, val) => {
//   // Write code to check param id here for event
// }

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const allEvents = await Event.find();
  res.status(200).json({
    status: "success",
    result: allEvents.length,
    data: {
      Events: allEvents,
    },
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if(!event){
    return next(new AppError("Event not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      Events: event,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const newEvent = await Event.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      newEvent
    }
  })
});

exports.updateEvent = catchAsync(async (req, res, next) => {});
exports.deleteEvent = catchAsync(async (req, res, next) => {});

exports.checkEventBody = (req, res, next) => {
  // console.log(req.body);
  if (!req.body.name || !req.body.description){
    return res.status(400).json({
      status: "Failed",
      message: "Fill all fields completely in the form!"
    });
  }
  next();
};