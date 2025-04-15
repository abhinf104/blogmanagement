const express = require("express");
const router = express.Router();
const {
  uploadPostImage,
  uploadProfileMediaController, // Or reuse uploadProfileImage if logic is same
  deleteImage,
} = require("../controllers/imageupload-controller");

// Import the multer instance configured for profile media (images+videos)
// Adjust path/import as needed
const {
  uploadProfileMedia,
  uploadPostImage: uploadPostMiddleware,
} = require("../config/cloudinary");

const { authenticate, authorize } = require("../middlewares/auth");

// Post image routes (remains the same)
router.post(
  "/upload/post",
  authenticate,
  authorize("admin", "author"),
  uploadPostMiddleware.single("image"), // Expects 'image' field
  uploadPostImage
);

// Profile media route (Handles both image/video)
router.post(
  "/upload/profile-media", // The path your frontend is calling
  authenticate,
  uploadProfileMedia.single("media"), // Use middleware configured for 'auto' resource_type and 'media' field
  uploadProfileMediaController // Use the appropriate controller
);

// Optional: Keep the old /upload/profile route or remove/redirect it
// router.post(
//   "/upload/profile",
//   authenticate,
//   uploadProfileMedia.single("media"), // Or use older image-only middleware if separate
//   uploadProfileImage // Or use older controller
// );

// Delete image route (remains the same)
router.delete("/delete", authenticate, deleteImage);

module.exports = router;
