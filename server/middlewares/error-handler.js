const { StatusCodes } = require("http-status-codes"); // Optional: Use for standard status codes

const errorHandlerMiddleware = (err, req, res, next) => {
  // Set default error status code and message
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, // Use custom status or 500
    msg: err.message || "Something went wrong, please try again later",
  };

  // Handle Mongoose Validation Errors (e.g., required fields missing)
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST; // 400
  }

  // Handle Mongoose Duplicate Key Errors (e.g., unique email constraint)
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST; // 400
  }

  // Handle Mongoose Cast Errors (e.g., invalid ObjectId format)
  if (err.name === "CastError") {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND; // 404
  }

  // Log the full error in development for debugging (optional)
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR STACK:", err.stack); // Log the stack trace
  }

  // Send the JSON response
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
