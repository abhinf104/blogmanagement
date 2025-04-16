import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userService, imageService } from "../services/api";
import { updateUser } from "../redux/slices/authSlice";
import "../assets/styles/profile.css"; // Reuse profile styles or create new ones

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch current profile data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getProfile();
        const profile = response.data.user;
        const profileImageUrl = profile.profilePicture || null;

        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          bio: profile.bio || "",
          profilePicture: profileImageUrl || "",
        });
        setInitialData(profile);
        setImagePreview(profileImageUrl);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load profile data.");
        console.error("Fetch Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPG, PNG, etc.)");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    let updatedImageUrl = formData.profilePicture;

    try {
      // 1. Upload image if a new file was selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const imageResponse = await imageService.uploadProfileImage(uploadData);
        updatedImageUrl = imageResponse.data.imageUrl;
        console.log("Image uploaded:", updatedImageUrl);
      }

      // 2. Prepare data to update
      const dataToUpdate = {
        name: formData.name,
        email: formData.email,
        profilePicture: updatedImageUrl,
      };
      if (formData.bio !== initialData.bio) {
        dataToUpdate.bio = formData.bio;
      }

      // Check if anything actually changed
      const hasMeaningfulChange =
        imageFile ||
        formData.bio !== initialData.bio ||
        formData.name !== initialData.name ||
        formData.email !== initialData.email ||
        updatedImageUrl !== initialData.profilePicture;

      // 3. Call update profile API only if there are meaningful changes
      if (hasMeaningfulChange) {
        console.log("Sending update data:", dataToUpdate);
        const resultAction = await dispatch(updateUser(dataToUpdate)).unwrap();
        setSuccess("Profile updated successfully!");

        // Update local form state and preview
        setFormData({ ...formData, profilePicture: updatedImageUrl });
        setInitialData(resultAction.user);
        setImageFile(null); // Clear the file input state
        setImagePreview(updatedImageUrl);

        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setSuccess("No changes detected.");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.msg ||
        err.message ||
        "Failed to update profile. Please try again.";
      setError(errorMessage);
      console.error("Update Profile Error:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container edit-profile-container">
      <div className="profile-card edit-profile-card">
        <h1>Edit Profile</h1>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="success-message" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Image Upload */}
          <div className="form-group profile-picture-group">
            <label htmlFor="profileImageInput">Profile Picture</label>
            <div className="profile-picture-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={handleImageChange}
            />
            <small>Upload a new image. Max 10MB.</small>
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email (Disabled) */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              readOnly
              required
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us a little about yourself"
            />
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              type="submit"
              className="save-profile-btn"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/profile")}
              disabled={updating}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
