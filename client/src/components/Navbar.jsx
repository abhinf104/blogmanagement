import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useReduxSelectors from "../hooks/useReduxSelectors";
import { logoutUser } from "../redux/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBars,
  faUser,
  faPen,
  faChartBar,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useReduxSelectors();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">BlogMaster</span>
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

          <li className="nav-item">
            <Link
              to="/blog"
              className={
                location.pathname === "/blog" ? "nav-link active" : "nav-link"
              }
              onClick={closeMenu}
            >
              Blog
            </Link>
          </li>

          {/* Conditional rendering based on authentication */}
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
                    <FontAwesomeIcon icon={faChartBar} className="nav-icon" />
                    <span>Dashboard</span>
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
                    <FontAwesomeIcon icon={faPen} className="nav-icon" />
                    <span>Write Post</span>
                  </Link>
                </li>
              )}

              {/* User menu with dropdown (desktop only) */}
              <li className="nav-item user-menu">
                <div className="user-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0) || "U"}</span>
                  )}
                </div>

                <div className="user-dropdown">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Profile</span>
                  </Link>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </div>
              </li>

              {/* Profile and Logout for mobile */}
              <li className="nav-item mobile-only">
                <Link
                  to="/profile"
                  className={
                    location.pathname === "/profile"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={closeMenu}
                >
                  <FontAwesomeIcon icon={faUser} className="nav-icon" />
                  <span>Profile</span>
                </Link>
              </li>
              <li className="nav-item mobile-only">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                  <span>Logout</span>
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
                  className="nav-link register-btn"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <style jsx="true">{`
        .navbar {
          background-color: rgba(255, 255, 255, 0.98);
          height: 70px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.1rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .navbar.scrolled {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          height: 60px;
          background-color: rgba(255, 255, 255, 0.98);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          padding: 0 2rem;
          height: 100%;
        }

        .navbar-logo {
          color: #3182ce;
          font-size: 1.6rem;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .navbar-logo:hover {
          color: #2c5282;
        }

        .logo-text {
          background: linear-gradient(135deg, #3182ce, #63b3ed);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          height: 100%;
        }

        .nav-item {
          height: 100%;
          display: flex;
          align-items: center;
          margin-left: 1.5rem;
          position: relative;
        }

        .nav-item:first-child {
          margin-left: 0;
        }

        .nav-link {
          color: #4a5568;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0.5rem 1rem;
          height: 100%;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          font-size: 1rem;
          position: relative;
        }

        .nav-link:hover {
          color: #3182ce;
        }

        .nav-link.active {
          color: #3182ce;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: #3182ce;
          border-radius: 2px 2px 0 0;
        }

        .nav-icon {
          margin-right: 0.5rem;
          font-size: 0.9rem;
        }

        .register-btn {
          background-color: #3182ce;
          color: white !important;
          border-radius: 4px;
          padding: 0.5rem 1.2rem;
          height: auto;
          border: none;
        }

        .register-btn:hover {
          background-color: #2c5282;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(66, 153, 225, 0.15);
        }

        .logout-btn {
          color: #e53e3e;
        }

        .logout-btn:hover {
          color: #c53030;
        }

        /* User dropdown styles */
        .user-menu {
          position: relative;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .user-avatar:hover {
          border-color: #3182ce;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-avatar span {
          font-weight: bold;
          color: #4a5568;
          font-size: 1rem;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 180px;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s ease;
        }

        .user-menu:hover .user-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: #4a5568;
          text-decoration: none;
          transition: background-color 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: #f7fafc;
          color: #3182ce;
        }

        .dropdown-item svg {
          margin-right: 10px;
          font-size: 0.9rem;
        }

        .dropdown-item.logout {
          color: #e53e3e;
        }

        .dropdown-item.logout:hover {
          background-color: #fed7d7;
          color: #c53030;
        }

        .menu-icon {
          display: none;
        }

        .mobile-only {
          display: none;
        }

        @media screen and (max-width: 960px) {
          .navbar {
            height: 60px;
          }

          .navbar-container {
            padding: 0 1.5rem;
          }

          .navbar-logo {
            font-size: 1.4rem;
          }

          .nav-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-height: calc(100vh - 60px);
            overflow-y: auto;
            position: absolute;
            top: 60px;
            left: -100%;
            opacity: 0;
            transition: all 0.4s ease;
            padding: 1rem 0;
            background: #fff;
            z-index: 1;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .nav-menu.active {
            left: 0;
            opacity: 1;
          }

          .nav-item {
            height: auto;
            margin: 0;
            width: 100%;
          }

          .nav-link {
            text-align: left;
            padding: 1rem 2rem;
            width: 100%;
            display: flex;
            border-bottom: 1px solid #f7fafc;
          }

          .nav-link.active {
            background-color: #ebf8ff;
            border-left: 4px solid #3182ce;
            padding-left: calc(2rem - 4px);
          }

          .nav-link.active::after {
            display: none;
          }

          .register-btn {
            margin: 1rem 2rem;
            width: calc(100% - 4rem);
            text-align: center;
            justify-content: center;
          }

          .menu-icon {
            display: block;
            font-size: 1.4rem;
            cursor: pointer;
            color: #4a5568;
          }

          .user-menu {
            display: none;
          }

          .mobile-only {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
