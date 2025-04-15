import { useEffect, useState, useCallback } from "react"; // Add useCallback
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector directly
import { fetchPosts } from "../redux/slices/postSlice"; // Import the thunk
// Remove useReduxSelectors import if not needed elsewhere in this component

const BlogList = () => {
  const dispatch = useDispatch();
  // Use useSelector directly for needed state
  const {
    posts,
    loading: postLoading,
    totalPages,
    categories,
    tags,
  } = useSelector((state) => state.posts);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize loadPosts to prevent unnecessary re-renders if passed as prop
  const loadPosts = useCallback(() => {
    // Build params object
    const params = {
      page: currentPage,
      limit: 10, // Or make this configurable
    };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    // Add sorting param if needed: params.sort = 'createdAt';

    // Dispatch the fetchPosts thunk with the params object
    dispatch(fetchPosts(params));
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedTag]); // Dependencies for useCallback

  useEffect(() => {
    // Fetch posts when dependencies change
    loadPosts();
  }, [loadPosts]); // useEffect depends on the memoized loadPosts

  // --- Handlers remain the same ---
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // loadPosts() will be called by useEffect due to state change
  };

  const handleCategoryChange = (category) => {
    if (selectedCategory !== category) {
      setSelectedCategory(category);
      setCurrentPage(1);
      // loadPosts() will be called by useEffect
    }
  };

  const handleTagChange = (tag) => {
    if (selectedTag !== tag) {
      setSelectedTag(tag);
      setCurrentPage(1);
      // loadPosts() will be called by useEffect
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
      // loadPosts() will be called by useEffect
    }
  };

  // --- Return JSX remains the same ---
  // ... rest of the component ...

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog Posts</h1>
        <p>Explore our latest articles and stories</p>
      </div>

      <div className="blog-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="filter-container">
          <div className="category-filter">
            <h3>Categories</h3>
            <div className="filter-options">
              <button
                className={
                  !selectedCategory ? "filter-option active" : "filter-option"
                }
                onClick={() => handleCategoryChange("")}
              >
                All
              </button>
              {categories?.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="tag-filter">
            <h3>Tags</h3>
            <div className="filter-options">
              <button
                className={
                  !selectedTag ? "filter-option active" : "filter-option"
                }
                onClick={() => handleTagChange("")}
              >
                All
              </button>
              {tags?.map((tag) => (
                <button
                  key={tag}
                  className={
                    selectedTag === tag
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleTagChange(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="blog-posts">
        {postLoading && posts.length === 0 ? ( // Show loading only on initial load or when posts are empty
          <div className="loading">Loading posts...</div>
        ) : posts && posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                {post.coverImage && (
                  <div className="post-image">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                )}
                <div className="post-content">
                  <h2 className="post-title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h2>

                  <div className="post-meta">
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.author && (
                      <span className="post-author">By {post.author.name}</span>
                    )}
                  </div>

                  <div className="post-excerpt">
                    {post.excerpt || post.content.substring(0, 150)}...
                  </div>

                  <div className="post-categories">
                    {post.categories?.map((category) => (
                      <span key={category} className="category-badge">
                        {category}
                      </span>
                    ))}
                  </div>

                  <Link to={`/posts/${post._id}`} className="read-more">
                    Read More
                  </Link>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={
                      currentPage === index + 1
                        ? "pagination-button active"
                        : "pagination-button"
                    }
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : !postLoading && posts.length === 0 ? ( // Show no posts only if not loading and posts are empty
          <div className="no-posts">
            <h3>No posts found</h3>
            <p>
              Try adjusting your search criteria or check back later for new
              content.
            </p>
          </div>
        ) : null}
        {/* Optional: Show a smaller loading indicator during subsequent loads */}
        {postLoading && posts.length > 0 && (
          <div className="loading-more">Loading...</div>
        )}
      </div>

      <style jsx="true">{`
        .blog-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .blog-header h1 {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .blog-header p {
          color: #718096;
          font-size: 1.2rem;
        }

        .blog-filters {
          margin-bottom: 2rem;
        }

        .search-form {
          display: flex;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px 0 0 4px;
          font-size: 1rem;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-weight: 600;
        }

        .search-button:hover {
          background-color: #3182ce;
        }

        .filter-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .category-filter,
        .tag-filter {
          flex: 1;
          min-width: 250px;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-option {
          padding: 0.5rem 1rem;
          background-color: #edf2f7;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .filter-option:hover {
          background-color: #e2e8f0;
        }

        .filter-option.active {
          background-color: #4299e1;
          color: white;
        }

        .blog-posts {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .post-card {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: white;
          transition: transform 0.3s;
        }

        .post-card:hover {
          transform: translateY(-5px);
        }

        .post-image {
          width: 300px;
          min-height: 200px;
          background-color: #f7fafc;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          flex: 1;
          padding: 1.5rem;
        }

        .post-title {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .post-title a {
          color: #2d3748;
          text-decoration: none;
        }

        .post-title a:hover {
          color: #4299e1;
        }

        .post-meta {
          display: flex;
          margin-bottom: 1rem;
          color: #718096;
          font-size: 0.9rem;
        }

        .post-author {
          margin-left: 1rem;
        }

        .post-excerpt {
          margin-bottom: 1rem;
          color: #4a5568;
          line-height: 1.6;
        }

        .post-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .category-badge {
          padding: 0.3rem 0.8rem;
          background-color: #ebf8ff;
          color: #3182ce;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .read-more {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #4299e1;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
        }

        .read-more:hover {
          background-color: #3182ce;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .pagination-button {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #f7fafc;
        }

        .pagination-button.active {
          background-color: #4299e1;
          color: white;
          border-color: #4299e1;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading,
        .no-posts {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .post-card {
            flex-direction: column;
          }

          .post-image {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogList;
