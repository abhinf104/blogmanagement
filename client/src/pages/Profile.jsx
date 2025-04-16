import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import { userService } from "../services/api";
import "../assets/styles/profile.css";

const Profile = () => {
  // Get auth state from Redux
  const {
    user: authUser,
    isAuthenticated,
    token,
  } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState(null); // Store fetched profile data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only fetch if authenticated
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // Use the dedicated getProfile service which uses the token
        const response = await userService.getProfile();
        setProfileData(response.data.user);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Failed to load profile. Please try refreshing."
        );
        console.error("Fetch Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]); // Re-fetch if authentication state changes (e.g., logout)

  // Redirect if not authenticated (check token as a fallback, but Redux state is primary)
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />; // Use replace to prevent going back
  }

  // Display loading state
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>{error}</p>
          {/* Optional: Add a retry button */}
          {/* <button onClick={fetchUserProfile}>Try Again</button> */}
        </div>
      </div>
    );
  }

  // Display profile data
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData?.profilePicture ? (
              <img src={profileData.profilePicture} alt={profileData.name} />
            ) : (
              <div className="avatar-placeholder">
                {profileData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <h1>{profileData?.name || "User"}</h1>
          <span className="profile-role">{profileData?.role || "Reader"}</span>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Email</label>
            <p>{profileData?.email || "Not provided"}</p>
          </div>

          <div className="info-group">
            <label>Bio</label>
            <p>{profileData?.bio || "No bio provided"}</p>
          </div>

          <div className="info-group">
            <label>Member Since</label>
            <p>
              {profileData?.createdAt
                ? new Date(profileData.createdAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="profile-actions">
          {/* Link to the Edit Profile page */}
          <Link to="/profile/edit" className="edit-profile-btn">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
