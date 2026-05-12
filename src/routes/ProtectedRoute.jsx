// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ role, element, redirectPath = "/401" }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to log out the user (clearing the token on the backend)
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const verifyUserRole = async () => {
      try {
        if (role) {
          // Call the backend endpoint that verifies the role using the verifyRole middleware
          await axios.get(`http://localhost:5000/auth/verify_role?role=${role}`, {
            withCredentials: true,
          });
        }
        setAuthorized(true);
      } catch (error) {
        // If the error is due to token expiry or invalid token, automatically log out
        if (error.response && error.response.status === 401) {
          await logout();
        }
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUserRole();
  }, [role]);

  if (loading) return <div>Loading...</div>;
  if (!authorized) return <Navigate to={redirectPath} />;
  return element;
};

export default ProtectedRoute;
