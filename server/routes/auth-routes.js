const express = require("express");
const authrouter = express.Router();

const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/auth-controller");
const { authenticate } = require("../middlewares/auth");

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.get("/logout", logout);
authrouter.get("/me", authenticate, getCurrentUser);

module.exports = authrouter;
