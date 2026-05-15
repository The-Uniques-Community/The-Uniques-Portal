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
const LeaveManagement = Loader(lazy(() => import("@/views/Uniques/Admin/LeaveManagement")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques/Coordinator/Uniques360")));
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")));
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")));
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
    },
    {
      path: "/admin/leave-management",
      element: <LeaveManagement />
    },
    {
      path: "/admin/uniques360",
      element: <Uniques360 />,
    },
    {
      path: "/admin/project-insights",
      element: <ProjectInsights />,
    },
    {
      path: "/admin/event-insights",
      element: <EventInsights />,
    }
  ],
};

export default AdminRoutes;
