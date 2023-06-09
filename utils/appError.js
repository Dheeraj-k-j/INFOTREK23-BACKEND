// Custom error class

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // this.status = (statusCode.startsWith("4")) ? "Failed" : "Error";
    if(400 <= statusCode < 500) this.status = "Failed";
    else this.status = "Error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
