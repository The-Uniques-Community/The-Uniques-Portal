/* eslint-disable react-refresh/only-export-components */
/**
 * @file ManagementRoutes.jsx
 * @description Consolidated route factory for administrative and coordinator workspaces.
 * Uses dedicated, pixel-accurate page skeletons for route fallbacks.
 */
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loader from "@/components/common/loaders/RouteLoader";
import ProtectedRoute from "@/routes/ProtectedRoute";

const ManagementLayout = Loader(lazy(() => import("@/layout/Management")));

// Import dedicated page skeletons
import {
  DashboardPageSkeleton,
  MembersPageSkeleton,
  TrainersPageSkeleton,
  EventsPageSkeleton,
  EventViewSkeleton,
  EventBudgetSkeleton,
  ProjectsPageSkeleton,
  ProjectViewSkeleton,
  AccountsPageSkeleton,
  ProfilePageSkeleton,
  EnquiryPageSkeleton,
  BatchesPageSkeleton,
  StatsPageSkeleton,
  LeaveManagementPageSkeleton,
  Coordinator360Skeleton,
  ProjectInsightsSkeleton,
  EventInsightsSkeleton,
  FormPageSkeleton,
} from "@/components/common/skeletons";

// Lazy-loaded views configured with exact page skeletons
const EventForm = Loader(lazy(() => import("@/components/event/EventForm")), true, FormPageSkeleton);
const ProjectForm = Loader(lazy(() => import("@/components/project/ProjectForm")), true, FormPageSkeleton);
const Dashboard = Loader(lazy(() => import("@/views/Management/Dashboard")), true, DashboardPageSkeleton);
const Member = Loader(lazy(() => import("@/views/Management/Members")), true, MembersPageSkeleton);
const Event = Loader(lazy(() => import("@/views/Management/Events")), true, EventsPageSkeleton);
const Projects = Loader(lazy(() => import("@/views/Management/Projects")), true, ProjectsPageSkeleton);
const Account = Loader(lazy(() => import("@/views/Management/Accounts")), true, AccountsPageSkeleton);
const Profile = Loader(lazy(() => import("@/views/Management/Profile")), true, ProfilePageSkeleton);
const EventBudget = Loader(lazy(() => import("@/views/Management/Events/Budget")), true, EventBudgetSkeleton);
const EventView = Loader(lazy(() => import("@/views/Management/Events/View")), true, EventViewSkeleton);
const ProjectView = Loader(lazy(() => import("@/views/Management/Projects/View")), true, ProjectViewSkeleton);
const Enquiry = Loader(lazy(() => import("@/views/Management/Enquiry")), true, EnquiryPageSkeleton);
const Trainers = Loader(lazy(() => import("@/views/Management/Trainers")), true, TrainersPageSkeleton);
const Stats = Loader(lazy(() => import("@/views/Management/Stats")), true, StatsPageSkeleton);
const Batches = Loader(lazy(() => import("@/views/Management/Batches")), true, BatchesPageSkeleton);
const LeaveManagement = Loader(lazy(() => import("@/views/Management/LeaveManagement")), true, LeaveManagementPageSkeleton);
const Uniques360 = Loader(lazy(() => import("@/views/Uniques360/Coordinator360/Uniques360")), true, Coordinator360Skeleton);
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")), true, ProjectInsightsSkeleton);
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")), true, EventInsightsSkeleton);

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
