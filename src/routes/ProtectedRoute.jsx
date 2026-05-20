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
      await axios.post("https://theuniquesportal-server.vercel.app/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const verifyUserRole = async () => {
      try {
        console.log(`Verifying role: ${role}`);
        if (role) {
          // Call the backend endpoint that verifies the role using the verifyRole middleware
          const response = await axios.get(`https://theuniquesportal-server.vercel.app/auth/verify_role?role=${role}`, {
            withCredentials: true,
          });
          console.log("Verification successful:", response.data);
        }
        setAuthorized(true);
      } catch (error) {
        console.error("Authorization failed detailed:", error.response?.data);
        console.error("Authorization failed message:", error.message);
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
