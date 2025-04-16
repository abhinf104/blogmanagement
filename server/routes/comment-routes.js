const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment-controller");

// Public route to get comments for a post
router.get("/post/:postId", getPostComments);

// Protected routes for comment CRUD
router.post("/post/:postId", authenticate, createComment);
router.put("/:commentId", authenticate, updateComment);
router.delete("/:commentId", authenticate, deleteComment);

module.exports = router;
