import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts, setFilters, setPage } from "../redux/slices/postSlice";
import "../assets/styles/posts.css";

const Posts = () => {
  const dispatch = useDispatch();
  const {
    posts,
    totalPages,
    loading,
    error,
    currentPage,
    categories,
    tags,
    filters,
  } = useSelector((state) => state.posts);

  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    // Prepare params based on filters
    const params = {
      page: currentPage,
      limit: 9,
    };

    // Add filters
    if (filters.category && filters.category !== "all") {
      params.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags.join(",");
    }

    if (filters.sortBy) {
      params.sort = filters.sortBy;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    dispatch(fetchPosts(params));
  }, [dispatch, currentPage, filters]);

  const handleCategoryChange = (category) => {
    dispatch(setFilters({ category }));
    dispatch(setPage(1)); // Reset to first page
  };

  const handleTagToggle = (tag) => {
    const updatedTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];

    dispatch(setFilters({ tags: updatedTags }));
    dispatch(setPage(1)); // Reset to first page
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }));
    dispatch(setPage(1)); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    dispatch(setFilters({ search: searchTerm }));
    dispatch(setPage(1)); // Reset to first page
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    dispatch(
      setFilters({
        category: "all",
        tags: [],
        sortBy: "newest",
        search: "",
      })
    );
    dispatch(setPage(1));
  };

  if (loading && currentPage === 1) {
    return (
      <div className="posts-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <header className="posts-header">
        <h1>Blog Posts</h1>
        <p>Explore our latest articles and insights</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search articles..."
            defaultValue={filters.search || ""}
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <div className="posts-content">
        {/* Sidebar with Filters */}
        <aside className="posts-sidebar">
          <div className="filter-group">
            <h3>Categories</h3>
            <ul className="category-list">
              <li>
                <button
                  className={`category-item ${
                    filters.category === "all" ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange("all")}
                >
                  All Categories
                </button>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`category-item ${
                      filters.category === category ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Tags</h3>
            <div className="tags-list">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-item ${
                    filters.tags.includes(tag) ? "active" : ""
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="posts-main">
          {/* Controls Bar */}
          <div className="posts-controls">
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
              >
                <i className="fas fa-th"></i> Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List View"
              >
                <i className="fas fa-list"></i> List
              </button>
            </div>

            <div className="sort-control">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={handleSortChange}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
                <option value="mostLiked">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Posts Display */}
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts found matching your criteria.</p>
              <button onClick={resetFilters} className="reset-filters">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`posts-${viewMode}`}>
              {posts.map((post) => (
                <div key={post._id} className="post-item">
                  <div className="post-image">
                    <Link to={`/posts/${post._id}`}>
                      <img
                        src={
                          post.featuredImage ||
                          "https://via.placeholder.com/500x300?text=Blog+Post"
                        }
                        alt={post.title}
                      />
                    </Link>
                    {post.categories && post.categories.length > 0 && (
                      <span className="post-category">
                        {post.categories[0]}
                      </span>
                    )}
                  </div>

                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <Link to={`/posts/${post._id}`} className="post-title">
                      <h2>{post.title}</h2>
                    </Link>

                    <p className="post-excerpt">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>

                    <div className="post-tags">
                      {post.tags &&
                        post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="post-tag"
                            onClick={(e) => {
                              e.preventDefault();
                              handleTagToggle(tag);
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>

                    <div className="post-footer">
                      <div className="post-author">
                        {post.author?.profilePicture && (
                          <img
                            src={post.author.profilePicture}
                            alt={post.author?.name}
                            className="author-avatar"
                          />
                        )}
                        <span>By {post.author?.name || "Unknown"}</span>
                      </div>
                      <div className="post-stats">
                        <span className="post-views">
                          <i className="fas fa-eye"></i> {post.viewCount || 0}
                        </span>
                        <span className="post-likes">
                          <i className="fas fa-heart"></i>{" "}
                          {post.likesCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="page-ellipsis">...</span>
                      )}
                      <button
                        className={`page-number ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                className="page-btn next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Posts;
