import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to unauthorized page if the user does not have the required role
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;