const { cloudinary } = require("../config/cloudinary");

// Upload post image
const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file provided" });
    }

    // Image is already uploaded to Cloudinary via multer-storage-cloudinary
    res.status(200).json({
      imageUrl: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Upload profile image or video
const uploadProfileMediaController = async (req, res) => {
  // Renamed for clarity
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No media file provided" });
    }

    // Update user profile with new media URL
    // Ensure User model is required correctly if not already
    const User = require("../models/user");
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: req.file.path }, // Update the correct field
      { new: true }
    ).select("-password");

    res.status(200).json({
      user, // Send back updated user
      mediaUrl: req.file.path, // Use a more generic key 'mediaUrl'
      public_id: req.file.filename, // Keep public_id if needed for deletion
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ msg: "No public ID provided" });
    }

    await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ msg: "Image successfully deleted" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  uploadPostImage,
  uploadProfileImage: uploadProfileMediaController, // Export with the original name if routes expect it
  deleteImage,
};
