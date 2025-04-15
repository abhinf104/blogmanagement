import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPostById } from "../redux/slices/postSlice";
import {
  fetchComments,
  createComment,
  clearComments,
  addSocketComment,
  updateSocketComment,
  deleteSocketComment,
  setCurrentPostId,
} from "../redux/slices/commentSlice";
import { userService } from "../services/api"; // Assuming userService exists
import io from "socket.io-client";
import "../assets/styles/single-post.css";

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const { user, token } = useSelector((state) => state.auth);
  const {
    currentPost,
    loading: postLoading,
    error: postError,
  } = useSelector((state) => state.posts);
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    currentPage,
    hasMore,
  } = useSelector((state) => state.comments);

  // Local State
  const [author, setAuthor] = useState(null);
  // Consider fetching via Redux if needed elsewhere
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { _id: commentId, author: { name: authorName } }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const socketRef = useRef();

  // --- Effects ---

  // Fetch Post Data
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(setCurrentPostId(id)); // Set current post ID for comment slice
    }
    // Clear comments when navigating away or to a different post
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, id]);

  // Fetch Author Data when post is loaded
  useEffect(() => {
    const fetchAuthor = async () => {
      if (currentPost?.author?._id) {
        try {
          // Assuming userService.getUserById exists
          const response = await userService.getUserById(
            currentPost.author._id
          );
          setAuthor(response.data.user);
        } catch (err) {
          console.error("Failed to fetch author:", err);
          setAuthor({ name: "Unknown Author" }); // Fallback
        }
      } else if (currentPost?.author) {
        // If author object is already populated but missing details
        setAuthor(currentPost.author);
      }
    };
    fetchAuthor();
    // Fetch related posts based on currentPost.categories or tags
  }, [currentPost]);

  // Fetch Comments
  const loadComments = useCallback(
    (page = 1) => {
      if (id) {
        console.log(`Loading comments for post ${id}, page ${page}`);
        dispatch(fetchComments({ postId: id, page }))
          .unwrap()
          .then((result) => {
            console.log(
              `Loaded ${result.comments.length} comments successfully`
            );
          })
          .catch((err) => {
            console.error("Failed to load comments:", err);
          });
      }
    },
    [dispatch, id]
  );

  useEffect(() => {
    loadComments(1); // Load first page initially
  }, [loadComments]);

  // Update your Socket.IO connection code
  useEffect(() => {
    if (!id || !token) return;

    // Use the correct environment variable with Vite syntax
    const socketURL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    console.log("Connecting to socket at:", socketURL);

    // Connect with auth token and explicit path
    socketRef.current = io(socketURL, {
      path: "/socket.io",
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // Add connection status handlers for debugging
    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
      socketRef.current.emit("joinPost", id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Socket event handlers for comments
    socketRef.current.on("commentAdded", (comment) => {
      console.log("Comment added via socket:", comment);
      dispatch(addSocketComment(comment));
    });

    socketRef.current.on("commentUpdated", (comment) => {
      console.log("Comment updated via socket:", comment);
      dispatch(updateSocketComment(comment));
    });

    socketRef.current.on("commentDeleted", (commentId) => {
      console.log("Comment deleted via socket:", commentId);
      dispatch(deleteSocketComment(commentId));
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leavePost", id);
        socketRef.current.disconnect();
      }
    };
  }, [id, token, dispatch]);
  // --- Handlers ---

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    if (!user) {
      navigate("/login"); // Redirect if not logged in
      return;
    }

    setIsSubmitting(true);
    const commentData = {
      postId: id,
      content: commentText,
      parentId: replyTo ? replyTo._id : null,
    };

    try {
      // Dispatch createComment thunk
      await dispatch(createComment(commentData)).unwrap();

      // Socket.io will handle adding the comment via 'commentAdded' event
      setCommentText("");
      setReplyTo(null);
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert(`Failed to post comment: ${err.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    const commentInput = document.getElementById("comment-input");
    if (commentInput) {
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const loadMoreComments = () => {
    if (!commentsLoading && hasMore) {
      loadComments(currentPage + 1);
    }
  };

  // --- Render Logic ---

  // recursively render the comments
  const renderCommentsRecursive = (commentList, level = 0) => {
    if (
      !commentList ||
      !Array.isArray(commentList) ||
      commentList.length === 0
    ) {
      return null;
    }

    return commentList.map((comment) => {
      // Skip invalid comments
      if (!comment || typeof comment !== "object" || !comment._id) {
        console.warn("Invalid comment object:", comment);
        return null;
      }

      return (
        <div
          key={comment._id}
          className="comment-item"
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="comment-avatar">
            <img
              src={
                comment.author?.profilePicture ||
                "https://via.placeholder.com/50?text=U"
              }
              alt={comment.author?.name || "User"}
            />
          </div>
          <div className="comment-content">
            <div className="comment-header">
              <h4>{comment.author?.name || "Anonymous"}</h4>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && (
                  <span className="edited-tag"> (edited)</span>
                )}
              </span>
            </div>
            {/* Safely render comment content */}
            <p>{typeof comment.content === "string" ? comment.content : ""}</p>
            {user && (
              <button
                className="reply-btn"
                onClick={() => handleReply(comment)}
              >
                Reply
              </button>
            )}

            {/* Render replies with safety check */}
            {Array.isArray(comment.replies) && comment.replies.length > 0 && (
              <div className="nested-comments">
                {renderCommentsRecursive(comment.replies, level + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // --- Loading and Error States ---
  if (postLoading) {
    return (
      <div className="post-container loading">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="post-container error-message">
        <p>Error loading post: {postError}</p>
        <button onClick={() => navigate("/posts")}>Back to Posts</button>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="post-container error-message">
        <p>Post not found.</p>
        <button onClick={() => navigate("/posts")}>Back to Posts</button>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="post-container">
      {/* Post Header */}
      <header className="post-header">
        <h1>{currentPost.title}</h1>
        <div className="post-meta">
          <div className="post-categories">
            {currentPost.categories?.map((cat) => (
              <span key={cat} className="category-label">
                {cat}
              </span>
            ))}
          </div>
          <div className="post-date">
            <span>
              {new Date(currentPost.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {/* TODO: Add Edit/Delete buttons for authorized users */}
            {user &&
              (user.userId === currentPost.author?._id ||
                user.role === "admin") && (
                <Link
                  to={`/posts/edit/${currentPost._id}`}
                  className="edit-post-link"
                >
                  Edit Post
                </Link>
              )}
          </div>
        </div>
        <div className="post-tags">
          {currentPost.tags?.map((tag) => (
            <span key={tag} className="tag-label">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Featured Image */}
      {currentPost.featuredImage && (
        <div className="featured-image">
          <img src={currentPost.featuredImage} alt={currentPost.title} />
        </div>
      )}

      {/* Author Section */}
      {author && (
        <div className="author-section">
          <div className="author-avatar">
            <img
              src={
                author.profilePicture ||
                "https://via.placeholder.com/100?text=A"
              }
              alt={author.name}
            />
          </div>
          <div className="author-info">
            <h3>
              {/* Link to author profile if implemented */}
              {/* <Link to={`/profile/${author._id}`}> */}
              {author.name}
              {/* </Link> */}
            </h3>
            <p>{author.bio || "No bio available."}</p>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="post-content">
        {typeof currentPost.content === "string" ? (
          <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
        ) : (
          <p>No content available</p>
        )}
      </div>

      {/* Related Posts */}
      {/* TODO: Implement related posts fetching and rendering */}
      {/* <div className="related-posts-section"> ... </div> */}

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {/* Comment Form */}
        {user ? ( // Only show form if logged in
          <form
            id="comment-form"
            className="comment-form"
            onSubmit={handleSubmitComment}
          >
            {replyTo && (
              <div className="reply-indicator">
                <span>Replying to {replyTo.author.name}</span>
                <button
                  type="button"
                  className="cancel-reply"
                  onClick={() => setReplyTo(null)}
                  aria-label="Cancel reply"
                >
                  ×
                </button>
              </div>
            )}
            <textarea
              id="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                replyTo ? "Write your reply..." : "Add a public comment..."
              }
              required
              rows="4"
            />
            <button
              type="submit"
              className="submit-comment"
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : replyTo ? "Reply" : "Comment"}
            </button>
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Log in</Link> or{" "}
            <Link to="/register">Sign up</Link> to leave a comment.
          </p>
        )}

        {/* Comments List with Error Boundary */}
        <div className="comments-list-container">
          {commentsLoading && currentPage === 1 ? (
            <div className="loading-comments">
              <div className="spinner small"></div>
              <p>Loading comments...</p>
            </div>
          ) : commentsError ? (
            <div className="error-message">
              <p>
                Error loading comments:{" "}
                {typeof commentsError === "string"
                  ? commentsError
                  : "Failed to load comments"}
              </p>
              <button onClick={() => loadComments(1)}>Try Again</button>
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <>
              {/* Wrap the comment rendering in a try/catch */}
              {(() => {
                try {
                  // Filter to only top-level comments (no parent)
                  const topLevelComments = comments.filter((c) => !c.parent);
                  return renderCommentsRecursive(topLevelComments);
                } catch (error) {
                  console.error("Error rendering comments:", error);
                  return (
                    <div className="error-message">
                      <p>Error displaying comments. Please refresh the page.</p>
                    </div>
                  );
                }
              })()}

              {hasMore && (
                <div className="load-more">
                  <button
                    onClick={loadMoreComments}
                    disabled={commentsLoading}
                    className="load-more-btn"
                  >
                    {commentsLoading ? "Loading..." : "Load More Comments"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
