// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./UserContext";

const PrivateRoute = () => {
  const { userInfo } = useUser();

  // If no user is found, redirect to login
  if (!userInfo.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render child routes
  return <Outlet />;
};

export default PrivateRoute;
