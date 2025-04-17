const { StatusCodes } = require("http-status-codes");

// Middleware function to handle requests to non-existent routes
const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send("Route does not exist");
};

module.exports = notFound;
