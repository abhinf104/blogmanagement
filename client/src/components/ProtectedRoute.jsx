import { Navigate, Outlet } from "react-router-dom";
import useReduxSelectors from "../hooks/useReduxSelectors";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useReduxSelectors();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role, render the route
  return <Outlet />;
};

export default ProtectedRoute;
