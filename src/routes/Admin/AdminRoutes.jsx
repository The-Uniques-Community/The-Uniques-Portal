import { lazy } from "react";
import Loader from "@/components/common/loaders/RouteLoader";
import ProtectedRoute from "@/routes/ProtectedRoute";

const EventForm = Loader(lazy(() => import("@/components/event/EventForm")));
const ProjectForm = Loader(lazy(() => import("@/components/project/ProjectForm")));
const AdminLayout = Loader(lazy(() => import("@/layout/Admin")));
const AdminDashboard = Loader(lazy(() => import("@/views/Management/Dashboard")));
const Member = Loader(lazy(() => import("@/views/Management/Members")));
const Event = Loader(lazy(() => import("@/views/Management/Events")));
const Projects = Loader(lazy(() => import("@/views/Management/Projects")));
const Account = Loader(lazy(() => import("@/views/Management/Accounts")));
const Profile = Loader(lazy(() => import("@/views/Management/Profile")));
const EventBudget = Loader(lazy(() => import("@/views/Management/Events/Budget")));
const EventView = Loader(lazy(() => import("@/views/Management/Events/View")));
const ProjectView = Loader(lazy(() => import("@/views/Management/Projects/View")));
const Enquiry = Loader(lazy(() => import("@/views/Management/Enquiry")));
const Trainers = Loader(lazy(() => import("@/views/Management/Trainers")));
const Stats = Loader(lazy(() => import("@/views/Management/Stats")));
const Batches = Loader(lazy(() => import("@/views/Management/Batches")));
const Community = Loader(lazy(() => import("@/views/Management/Community")));
const LeaveManagement = Loader(lazy(() => import("@/views/Management/LeaveManagement")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques360/Coordinator360/Uniques360")));
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
      path: "/admin/dashboard",
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
      path: "/admin/projects-overview",
      element: <Projects />,
    },
    {
      path: "/admin/projects-overview/create",
      element: <ProjectForm />,
    },
    {
      path: "/admin/projects-overview/view/:id",
      element: <ProjectView />,
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
      path: "/admin/enquiry",
      element: <Enquiry />,
    },
    {
      path: "/admin/trainers",
      element: <Trainers />,
    },
    {
      path: "/admin/stats",
      element: <Stats />,
    },
    {
      path: "/admin/batches",
      element: <Batches />,
    },
    {
      path: "/admin/community",
      element: <Community />,
    },
    {
      path: "/admin/leave-management",
      element: <LeaveManagement />,
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
    },
  ],
};

export default AdminRoutes;
