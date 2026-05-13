import { lazy } from "react";
import Loader from "@/utils/Loader";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { element } from "prop-types";

const MemberLayout = Loader(lazy(() => import("@/layout/Uniques/Member")));
const MemberDashboard = Loader(lazy(() => import("@/views/Uniques/Member")));
const CreateBlog = Loader(lazy(() => import("@/views/Uniques/Member/Blog")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques/Member/Uniques360")));
const LeaveManagement = Loader(lazy(() => import("@/views/Uniques/Member/LeaveManagement")));
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")));
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")));
const MemberRoutes = {
  path: "/member",
  element: <ProtectedRoute role={'member'} element={<MemberLayout />} />,
  children: [
    {
      path: "/member",
      element: <MemberDashboard />,
    },
    {
      path:"/member/createBlog",
      element: <CreateBlog/>,
    },
    {
      path: "/member/uniques360",
      element: <Uniques360 />,
    },
    {
      path: "/member/leaveManagement",
      element: <LeaveManagement />
    },
      {
      path: "/member/project-insights",
      element: <ProjectInsights />,
    },
    {
      path: "/member/event-insights",
      element: <EventInsights />,
    }
  ],
};

export default MemberRoutes;
