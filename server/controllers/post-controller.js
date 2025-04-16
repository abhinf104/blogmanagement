const Post = require("../models/post");

// Create a new post
const createPost = async (req, res) => {
  // Validation errors are now handled by middleware in post-routes.js

  try {
    const { title, content, categories, tags, status } = req.body;
    const authorId = req.user.userId;

    const postData = {
      title,
      content,
      author: authorId,
      categories: Array.isArray(categories)
        ? categories
        : [categories].filter(Boolean),
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
        : [],
      status: status || "draft",
    };

    if (req.file) {
      postData.featuredImage = req.file.path; // Use Cloudinary URL
    }

    const newPost = new Post(postData);
    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "name profilePicture"
    );

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    console.error("Error creating post in controller:", error);
    res.status(500).json({ msg: "Server error while creating post." }); // More specific server error
  }
};

// Get all posts with pagination, search and filters
const getAllPosts = async (req, res) => {
  try {
    const {
      search,
      category,
      tag,
      status,
      author,
      startDate,
      endDate,
      sort = "createdAt",
      fields,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const queryObject = {};

    // Filter by status (only authors and admins can see drafts)
    if (req.user && (req.user.role === "admin" || req.user.role === "author")) {
      if (status) {
        queryObject.status = status;
      }
    } else {
      // Regular users can only see published posts
      queryObject.status = "published";
    }

    // Search by title or content
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      queryObject.categories = { $in: [category] };
    }

    // Filter by tag
    if (tag) {
      queryObject.tags = { $in: [tag] };
    }

    // Filter by author
    if (author) {
      queryObject.author = author;
    }

    // Filter by date range
    if (startDate || endDate) {
      queryObject.createdAt = {};
      if (startDate) {
        queryObject.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        queryObject.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute query
    let result = Post.find(queryObject);

    // Sort
    if (sort) {
      let sortOrder;
      if (sort === "newest") {
        sortOrder = "-createdAt";
      } else if (sort === "oldest") {
        sortOrder = "createdAt";
      } else if (sort === "popular") {
        sortOrder = "-viewCount";
      } else if (sort === "mostLiked") {
        sortOrder = "-likesCount";
      } else {
        sortOrder = sort.split(",").join(" ");
      }
      result = result.sort(sortOrder);
    }

    // Field limiting
    if (fields) {
      const fieldsList = fields.split(",").join(" ");
      result = result.select(fieldsList);
    } else {
      // By default, don't return full content in list view
      result = result.select("-content");
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    result = result.skip(skip).limit(Number(limit));

    // Populate author information
    result = result.populate({
      path: "author",
      select: "name profilePicture",
    });

    // Execute and get count
    const posts = await result;
    const totalPosts = await Post.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalPosts / Number(limit));

    // Get categories and tags for filters
    const categories = await Post.distinct("categories");
    const tags = await Post.distinct("tags");

    res.status(200).json({
      success: true,
      posts,
      count: posts.length,
      totalPosts,
      numOfPages,
      categories,
      tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// Get single post by slug or ID
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    // Check if ID is a MongoDB ObjectId or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(id);
    } else {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: `No post with id or slug: ${id}`,
      });
    }

    // If post is draft, only author or admin can see it
    if (post.status === "draft") {
      if (
        !req.user ||
        (req.user.userId !== post.author.toString() &&
          req.user.role !== "admin")
      ) {
        return res.status(403).json({
          success: false,
          msg: "Not authorized to view this draft post",
        });
      }
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Populate author info
    await post.populate("author", "name profilePicture bio");

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  // Validation errors handled by middleware

  try {
    const { title, content, categories, tags, status } = req.body;
    const postId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Authorization check
    if (post.author.toString() !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this post" });
    }

    const updateData = {
      title,
      content,
      categories: Array.isArray(categories)
        ? categories
        : [categories].filter(Boolean),
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
        : [],
      status: status || post.status,
    };

    // --- MODIFICATION: Check for uploaded file ---
    if (req.file) {
      updateData.featuredImage = req.file.path; // Use Cloudinary URL
      // Optional: Delete old image from Cloudinary here if post.featuredImage exists
    }
    // --- END MODIFICATION ---

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name profilePicture");

    if (!updatedPost) {
      return res
        .status(404)
        .json({ msg: "Post not found after update attempt" });
    }

    res.status(200).json({ post: updatedPost });
  } catch (error) {
    console.error("Error updating post in controller:", error);
    res.status(500).json({ msg: "Server error while updating post." }); // More specific server error
  }
};

// Delete post (soft delete)
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Authorization check
    if (post.author.toString() !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    // Optional: Delete image from Cloudinary here if post.featuredImage exists

    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ msg: "Failed to delete post." });
  }
};

// Like/Unlike post
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: `No post with id: ${id}`,
      });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike: remove userId from likes array
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likesCount -= 1;
    } else {
      // Like: add userId to likes array
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build query based on user role
    const queryObject = { author: authorId };

    // Only authors and admins can see drafts
    if (
      !req.user ||
      (req.user.userId !== authorId && req.user.role !== "admin")
    ) {
      queryObject.status = "published";
    }

    const posts = await Post.find(queryObject)
      .sort("-createdAt")
      .select("-content")
      .skip(skip)
      .limit(Number(limit))
      .populate("author", "name profilePicture");

    const totalPosts = await Post.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalPosts / Number(limit));

    res.status(200).json({
      success: true,
      posts,
      count: posts.length,
      totalPosts,
      numOfPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// Get categories and tags summary (for filters/navigation)
const getPostMetadata = async (req, res) => {
  try {
    const categories = await Post.distinct("categories", {
      status: "published",
    });
    const tags = await Post.distinct("tags", { status: "published" });

    res.status(200).json({
      success: true,
      categories,
      tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getPostsByAuthor,
  getPostMetadata,
};
