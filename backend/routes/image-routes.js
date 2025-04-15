const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for profile images - IMAGES ONLY
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-profiles",
    allowed_formats: ["jpg", "jpeg", "png"], // Only image formats
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Configure storage for blog post images
const postImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-posts",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  },
});

// Create multer upload instances
const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const uploadPostImage = multer({
  storage: postImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Controller functions for image uploads
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file provided" });
    }

    res.status(200).json({
      imageUrl: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

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

// Routes
router.post(
  "/upload/post",
  authenticate,
  authorize("admin", "author"),
  uploadPostImage.single("image"),
  uploadImage
);

// Simple profile image upload route - NO VIDEO SUPPORT
router.post(
  "/upload/profile",
  authenticate,
  uploadProfileImage.single("image"), // Using the field name "image"
  uploadImage
);

router.delete("/delete", authenticate, deleteImage);

module.exports = router;
