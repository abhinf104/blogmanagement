import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostById, updatePost } from "../redux/slices/postSlice";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentPost, loading, error } = useSelector((state) => state.posts);
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categories: [],
    tags: "",
    status: "draft",
    featuredImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  // Predefined categories for demo
  const predefinedCategories = [
    "Technology",
    "Design",
    "Business",
    "Health",
    "Lifestyle",
  ];

  // Fetch post data on component mount
  useEffect(() => {
    dispatch(fetchPostById(id));
  }, [dispatch, id]);

  // Populate form when post data is loaded
  useEffect(() => {
    if (currentPost) {
      // Check authorization
      if (
        user &&
        user.userId !== currentPost.author?._id &&
        user.role !== "admin"
      ) {
        navigate(`/posts/${id}`);
        return;
      }

      setFormData({
        title: currentPost.title || "",
        content: currentPost.content || "",
        categories: currentPost.categories || [],
        tags: currentPost.tags ? currentPost.tags.join(", ") : "",
        status: currentPost.status || "draft",
        featuredImage: null,
      });

      if (currentPost.featuredImage) {
        setPreview(currentPost.featuredImage);
      }
    }
  }, [currentPost, id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        setFormData({
          ...formData,
          featuredImage: file,
        });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFormData({
      ...formData,
      featuredImage: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format data for submission
      const postData = new FormData();
      postData.append("title", formData.title);
      postData.append("content", formData.content);

      // Handle categories
      if (formData.categories) {
        const categoriesArray = Array.isArray(formData.categories)
          ? formData.categories
          : [formData.categories];

        for (const category of categoriesArray) {
          postData.append("categories", category);
        }
      }

      // Handle tags
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        for (const tag of tagsArray) {
          postData.append("tags", tag);
        }
      }

      postData.append("status", formData.status);

      // Append featured image if it exists and it's a file (not a URL string)
      if (formData.featuredImage && formData.featuredImage instanceof File) {
        postData.append("featuredImage", formData.featuredImage);
      }

      // Dispatch update post action
      await dispatch(updatePost({ id, postData })).unwrap();

      setSuccessMessage("Post updated successfully!");

      // Redirect to the post after a delay
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update post:", err);
    }
  };

  if (loading && !currentPost) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error && !currentPost) {
    return (
      <div className="error-container">
        <h2>Error loading post</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/posts")} className="btn-secondary">
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <h1>Edit Post</h1>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image</label>
          <div className="image-upload-container">
            {preview ? (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={handleRemoveImage}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop or click to upload</p>
              </div>
            )}

            <input
              type="file"
              id="featuredImage"
              name="featuredImage"
              onChange={handleChange}
              accept="image/*"
              className="file-input"
              ref={fileInputRef}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categories">Category</label>
            <select
              id="categories"
              name="categories"
              value={
                Array.isArray(formData.categories) &&
                formData.categories.length > 0
                  ? formData.categories[0]
                  : formData.categories
              }
              onChange={handleChange}
              required
            >
              <option value="">Select a Category</option>
              {predefinedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. react, javascript, web development"
          />
          <small>Separate multiple tags with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here..."
            required
            rows="15"
          ></textarea>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/posts/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>

      <style jsx="true">{`
        .edit-post-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          margin-bottom: 2rem;
          color: #2d3748;
        }

        .success-message {
          background: #c6f6d5;
          color: #276749;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .post-form {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background-color: #f8fafc;
          font-size: 1rem;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        small {
          display: block;
          margin-top: 0.5rem;
          color: #718096;
          font-size: 0.875rem;
        }

        textarea {
          resize: vertical;
          min-height: 200px;
        }

        .image-upload-container {
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .file-input {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .upload-placeholder {
          color: #a0aec0;
        }

        .upload-placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .image-preview {
          width: 100%;
          position: relative;
        }

        .image-preview img {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 4px;
        }

        .remove-image {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
        }

        .btn-primary:hover {
          background: #3182ce;
        }

        .btn-primary:disabled {
          background: #90cdf4;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #4299e1;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EditPost;
