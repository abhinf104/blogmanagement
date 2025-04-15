const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth"); // Assuming auth middleware exists
const {
  updateProfile,
  getUserProfile, // Public profile by ID
  getAllUsers,
} = require("../controllers/user-controller");

// Get the currently logged-in user's profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    // req.user is attached by the authenticate middleware
    const user = await require("../models/user")
      .findById(req.user.userId)
      .select("-password");
    if (!user) {
      // Should not happen if token is valid, but good practice
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update the currently logged-in user's profile
router.put("/profile", authenticate, updateProfile);

// Get a user's profile by ID (publicly accessible, maybe restrict later?)
router.get("/:id", getUserProfile);

// Admin: Get all users
router.get("/", authenticate, authorize("admin"), getAllUsers); // Protect this route

module.exports = router;
