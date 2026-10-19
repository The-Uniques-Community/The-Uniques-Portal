/* eslint-disable react-refresh/only-export-components */
/**
 * @file ManagementRoutes.jsx
 * @description Consolidated route factory for administrative and coordinator workspaces.
 * Shares view definitions, lazy loading, and the unified ManagementLayout shell, eliminating code duplication.
 */
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loader from "@/components/common/loaders/RouteLoader";
import ProtectedRoute from "@/routes/ProtectedRoute";
import ManagementLayout from "@/layout/Management";

// Lazy-loaded views
const EventForm = Loader(lazy(() => import("@/components/event/EventForm")));
const ProjectForm = Loader(lazy(() => import("@/components/project/ProjectForm")));
const Dashboard = Loader(lazy(() => import("@/views/Management/Dashboard")));
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
const LeaveManagement = Loader(lazy(() => import("@/views/Management/LeaveManagement")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques360/Coordinator360/Uniques360")));
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")));
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")));

/**
 * Generates portal route configuration for a designated management role.
 * @param {'admin'|'coordinator'} baseRole
 * @returns {import('react-router-dom').RouteObject}
 */
export const createManagementRoutes = (baseRole) => ({
  path: `/${baseRole}`,
  element: <ProtectedRoute role={baseRole} element={<ManagementLayout role={baseRole} />} />,
  children: [
    { index: true, element: <Dashboard /> },
    { path: "dashboard", element: <Dashboard /> },
    { path: "members-overview", element: <Member /> },
    { path: "members", element: <Navigate to="members-overview" replace /> },
    { path: "events-overview", element: <Event /> },
    { path: "events", element: <Navigate to="events-overview" replace /> },
    { path: "events-overview/create", element: <EventForm /> },
    { path: "events-overview/view/:id", element: <EventView /> },
    { path: "events/:id", element: <EventView /> },
    { path: "events/:id/gallery", element: <EventView /> },
    { path: "events-overview/:id/budget", element: <EventBudget /> },
    { path: "projects-overview", element: <Projects /> },
    { path: "projects", element: <Navigate to="projects-overview" replace /> },
    { path: "projects-overview/create", element: <ProjectForm /> },
    { path: "projects-overview/view/:id", element: <ProjectView /> },
    { path: "projects/:id", element: <ProjectView /> },
    { path: "accounts", element: <Account /> },
    { path: "profile", element: <Profile /> },
    { path: "enquiry", element: <Enquiry /> },
    { path: "trainers", element: <Trainers /> },
    { path: "stats", element: <Stats /> },
    { path: "batches", element: <Batches /> },
    { path: "leave-management", element: <LeaveManagement /> },
    { path: "uniques360", element: <Uniques360 /> },
    { path: "project-insights", element: <ProjectInsights /> },
    { path: "event-insights", element: <EventInsights /> },
  ],
});

export const AdminRoutes = createManagementRoutes("admin");
export const CoordinatorRoutes = createManagementRoutes("coordinator");

export default {
  AdminRoutes,
  CoordinatorRoutes,
  createManagementRoutes,
};
