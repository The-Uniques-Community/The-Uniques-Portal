import { lazy } from "react";
import Loader from "@/utils/Loader";
import ProtectedRoute from "@/routes/ProtectedRoute";

const CommunityLayout = Loader(lazy(() => import("@/layout/Community")));
const CommunityDashboard = Loader(lazy(() => import("@/views/Community")));


const CommunityRoutes = {
  path: "/community",
  element: <ProtectedRoute role={'communityadmin'} element={<CommunityLayout />} />,
  children: [
    {
      path: "/community",
      element: <CommunityDashboard />,
    },
  ],
};

export default CommunityRoutes;
