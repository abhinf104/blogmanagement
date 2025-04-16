import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { postService } from "../services/api";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, views: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's posts
        const postsResponse = await postService.getPosts(1, 5, {
          author: user?.userId,
        });
        setUserPosts(postsResponse.data.posts);

        // Calculate stats
        const totalPosts = postsResponse.data.totalPosts;
        const totalViews = postsResponse.data.posts.reduce(
          (sum, post) => sum + (post.viewCount || 0),
          0
        );

        setStats({
          posts: totalPosts,
          views: totalViews,
          comments: 0, // This would come from another API call
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || "User"}!</p>
      </header>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>Total Posts</h3>
              <p className="stat-value">{stats.posts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-info">
              <h3>Total Views</h3>
              <p className="stat-value">{stats.views}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>Comments</h3>
              <p className="stat-value">{stats.comments}</p>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="recent-posts-section">
          <div className="section-header">
            <h2>Recent Posts</h2>
            <Link to="/posts/create" className="new-post-btn">
              Create New Post
            </Link>
          </div>

          {userPosts.length === 0 ? (
            <div className="no-posts">
              <p>You haven't created any posts yet.</p>
              <Link to="/posts/create" className="btn-primary">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="posts-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <Link to={`/posts/${post._id}`}>{post.title}</Link>
                      </td>
                      <td>
                        <span className={`status ${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td>{post.viewCount || 0}</td>
                      <td className="actions">
                        <Link
                          to={`/posts/edit/${post._id}`}
                          className="edit-btn"
                        >
                          Edit
                        </Link>
                        <button className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            <Link to="/profile" className="quick-link">
              <div className="link-icon">👤</div>
              <span>My Profile</span>
            </Link>
            <Link to="/posts/create" className="quick-link">
              <div className="link-icon">✍️</div>
              <span>New Post</span>
            </Link>
            <Link to="/posts" className="quick-link">
              <div className="link-icon">📚</div>
              <span>All Posts</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        /* Stats Cards */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1rem;
          color: #4a5568;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin: 0.2rem 0 0;
          color: #2d3748;
        }

        /* Recent Posts */
        .recent-posts-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #2d3748;
        }

        .new-post-btn {
          background: #4299e1;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .new-post-btn:hover {
          background: #3182ce;
          text-decoration: none;
        }

        .posts-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status.published {
          background: #c6f6d5;
          color: #22543d;
        }

        .status.draft {
          background: #e2e8f0;
          color: #4a5568;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn,
        .delete-btn {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .edit-btn {
          background: #ebf8ff;
          color: #3182ce;
          text-decoration: none;
        }

        .delete-btn {
          background: #fff5f5;
          color: #e53e3e;
          border: none;
        }

        /* No posts */
        .no-posts {
          text-align: center;
          padding: 2rem;
        }

        .btn-primary {
          display: inline-block;
          background: #4299e1;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          margin-top: 1rem;
        }

        /* Quick Links */
        .quick-links {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .quick-links h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #2d3748;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          background: #f7fafc;
          text-decoration: none;
          color: #4a5568;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .quick-link:hover {
          transform: translateY(-5px);
          background: #ebf8ff;
          text-decoration: none;
        }

        .link-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .stats-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
