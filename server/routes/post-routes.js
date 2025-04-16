const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getPostsByAuthor,
  getPostMetadata,
} = require("../controllers/post-controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Validation middleware
const validatePost = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("content").notEmpty().withMessage("Content is required"),
  body("categories")
    .notEmpty()
    .withMessage("At least one category is required"),
];

// Public routes
router.get("/metadata", getPostMetadata);
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.get("/author/:authorId", getPostsByAuthor);

// Protected routes - require authentication
router.post(
  "/",
  authenticate,
  authorize("admin", "author"),
  validatePost,
  createPost
);
router.put("/:id", authenticate, validatePost, updatePost);
router.delete("/:id", authenticate, deletePost);
router.post("/:id/like", authenticate, likePost);

module.exports = router;
