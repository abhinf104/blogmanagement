import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { loginUser } from "../redux/slices/authSlice"; // Import the thunk
import "../assets/styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");

    try {
      // Dispatch the loginUser thunk
      const resultAction = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe, // Pass rememberMe to thunk
        })
      ).unwrap(); // .unwrap() will throw an error if the thunk is rejected

      const loggedInUser = resultAction.user; // User data is in the payload

      // Redirect based on role
      if (loggedInUser.role === "admin" || loggedInUser.role === "author") {
        navigate("/dashboard"); // Redirect admin/author to dashboard
      } else {
        navigate("/blog"); // Redirect reader to blog list
      }

      console.log("Login successful");
    } catch (rejectedValueOrSerializedError) {
      // Handle error from rejected thunk
      setLoginError(
        rejectedValueOrSerializedError.message ||
          "Login failed. Please check your credentials."
      );
      console.error("Login failed:", rejectedValueOrSerializedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Login</h1>

        {loginError && (
          <div className="error-message" role="alert">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "input-error" : ""}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-text">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "input-error" : ""}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className="error-text">
                {errors.password}
              </span>
            )}
          </div>

          <div
            className="form-group checkbox-group"
            style={{ height: "20px", width: "100%" }}
          >
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", marginRight: "8px" }}
            />
            <label
              htmlFor="rememberMe"
              style={{ marginBottom: 0, fontWeight: "normal" }}
            >
              Remember me
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-redirect">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
