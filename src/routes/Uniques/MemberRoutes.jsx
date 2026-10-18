/**
 * @file MemberRoutes.jsx
 * @description Route definitions for the Member portal workspace.
 */
import { lazy } from "react";
import Loader from "@/components/common/loaders/RouteLoader";
import ProtectedRoute from "@/routes/ProtectedRoute";

const MemberLayout = Loader(lazy(() => import("@/layout/Uniques/Member")));
const MemberDashboard = Loader(lazy(() => import("@/views/Uniques/Member")));
const CreateBlog = Loader(lazy(() => import("@/views/Uniques/Member/Blog")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques360/Member360")));
const LeaveManagement = Loader(lazy(() => import("@/views/Uniques/Member/LeaveManagement")));
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")));
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")));

const MemberRoutes = {
  path: "/member",
  element: <ProtectedRoute role="member" element={<MemberLayout />} />,
  children: [
    { index: true, element: <MemberDashboard /> },
    { path: "dashboard", element: <MemberDashboard /> },
    { path: "create-blog", element: <CreateBlog /> },
    { path: "createBlog", element: <CreateBlog /> }, // Backward-compatibility alias
    { path: "uniques360", element: <Uniques360 /> },
    { path: "leave-management", element: <LeaveManagement /> },
    { path: "leaveManagement", element: <LeaveManagement /> }, // Backward-compatibility alias
    { path: "project-insights", element: <ProjectInsights /> },
    { path: "event-insights", element: <EventInsights /> },
  ],
};

export default MemberRoutes;
