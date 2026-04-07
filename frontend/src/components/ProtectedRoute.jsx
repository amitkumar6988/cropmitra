import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, role, roles }) => {

  const { user, loading } = useAuthStore();

  // ⭐ WAIT until auth check finishes
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // allow one of several roles (e.g. user + farmer + admin)
  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <Navigate to="/home" replace />;
    }
  } else if (role && user.role !== role) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
