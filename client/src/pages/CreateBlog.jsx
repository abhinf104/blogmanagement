import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBlog } from "../redux/slices/blogSlice";

const CreateBlog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.blogs);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categories: [],
    tags: "",
    featuredImage: null,
  });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Predefined categories and tags for demo purposes
  const predefinedCategories = [
    "Technology",
    "Design",
    "Business",
    "Health",
    "Lifestyle",
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData({
          ...formData,
          featuredImage: file,
        });

        // Create image preview
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format data for submission
      const blogData = new FormData();
      blogData.append("title", formData.title);
      blogData.append("content", formData.content);

      // Handle categories
      if (formData.categories && formData.categories.length > 0) {
        const categoriesArray = Array.isArray(formData.categories)
          ? formData.categories
          : [formData.categories];

        for (const category of categoriesArray) {
          blogData.append("categories", category);
        }
      }

      // Handle tags
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        for (const tag of tagsArray) {
          blogData.append("tags", tag);
        }
      }

      // Append featured image if it exists
      if (formData.featuredImage) {
        blogData.append("featuredImage", formData.featuredImage);
      }

      // Dispatch create blog action
      const resultAction = await dispatch(createBlog(blogData)).unwrap();

      setSuccessMessage("Post created successfully!");

      // Redirect to the newly created blog after a delay
      setTimeout(() => {
        navigate(`/blog/${resultAction.blog._id}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create blog:", err);
    }
  };

  // Handle image removal
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

  return (
    <div className="create-blog-container">
      <h1>Create New Post</h1>

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

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
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
              value={formData.categories}
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
            placeholder="Write your blog content here..."
            required
            rows="15"
          ></textarea>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Publish Post"}
          </button>
        </div>
      </form>

      <style jsx="true">{`
        .create-blog-container {
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

        .blog-form {
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

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateBlog;
