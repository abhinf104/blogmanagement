const User = require("../models/user");

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Create an update object with only the fields that were sent
    const updateObject = {};

    // Only include fields that were provided in the request
    if (req.body.name) updateObject.name = req.body.name;
    if (req.body.bio !== undefined) updateObject.bio = req.body.bio; // Allow empty string
    // Don't allow email update unless you have specific validation/verification
    // if (req.body.email) updateObject.email = req.body.email;

    // Only update profile picture if it was provided
    if (req.body.profilePicture) {
      updateObject.profilePicture = req.body.profilePicture;
    }

    // Add validation here if needed

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateObject,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get user's own profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: `User profile not found` });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get user profile by ID (public)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: `No user with id: ${req.params.id}` });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  updateProfile,
  getProfile,
  getUserProfile,
  getAllUsers,
};
