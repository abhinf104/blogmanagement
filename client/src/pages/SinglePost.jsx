import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostById } from "../redux/slices/postSlice";
import { createComment } from "../redux/slices/commentSlice";
import useReduxSelectors from "../hooks/useReduxSelectors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faComment,
  faChevronLeft,
  faPaperPlane,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const SinglePost = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useReduxSelectors();
  const { currentPost, loading, error } = useSelector((state) => state.posts);

  const [comment, setComment] = useState("");
  const commentInputRef = useRef(null);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Comment date formatting
  const formatCommentDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  useEffect(() => {
    dispatch(fetchPostById(id));
    window.scrollTo(0, 0);

    // Update document title
    if (currentPost?.title) {
      document.title = `${currentPost.title} | BlogMaster`;
    }

    return () => {
      document.title = "BlogMaster"; // Reset title on unmount
    };
  }, [dispatch, id, currentPost]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim() || !isAuthenticated) return;

    try {
      await dispatch(createComment({ postId: id, content: comment }));
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Loading state
  if (loading && !currentPost) {
    return (
      <div className="post-container">
        <div className="loading-state">
          <div className="loading-pulse"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentPost) {
    return (
      <div className="post-container">
        <div className="error-state">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="error-icon"
          />
          <h2>Couldn't load this article</h2>
          <p>There was an error loading the content.</p>
          <button
            onClick={() => dispatch(fetchPostById(id))}
            className="retry-button"
          >
            Try Again
          </button>
          <Link to="/blog" className="back-link">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="post-container">
      {/* Back to Blogs */}
      <div className="post-navigation">
        <Link to="/blog" className="back-link">
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Back to Blogs</span>
        </Link>
      </div>

      {/* Post Header */}
      <header className="post-header">
        <h1 className="post-title">{currentPost.title}</h1>

        <div className="post-meta">
          <div className="author-info">
            {currentPost.author?.profilePicture ? (
              <img
                src={currentPost.author.profilePicture}
                alt={currentPost.author.name}
                className="author-avatar"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {currentPost.author?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <span className="author-name">
                {currentPost.author?.name || "Unknown Author"}
              </span>
              <span className="post-date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {formatDate(currentPost.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {currentPost.featuredImage && (
        <div className="featured-image-container">
          <img
            src={currentPost.featuredImage}
            alt={currentPost.title}
            className="featured-image"
          />
        </div>
      )}

      {/* Post Content */}
      <article className="post-content">
        <div
          className="content-html"
          dangerouslySetInnerHTML={{
            __html: currentPost.content || "",
          }}
        />
      </article>

      {/* Author Bio */}
      {currentPost.author && (
        <div className="author-bio">
          <div className="author-bio-header">
            {currentPost.author.profilePicture ? (
              <img
                src={currentPost.author.profilePicture}
                alt={currentPost.author.name}
                className="bio-avatar"
              />
            ) : (
              <div className="bio-avatar-placeholder">
                {currentPost.author.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <h3 className="bio-name">{currentPost.author.name}</h3>
              {currentPost.author.role && (
                <span className="bio-role">{currentPost.author.role}</span>
              )}
            </div>
          </div>
          <p className="bio-text">
            {currentPost.author.bio ||
              `Author of "${currentPost.title}" and other great content on our platform.`}
          </p>
        </div>
      )}

      {/* Comments Section */}
      <section className="comments-section" id="comments-section">
        <h2 className="section-title">
          <FontAwesomeIcon icon={faComment} />
          Comments ({currentPost.comments?.length || 0})
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="comment-input-wrapper">
              <div className="comment-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="comment-input-container">
                <textarea
                  ref={commentInputRef}
                  className="comment-input"
                  placeholder="Share your thoughts on this article..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!comment.trim()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  <span>Post Comment</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="comment-login-prompt">
            <p>
              Please{" "}
              <Link
                to="/login"
                state={{ from: `/posts/${id}` }}
                className="login-link"
              >
                log in
              </Link>{" "}
              to join the discussion.
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="comments-list">
          {currentPost.comments && currentPost.comments.length > 0 ? (
            currentPost.comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-avatar">
                  {comment.author?.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {comment.author?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <h4 className="comment-author">
                      {comment.author?.name || "Anonymous User"}
                    </h4>
                    <span className="comment-date">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="comment-body">
                    <p>{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-comments">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>

      <style jsx="true">{`
        .post-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #333;
          line-height: 1.6;
        }

        /* Navigation */
        .post-navigation {
          margin: 1.5rem 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #555;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link svg {
          margin-right: 0.5rem;
        }

        .back-link:hover {
          color: #3182ce;
        }

        /* Post Header */
        .post-header {
          margin-bottom: 1.5rem;
        }

        .post-title {
          font-size: 2.25rem;
          line-height: 1.2;
          color: #222;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .post-meta {
          margin-bottom: 1rem;
        }

        .author-info {
          display: flex;
          align-items: center;
        }

        .author-avatar,
        .author-avatar-placeholder {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          margin-right: 0.75rem;
          overflow: hidden;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .author-avatar-placeholder {
          background: #e6e6e6;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.25rem;
        }

        .author-name {
          display: block;
          font-weight: 600;
          color: #333;
        }

        .post-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #666;
          font-size: 0.85rem;
        }

        /* Featured Image */
        .featured-image-container {
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .featured-image {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          object-position: center;
        }

        /* Post Content */
        .post-content {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #333;
          margin-bottom: 2rem;
        }

        .content-html {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .content-html h2 {
          font-size: 1.8rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #222;
          font-weight: 600;
        }

        .content-html h3 {
          font-size: 1.4rem;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: #222;
          font-weight: 600;
        }

        .content-html p {
          margin-bottom: 1.5rem;
        }

        .content-html blockquote {
          border-left: 3px solid #3182ce;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #555;
        }

        .content-html img {
          max-width: 100%;
          border-radius: 0.4rem;
          margin: 1.5rem 0;
        }

        .content-html a {
          color: #3182ce;
          text-decoration: underline;
        }

        /* Author Bio */
        .author-bio {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 0.5rem;
          border: 1px solid #eaeaea;
        }

        .author-bio-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .bio-avatar,
        .bio-avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-right: 1rem;
          overflow: hidden;
        }

        .bio-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bio-avatar-placeholder {
          background: #e6e6e6;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
        }

        .bio-name {
          font-size: 1.1rem;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .bio-role {
          color: #666;
          font-size: 0.85rem;
        }

        .bio-text {
          color: #444;
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.6;
        }

        /* Comments Section */
        .comments-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eaeaea;
        }

        .section-title {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          color: #222;
          font-weight: 600;
        }

        .section-title svg {
          margin-right: 0.75rem;
          color: #3182ce;
        }

        /* Comment Form */
        .comment-form {
          margin-bottom: 2rem;
        }

        .comment-input-wrapper {
          display: flex;
          gap: 1rem;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .comment-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #e6e6e6;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .comment-input-container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .comment-input {
          width: 100%;
          min-height: 100px;
          padding: 0.9rem;
          border: 1px solid #ddd;
          border-radius: 0.4rem;
          margin-bottom: 0.75rem;
          font-family: inherit;
          font-size: 0.95rem;
          resize: vertical;
        }

        .comment-input:focus {
          outline: none;
          border-color: #3182ce;
        }

        .comment-submit {
          align-self: flex-end;
          padding: 0.6rem 1.25rem;
          background: #3182ce;
          color: white;
          border: none;
          border-radius: 0.4rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comment-submit:hover {
          background: #2b6cb0;
        }

        .comment-submit:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .comment-login-prompt {
          text-align: center;
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 0.4rem;
          margin-bottom: 2rem;
          border: 1px solid #eaeaea;
        }

        .login-link {
          color: #3182ce;
          font-weight: 500;
          text-decoration: underline;
        }

        /* Comments List */
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .comment {
          display: flex;
          gap: 1rem;
        }

        .comment-content {
          flex: 1;
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 0.4rem;
          position: relative;
          border: 1px solid #eaeaea;
        }

        .comment-content::before {
          content: "";
          position: absolute;
          left: -6px;
          top: 15px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #f9f9f9;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .comment-author {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .comment-date {
          color: #777;
          font-size: 0.8rem;
        }

        .comment-body {
          color: #444;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .comment-body p {
          margin: 0;
        }

        .no-comments {
          text-align: center;
          padding: 2rem;
          color: #666;
          background: #f9f9f9;
          border-radius: 0.4rem;
          border: 1px solid #eaeaea;
        }

        /* Loading & Error States */
        .loading-state,
        .error-state {
          padding: 3rem 0;
          text-align: center;
          color: #666;
        }

        .loading-pulse {
          width: 40px;
          height: 40px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: #e6f0fc;
          animation: pulse 1.2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }

        .error-icon {
          font-size: 2rem;
          color: #e53e3e;
          margin-bottom: 1rem;
        }

        .retry-button,
        .back-link {
          display: inline-block;
          padding: 0.6rem 1.25rem;
          margin: 1rem 0.5rem 0;
          border-radius: 0.4rem;
          font-weight: 500;
        }

        .retry-button {
          background: #3182ce;
          color: white;
          border: none;
          cursor: pointer;
        }

        .retry-button:hover {
          background: #2b6cb0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .post-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 576px) {
          .post-title {
            font-size: 1.75rem;
          }

          .comment-input-wrapper {
            flex-direction: column;
          }

          .comment-avatar {
            margin-bottom: 0.75rem;
          }

          .comment-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SinglePost;
