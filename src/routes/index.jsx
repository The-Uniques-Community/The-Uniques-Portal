/* eslint-disable react-refresh/only-export-components */
/**
 * @file index.jsx
 * @description Master router configuration implementing React Router v7 Data Router architecture.
 * Dedicated to The Uniques Portal workspaces, authentication flows, error boundaries, and 404 handling.
 */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Loader from "@/components/common/loaders/RouteLoader";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RootLayout from "@/layout/RootLayout";

// Route modules
import { AdminRoutes, CoordinatorRoutes } from "@/routes/Management/ManagementRoutes";
import MemberRoutes from "@/routes/Uniques/MemberRoutes";
import { PATHS, getRoleDashboard } from "@/routes/paths";
import { useAuth } from "@/hooks/useAuth";
import { isTokenExpired } from "@/utils/authUtils";

// Lazy-loaded auth, status & error views
const Login = Loader(lazy(() => import("@/views/Authentication/login")));
const ForgetPassword = Loader(lazy(() => import("@/views/Authentication/login/ForgetPassword")));
const Unauthorized = Loader(lazy(() => import("@/views/Authentication/Unauthorized")));
const NotFound = Loader(lazy(() => import("@/views/NotFound")));

/**
 * Public/Guest gate: If already authenticated with a valid token, redirect to role dashboard instead of showing login.
 */
const PublicGate = ({ element }) => {
  const { isAuthenticated, role, token } = useAuth();
  if (isAuthenticated && token && role && !isTokenExpired(token)) {
    return <Navigate to={getRoleDashboard(role)} replace />;
  }
  return element;
};

const router = createBrowserRouter([
  // Root application route tree
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Primary Portal Entry (Login at /)
      {
        path: "/",
        element: <PublicGate element={<Login />} />,
      },
      {
        path: "/login",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/auth/login",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/auth",
        element: <Navigate to="/" replace />,
      },

      // Password Reset
      {
        path: "/forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "/auth/forget-password",
        element: <Navigate to="/forget-password" replace />,
      },
      {
        path: "/auth/password-reset",
        element: <Navigate to="/forget-password" replace />,
      },
      {
        path: "/password-reset",
        element: <Navigate to="/forget-password" replace />,
      },
      {
        path: "/reset-password",
        element: <Navigate to="/forget-password" replace />,
      },

      // Workspace Portals (Role Protected)
      AdminRoutes,
      CoordinatorRoutes,
      MemberRoutes,

      // Status & Feedback Routes
      {
        path: PATHS.FORBIDDEN,
        element: <Unauthorized />,
      },
      {
        path: PATHS.UNAUTHORIZED,
        element: <Unauthorized />,
      },
      {
        path: PATHS.NOT_FOUND,
        element: <NotFound />,
      },

      // 404 Catch-All: Renders dedicated NotFound page
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
