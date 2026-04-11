import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks access to route if user is not logged in
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;