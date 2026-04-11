import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks access to login/register if user is already logged in
const GuestRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;