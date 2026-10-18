import React, { useState, useEffect } from "react";
import router from "@/routes";
import { RouterProvider } from "react-router-dom";
import GridBackground from "@/components/common/GridBackground";
import CustomLoader from "@/components/common/loaders/CustomLoader";

import authService from "@/services/authService";
import { getStoredAuth, isTokenExpired, clearAuthStorage } from "@/utils/authUtils";

const App = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    // Session integrity check on cold boot
    const stored = getStoredAuth();
    if (stored.token) {
      if (isTokenExpired(stored.token)) {
        clearAuthStorage();
      } else {
        authService.verifySession().catch((err) => {
          console.warn("[App] Cold boot session verification failed:", err);
        });
      }
    }

    // Main booting animation occurs on cold load / page refresh
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Branding boot animation: only on initial mount/refresh */}
      {isBooting && <CustomLoader />}

      {/* Global grid hover effect */}
      <GridBackground />
      
      {/* Main app content */}
      <div className="relative z-10">
        <RouterProvider router={router} />
      </div>
    </div>
  );
};

export default App;
