// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/config";
import { PageSkeleton } from "@/components/common/skeletons";

const ProtectedRoute = ({ role, element, redirectPath = "/401" }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [targetRedirect, setTargetRedirect] = useState(redirectPath);

  // Function to log out the user (clearing the token on the backend)
  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
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
          const response = await axios.get(`${BASE_URL}/auth/verify_role?role=${role}`, {
            withCredentials: true,
          });
          console.log("Verification successful:", response.data);
        }
        setAuthorized(true);
      } catch (error) {
        console.error("Authorization failed detailed:", error.response?.data);
        console.error("Authorization failed message:", error.message);

        const storedRole =
          localStorage.getItem("role") ||
          (() => {
            try {
              return JSON.parse(localStorage.getItem("user") || "{}").role;
            } catch {
              return null;
            }
          })();

        const isRoleMismatch =
          error.response?.status === 403 ||
          (storedRole && role && storedRole.toLowerCase() !== role.toLowerCase()) ||
          error.response?.data?.message?.toLowerCase().includes("role");

        if (isRoleMismatch) {
          console.warn(
            `Role mismatch detected (required: ${role}, user: ${storedRole}). Preserving session.`
          );
          setTargetRedirect(redirectPath);
        } else if (error.response && error.response.status === 401) {
          // If the error is genuine token expiry or invalid token, log out
          await logout();
          setTargetRedirect("/auth/login");
        } else {
          setTargetRedirect(redirectPath);
        }

        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUserRole();
  }, [role, redirectPath]);

  if (loading) return <PageSkeleton />;
  if (!authorized) return <Navigate to={targetRedirect} replace />;
  return element;
};

export default ProtectedRoute;
