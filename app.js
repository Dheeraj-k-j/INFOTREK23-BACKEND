// -----------------    IMPORTS   ----------------------------

// NPM Module Imports
const express = require("express");  
const mongoose = require("mongoose");
const morgan = require('morgan');

// Local Imports
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");



// -----------------    MIDDLEWARES   ----------------------------

const app = express();

const DB = process.env.DB_URL;
mongoose.connect(DB, { useNewUrlParser: true }).then((con) => {
  console.log("DB Connection is established");
}); // returns a promise

app.use(express.json());  // Middleware to parse JSON-encoded request body
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));  // Use of Morgan middleware for logging



// -----------------    ROUTE HANDLING (API ENDPOINTS)   ----------------------------

// Route Mounting
app.use("/users", userRouter);
app.use("/events", eventRouter);

// Home route
app.get("/", (req, res) => {
  res.status(200).send("Hi I'm from app!");
});

// Handling unhandled routes (Define at the end when no handles catches it)
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



// --------------------  GLOBAL ERROR HANDLER MIDDLEWARE   --------------------

// If any middleware calles next(err) then this middleware will be called.
app.use(globalErrorHandler);

// Exporting our express app
module.exports = app;