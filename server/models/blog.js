const mongoose = require("mongoose");

const Blogschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide blog title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    excerpt: {
      type: String,
    },
    featuredImage: {
      type: String,
      default: "default.jpg",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    categories: [
      {
        type: String,
        required: [true, "Blog must have at least one category"],
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post must have an author"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
Blogschema.pre("save", function (next) {
  // Auto-generate excerpt from content if not provided
  if (this.isModified("content") && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]+>/g, "");
    this.excerpt =
      plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");
  }

  next();
});

// Soft delete implementation
Blogschema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Optional: preserve the "posts" collection name
module.exports = mongoose.model("Blog", Blogschema, "posts");
