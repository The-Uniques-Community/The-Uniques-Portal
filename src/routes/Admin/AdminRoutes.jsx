import { lazy } from "react";
import Loader from "@/utils/Loader";
import ProtectedRoute from "@/routes/ProtectedRoute";




const EventForm = Loader(lazy(() => import("@/utils/event/EventForm")));
const AdminLayout = Loader(lazy(() => import("@/layout/Admin")));
const AdminDashboard = Loader(lazy(() => import("@/views/Admin")));
const Member = Loader(lazy(() => import("@/views/Admin/Members")));
const Event = Loader(lazy(() => import("@/views/Admin/Events")));
const Account = Loader(lazy(() => import("@/views/Admin/Accounts/index")));
const Profile = Loader(lazy(() => import("@/views/Admin/Profile")));
const EventBudget = Loader(lazy(() => import("@/views/Admin/Events/Budget")));
const EventView = Loader(lazy(() => import("@/views/Admin/Events/View")));
const Enquiry = Loader(lazy(() => import("@/views/Admin/Enquiry")));
const Trainers = Loader(lazy(() => import("@/views/Admin/Trainers")));
const AdminRoutes = {
  path: "/admin",
  element: <ProtectedRoute role={"admin"} element={<AdminLayout />} />,
  children: [
    {
      path: "/admin",
      element: <AdminDashboard />,
    },
    {
      path: "/admin/members-overview",
      element: <Member />,
    },
    {
      path: "/admin/events-overview",
      element: <Event />,
    },
    {
      path: "/admin/events-overview/create",
      element: <EventForm />,
    },
    {
      path: "/admin/events-overview/view/:id",
      element: <EventView />,
    },
    {
      path: "/admin/events-overview/:id/budget",
      element: <EventBudget />,
    },
    {
      path: "/admin/accounts",
      element: <Account />,
    },
    {
      path: "/admin/profile",
      element: <Profile />,
    },
    {
      path:"/admin/enquiry",
      element: <Enquiry/>
    },
    {
      path: "/admin/trainers",
      element: <Trainers />,
    }
  ],
};

export default AdminRoutes;
