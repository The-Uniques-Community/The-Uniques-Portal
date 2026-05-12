import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminRoutes from "@/routes/Admin/AdminRoutes";
import CoordinatorRoutes from "@/routes/Uniques/CoordinatorRoute";
import MemberRoutes from "@/routes/Uniques/MemberRoutes";
import Auth from "@/routes/Authentication/Auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />
  },
  AdminRoutes,
  CoordinatorRoutes,
  MemberRoutes,
  Auth,
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />
  }
]);

export default router;
