import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Loader from "@/components/common/loaders/RouteLoader";
import AdminRoutes from "@/routes/Admin/AdminRoutes";
import CoordinatorRoutes from "@/routes/Uniques/CoordinatorRoute";
import MemberRoutes from "@/routes/Uniques/MemberRoutes";
import CommunityRoutes from "@/routes/Community/CommunityRoutes";
import Auth from "@/routes/Authentication/Auth";

const Unauthorized = Loader(lazy(() => import("@/views/Authentication/Unauthorized")));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: "/401",
    element: <Unauthorized />
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  AdminRoutes,
  CoordinatorRoutes,
  MemberRoutes,
  CommunityRoutes,
  Auth,
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />
  }
]);

export default router;
