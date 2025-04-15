import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useReduxSelectors from "../hooks/useReduxSelectors";
import { logoutUser } from "../redux/slices/authSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useReduxSelectors();
  const [isMenuOpen, setIsMenuOpen] = useState(false); //for mobile

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMenuOpen(false);
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          BlogMaster
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </div>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          {!isAuthenticated && (
            <li className="nav-item">
              <Link
                to="/"
                className={
                  location.pathname === "/" ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>
          )}

          {/* Blog link - always visible */}
          <li className="nav-item">
            <Link
              to="/blog" // Link to the blog list page
              className={
                location.pathname === "/blog" ? "nav-link active" : "nav-link"
              }
              onClick={closeMenu}
            >
              Blog
            </Link>
          </li>

          {/* Links for Authenticated Users */}
          {isAuthenticated && user ? (
            <>
              {/* Dashboard for authors/admins */}
              {(user.role === "author" || user.role === "admin") && (
                <li className="nav-item">
                  <Link
                    to="/dashboard"
                    className={
                      location.pathname === "/dashboard"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              {/* Write Post for authors/admins */}
              {(user.role === "author" || user.role === "admin") && (
                <li className="nav-item">
                  <Link
                    to="/posts/create"
                    className={
                      location.pathname === "/posts/create"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    onClick={closeMenu}
                  >
                    Write Post
                  </Link>
                </li>
              )}

              {/* Profile Link */}
              <li className="nav-item">
                <Link
                  to="/profile"
                  className={
                    location.pathname === "/profile"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={closeMenu}
                >
                  Profile
                </Link>
              </li>

              {/* Logout Button */}
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Links for Non-Authenticated Users */}
              <li className="nav-item">
                <Link
                  to="/login"
                  className={
                    location.pathname === "/login"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className={
                    location.pathname === "/register"
                      ? "nav-link active register-btn" // Keep register button style
                      : "nav-link register-btn"
                  }
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Inline styles remain the same */}
      <style jsx="true">{`
        /* ... existing styles ... */
        .navbar {
          background-color: #fff;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          padding: 0 2rem;
        }

        .navbar-logo {
          color: #4299e1;
          font-size: 1.8rem;
          font-weight: bold;
          text-decoration: none;
          cursor: pointer;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          text-align: center;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          height: 80px;
          display: flex;
          align-items: center;
          margin-right: 1rem; /* Adjust spacing */
        }
        /* Remove last item margin */
        .nav-item:last-child {
          margin-right: 0;
        }

        .nav-link {
          color: #4a5568;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0.5rem 1rem;
          height: 100%;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          background: none;
          font-size: 1rem; /* Consistent font size */
          border-bottom: 3px solid transparent; /* Add transparent border for alignment */
        }

        .nav-link:hover {
          color: #4299e1;
        }

        .nav-link.active {
          color: #4299e1;
          border-bottom: 3px solid #4299e1;
        }

        .register-btn {
          background-color: #4299e1;
          color: white !important; /* Ensure text is white */
          border-radius: 4px;
          padding: 0.5rem 1rem;
          height: auto; /* Override height */
          border-bottom: none; /* Remove border for button */
        }

        .register-btn:hover {
          background-color: #3182ce;
          color: white !important;
          border-bottom: none;
        }
        .register-btn.active {
          /* Style if active, though unlikely for register */
          border-bottom: none;
        }

        .logout-btn {
          color: #e53e3e;
          border-bottom: 3px solid transparent; /* Match nav-link */
        }

        .logout-btn:hover {
          color: #c53030;
        }

        .menu-icon {
          display: none;
        }

        @media screen and (max-width: 960px) {
          .navbar {
            position: relative;
          }

          .nav-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            /* Adjust height or use max-height */
            max-height: calc(100vh - 80px);
            overflow-y: auto;
            position: absolute;
            top: 80px;
            left: -100%;
            opacity: 1;
            transition: all 0.5s ease;
            padding: 2rem 0;
            background: #fff; /* Ensure background */
            z-index: 1;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .nav-menu.active {
            left: 0;
            opacity: 1;
          }

          .nav-item {
            height: auto;
            margin: 0; /* Remove side margin */
            width: 100%; /* Full width */
          }

          .nav-link {
            text-align: center;
            padding: 1.5rem; /* Increase padding */
            width: 100%;
            display: block; /* Change to block */
            border-bottom: 1px solid #eee; /* Add separator */
          }
          .nav-link.active {
            border-bottom: 1px solid #eee; /* Keep separator */
            background-color: #f7fafc; /* Highlight active */
          }

          .register-btn {
            margin: 1rem auto; /* Center button */
            width: 80%;
            padding: 1rem;
          }

          .menu-icon {
            display: block;
            font-size: 1.8rem;
            cursor: pointer;
          }

          .nav-link.active {
            border-bottom: none;
            background-color: #f7fafc;
          }

          .user-greeting {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
