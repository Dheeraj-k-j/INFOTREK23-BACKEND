// ----GLOBAL err HANDLER----
// err handling middleware (err first callback function, express knows this is the err handling middleware)

const AppError = require("../utils/appError");

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.error('error- ',err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "JsonWebTokenError") {
      err = new AppError("Authentication failed! Log in again.", 401);
    }
    if (err.name === "TokenExpiredError") {
      err = new AppError("Token Expired! Log in again.", 401);
    }
    sendProdError(err, res);
  }
};
