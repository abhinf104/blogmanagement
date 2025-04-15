const Comment = require("../models/comment");
const Post = require("../models/post");

// Get all comments for a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Get page and limit as numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: `No post with id: ${postId}` });
    }

    // Get top-level comments with pagination
    const comments = await Comment.find({
      post: postId,
      parent: null,
    })
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name profilePicture")
      .populate({
        path: "replies",
        options: { sort: { createdAt: 1 } },
        populate: {
          path: "author",
          select: "name profilePicture",
        },
      });

    // Get total count for pagination
    const count = await Comment.countDocuments({ post: postId, parent: null });

    res.status(200).json({
      comments,
      count,
      currentPage: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ msg: error.message || "Failed to fetch comments" });
  }
};

// Create a new comment (REST API fallback)
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: `No post with id: ${postId}` });
    }

    // Create comment object
    const commentData = {
      content,
      post: postId,
      author: req.user.userId,
    };

    // Handle nested comments
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ msg: `No parent comment with id: ${parentId}` });
      }
      commentData.parent = parentId;
      commentData.depth = parentComment.depth + 1;
    }

    // Save comment
    const comment = await Comment.create(commentData);

    // Populate author info for response
    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name profilePicture"
    );

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Update a comment (REST API fallback)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Find comment
    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ msg: `No comment with id: ${commentId}` });
    }

    // Check permissions
    if (
      comment.author.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this comment" });
    }

    // Update comment
    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    // Populate and return
    const updatedComment = await Comment.findById(commentId).populate(
      "author",
      "name profilePicture"
    );

    res.status(200).json({ comment: updatedComment });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete a comment (REST API fallback)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ msg: `No comment with id: ${commentId}` });
    }

    // Check permissions
    if (
      comment.author.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this comment" });
    }

    // Helper function from socket.js to delete comment and its replies
    const { deleteCommentAndReplies } = require("../socket/socket");
    await deleteCommentAndReplies(commentId);

    res.status(200).json({ msg: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
};
