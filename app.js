// -----------------    IMPORTS   ----------------------------

// NPM Module Imports
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');


// Local Imports
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");



// -----------------    MIDDLEWARES   ----------------------------

const DB = process.env.DB_URL;
mongoose.connect(DB, { useNewUrlParser: true }).then((con) => {
  console.log("DB Connection is established");
}); // returns a promise

// To set HTTP security Headers
app.use(helmet());

app.use(express.json({limit:'50KB'}));  // Middleware to parse JSON-encoded request body
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));  // Use of Morgan middleware for logging

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "To many requests from your IP. Please try again later!"
});
app.use(limiter);

// NOSQL injection protection
app.use(mongoSanitize());

// XSS Protection
app.use(xss());

// Enable CORS for all routes
app.use(cors());


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