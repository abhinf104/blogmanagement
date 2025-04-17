import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../redux/slices/postSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faThLarge,
  faList,
  faCalendarAlt,
  faUser,
  faHeart,
  faEye,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";

const BlogList = () => {
  const dispatch = useDispatch();
  const {
    posts,
    loading: postLoading,
    totalPages,
    categories: allCategories,
    tags: allTags,
  } = useSelector((state) => state.posts);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sample categories and tags if API doesn't provide them
  const categories =
    allCategories?.length > 0
      ? allCategories
      : [
          "Technology",
          "Design",
          "Business",
          "Health",
          "Lifestyle",
          "Travel",
          "Food",
        ];

  const tags =
    allTags?.length > 0
      ? allTags
      : [
          "React",
          "JavaScript",
          "Web Development",
          "UI/UX",
          "Mobile",
          "Cloud",
          "AI",
          "Programming",
        ];

  // Memoize loadPosts to prevent unnecessary re-renders
  const loadPosts = useCallback(() => {
    // Build params object
    const params = {
      page: currentPage,
      limit: 12,
      sort: sortBy,
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTags.length > 0) params.tags = selectedTags.join(",");

    // Dispatch the fetchPosts thunk with the params object
    dispatch(fetchPosts(params));
  }, [
    dispatch,
    currentPage,
    searchTerm,
    selectedCategory,
    selectedTags,
    sortBy,
  ]);

  useEffect(() => {
    // Fetch posts when dependencies change
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTags([]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Generate post excerpt
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength).trim() + "...";
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="blog-container">
      {/* Hero Section */}
      <div className="blog-hero">
        <h1>The Blog</h1>
        <p>Discover insights, stories, and expert perspectives</p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
      </div>

      <div className="blog-content-wrapper">
        {/* Controls and Filters Bar */}
        <div className="blog-controls">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FontAwesomeIcon icon={faList} />
            </button>

            <div className="sort-control">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="mostComments">Most Discussed</option>
              </select>
            </div>
          </div>

          <button
            className={`filter-toggle ${isFilterOpen ? "active" : ""}`}
            onClick={toggleFilterPanel}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
            {(selectedCategory || selectedTags.length > 0) && (
              <span className="filter-badge">
                {(selectedCategory ? 1 : 0) + selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filter Panel */}
        <div className={`filter-panel ${isFilterOpen ? "open" : ""}`}>
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className="filter-options categories">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-option ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Tags</h3>
            <div className="filter-options tags">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`filter-option tag ${
                    selectedTags.includes(tag) ? "active" : ""
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button className="reset-filters" onClick={resetFilters}>
              Reset All Filters
            </button>
            <button className="close-filters" onClick={toggleFilterPanel}>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedTags.length > 0) && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {selectedCategory && (
              <span className="active-filter category">
                {selectedCategory}
                <button
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTags.map((tag) => (
              <span key={tag} className="active-filter tag">
                #{tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            ))}
            <button className="clear-all-filters" onClick={resetFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* Posts Display */}
        {postLoading && posts.length === 0 ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Finding amazing articles for you...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className={`blog-posts ${viewMode}`}>
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-image">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} />
                  ) : (
                    <div className="placeholder-image">
                      <span>{post.title.charAt(0)}</span>
                    </div>
                  )}
                  {post.categories && post.categories.length > 0 && (
                    <span className="post-category">{post.categories[0]}</span>
                  )}
                  <button className="bookmark-btn">
                    <FontAwesomeIcon icon={faBookmark} />
                  </button>
                </div>

                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(post.createdAt)}
                    </span>
                    {post.author && (
                      <span className="post-author">
                        <FontAwesomeIcon icon={faUser} />
                        {post.author.name}
                      </span>
                    )}
                  </div>

                  <h2 className="post-title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h2>

                  <p className="post-excerpt">
                    {post.excerpt || getExcerpt(post.content)}
                  </p>

                  <div className="post-footer">
                    <div className="post-stats">
                      <span className="post-views">
                        <FontAwesomeIcon icon={faEye} />
                        {post.viewCount || 0}
                      </span>
                      <span className="post-likes">
                        <FontAwesomeIcon icon={faHeart} />
                        {post.likesCount || 0}
                      </span>
                    </div>

                    <Link to={`/posts/${post._id}`} className="read-more">
                      Read Article
                    </Link>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="post-tag"
                          onClick={() => {
                            if (!selectedTags.includes(tag)) {
                              handleTagToggle(tag);
                            }
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="more-tags">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !postLoading && posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts found</h3>
            <p>
              Try adjusting your search criteria or check back later for new
              content.
            </p>
            <button onClick={resetFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : null}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn prev"
            >
              Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNumber = i + 1;
                // Show first page, last page, current page and adjacent pages
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`page-number ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={pageNumber} className="page-ellipsis">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn next"
            >
              Next
            </button>
          </div>
        )}

        {postLoading && posts.length > 0 && (
          <div className="bottom-loader">
            <div className="loader small"></div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .blog-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Hero Section */
        .blog-hero {
          text-align: center;
          padding: 4rem 1rem;
          margin-bottom: 2rem;
          background: linear-gradient(to right, #e6f7ff, #f0f9ff);
          border-radius: 12px;
        }

        .blog-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #2d3748;
          font-weight: 800;
        }

        .blog-hero p {
          font-size: 1.2rem;
          color: #4a5568;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Search */
        .search-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input-container {
          display: flex;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-radius: 50px;
          overflow: hidden;
        }

        .search-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          font-size: 1rem;
          border-radius: 50px 0 0 50px;
        }

        .search-input:focus {
          outline: none;
        }

        .search-button {
          background: #3182ce;
          color: white;
          border: none;
          padding: 0 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
          border-radius: 0 50px 50px 0;
        }

        .search-button:hover {
          background: #2c5282;
        }

        /* Controls */
        .blog-content-wrapper {
          position: relative;
        }

        .blog-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .view-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .view-btn {
          border: none;
          background: none;
          padding: 0.5rem;
          cursor: pointer;
          color: #718096;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .view-btn:hover,
        .view-btn.active {
          color: #3182ce;
          background: #ebf8ff;
        }

        .sort-control {
          margin-left: 1rem;
          position: relative;
        }

        .sort-select {
          padding: 0.5rem 2rem 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          appearance: none;
          background-color: white;
          font-size: 0.9rem;
          color: #4a5568;
          cursor: pointer;
        }

        .sort-select:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 1px #3182ce;
        }

        .sort-control::after {
          content: "▼";
          font-size: 0.6rem;
          color: #718096;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-toggle.active,
        .filter-toggle:hover {
          background: #ebf8ff;
          border-color: #bee3f8;
          color: #3182ce;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #3182ce;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Filter Panel */
        .filter-panel {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: none;
          animation: slideDown 0.3s forwards;
        }

        .filter-panel.open {
          display: block;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-section {
          margin-bottom: 1.5rem;
        }

        .filter-title {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #2d3748;
          font-weight: 600;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-option {
          padding: 0.5rem 1rem;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-option:hover {
          background: #ebf8ff;
          border-color: #bee3f8;
        }

        .filter-option.active {
          background: #3182ce;
          color: white;
          border-color: #3182ce;
        }

        .filter-option.tag {
          border-radius: 20px;
        }

        .filter-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .reset-filters,
        .close-filters {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .reset-filters {
          background: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .reset-filters:hover {
          background: #e2e8f0;
        }

        .close-filters {
          background: #3182ce;
          color: white;
        }

        .close-filters:hover {
          background: #2c5282;
        }

        /* Active Filters */
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .active-filters-label {
          color: #718096;
          font-size: 0.9rem;
          margin-right: 0.5rem;
        }

        .active-filter {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem 0.75rem;
          border-radius: 20px;
          font-size: 0.9rem;
          background: #ebf8ff;
          color: #3182ce;
        }

        .active-filter.category {
          background: #e9d8fd;
          color: #6b46c1;
        }

        .remove-filter {
          border: none;
          background: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          font-size: 1rem;
          color: inherit;
          padding: 0;
          margin-left: 4px;
        }

        .clear-all-filters {
          margin-left: auto;
          padding: 0.4rem 0.75rem;
          border-radius: 4px;
          background: none;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
          cursor: pointer;
        }

        /* Blog Posts */
        .blog-posts {
          margin-bottom: 3rem;
          min-height: 300px;
          position: relative;
        }

        .blog-posts.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .blog-posts.list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Post Card */
        .post-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .blog-posts.list .post-card {
          flex-direction: row;
          height: auto;
          max-height: 240px;
        }

        .post-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .blog-posts.list .post-image {
          flex: 0 0 300px;
          height: auto;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .post-card:hover .post-image img {
          transform: scale(1.05);
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #c2e4ff, #3182ce);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: white;
        }

        .post-category {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #3182ce;
          z-index: 1;
          backdrop-filter: blur(4px);
        }

        .bookmark-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #718096;
          transition: all 0.2s;
          z-index: 1;
          backdrop-filter: blur(4px);
        }

        .bookmark-btn:hover {
          background: white;
          color: #3182ce;
        }

        .post-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .post-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #718096;
        }

        .post-date,
        .post-author {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .post-title {
          margin: 0 0 1rem 0;
          font-size: 1.4rem;
          line-height: 1.4;
        }

        .post-title a {
          color: #2d3748;
          text-decoration: none;
          transition: color 0.2s;
        }

        .post-title a:hover {
          color: #3182ce;
        }

        .post-excerpt {
          color: #4a5568;
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-size: 0.95rem;
          flex-grow: 1;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .post-stats {
          display: flex;
          gap: 1rem;
          color: #718096;
          font-size: 0.85rem;
        }

        .post-views,
        .post-likes {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .read-more {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          background: #ebf8ff;
          color: #3182ce;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .read-more:hover {
          background: #bee3f8;
        }

        .post-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .post-tag {
          font-size: 0.8rem;
          color: #718096;
          cursor: pointer;
          transition: color 0.2s;
        }

        .post-tag:hover {
          color: #3182ce;
        }

        .more-tags {
          font-size: 0.8rem;
          color: #718096;
        }

        /* Loading States */
        .loading-container {
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3182ce;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .loader.small {
          width: 24px;
          height: 24px;
          border-width: 3px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .bottom-loader {
          display: flex;
          justify-content: center;
          padding: 1rem;
        }

        .no-posts {
          text-align: center;
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .no-posts h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .no-posts p {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          background: #3182ce;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #2c5282;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 3rem 0;
          gap: 0.5rem;
        }

        .pagination-btn {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.2s;
          font-weight: 500;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-number {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-number.active {
          background: #3182ce;
          color: white;
          border-color: #3182ce;
        }

        .page-number:hover:not(.active) {
          background: #f7fafc;
        }

        .page-ellipsis {
          padding: 0 0.3rem;
          color: #a0aec0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .blog-posts.grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .blog-hero {
            padding: 3rem 1rem;
          }

          .blog-hero h1 {
            font-size: 2.5rem;
          }

          .blog-posts.list .post-card {
            flex-direction: column;
            max-height: none;
          }

          .blog-posts.list .post-image {
            flex: auto;
            height: 220px;
          }

          .filter-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .reset-filters,
          .close-filters {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .blog-posts.grid {
            grid-template-columns: 1fr;
          }

          .blog-hero h1 {
            font-size: 2rem;
          }

          .blog-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .view-controls {
            width: 100%;
            justify-content: space-between;
          }

          .filter-toggle {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogList;
