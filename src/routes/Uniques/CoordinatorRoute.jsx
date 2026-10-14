// import { lazy } from "react";
// import Loader from "@/utils/Loader";
// import ProtectedRoute from "@/routes/ProtectedRoute";

// const CoordinatorLayout = Loader(lazy(() => import("@/layout/Uniques/Coordinator")));
// const CoordinatorDashboard = Loader(lazy(() => import("@/views/Uniques/Uniques/Coordinator")));

// const CoordinatorRoute = {
//   path: "/coordinator",
//   element: <ProtectedRoute role={'coordinator'} element={<CoordinatorLayout />} />,
//   children: [
//     {
//       path: "/coordinator",
//       element: <CoordinatorDashboard />,
//     },
//   ],
// };

// export default CoordinatorRoute;

import { lazy } from "react";
import Loader from "@/utils/Loader";
import ProtectedRoute from "@/routes/ProtectedRoute";

const EventForm = Loader(lazy(() => import("@/utils/event/EventForm")));
const ProjectForm = Loader(lazy(() => import("@/utils/project/ProjectForm")));
const CoordinatorLayout = Loader(lazy(() => import("@/layout/Uniques/Coordinator")));
const CoordinatorDashboard = Loader(lazy(() => import("@/views/Uniques/Coordinator")));
const Member = Loader(lazy(() => import("@/views/Uniques/Coordinator/Members")));
const Event = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events")));
const Projects = Loader(lazy(() => import("@/views/Uniques/Coordinator/Projects")));
const Account = Loader(lazy(() => import("@/views/Uniques/Coordinator/Accounts/index")));
const Profile = Loader(lazy(() => import("@/views/Uniques/Member")));
const EventBudget = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events/Budget")));
const EventView = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events/View")));
const ProjectView = Loader(lazy(() => import("@/views/Admin/Projects/View")));
const Enquiry = Loader(lazy(() => import("@/views/Uniques/Coordinator/Enquiry")));
const Trainers = Loader(lazy(() => import("@/views/Uniques/Coordinator/Trainers")));
const Stats = Loader(lazy(() => import("@/views/Uniques/Coordinator/Stats")));
const Batches = Loader(lazy(() => import("@/views/Uniques/Coordinator/Batches")));
const Community = Loader(lazy(() => import("@/views/Uniques/Coordinator/Community")));
const LeaveManagement = Loader(lazy(() => import("@/views/Uniques/Coordinator/LeaveManagement")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques360/Coordinator360/Uniques360")));
const ProjectInsights = Loader(lazy(() => import("@/views/Uniques360/Projects/ProjectInsights")));
const EventInsights = Loader(lazy(() => import("@/views/Uniques360/Events/EventInsights")));


const CoordinatorRoute = {
  path: "/coordinator",
  element: <ProtectedRoute role={"coordinator"} element={<CoordinatorLayout />} />,
  children: [
    {
      path: "/coordinator",
      element: <CoordinatorDashboard />,
    },
    {
      path: "/coordinator/members-overview",
      element: <Member />,
    },
    {
      path: "/coordinator/events-overview",
      element: <Event />,
    },
    {
      path: "/coordinator/events-overview/create",
      element: <EventForm />,
    },
    {
      path: "/coordinator/events-overview/view/:id",
      element: <EventView />,
    },
    {
      path: "/coordinator/events-overview/:id/budget",
      element: <EventBudget />,
    },
    {
      path: "/coordinator/projects-overview",
      element: <Projects />,
    },
    {
      path: "/coordinator/projects-overview/create",
      element: <ProjectForm />,
    },
    {
      path: "/coordinator/projects-overview/view/:id",
      element: <ProjectView />,
    },
    {
      path: "/coordinator/accounts",
      element: <Account />,
    },
    {
      path: "/coordinator/profile",
      element: <Profile />,
    },
    {
      path: "/coordinator/enquiry",
      element: <Enquiry />,
    },
    {
      path: "/coordinator/trainers",
      element: <Trainers />,
    },
    {
      path: "/coordinator/stats",
      element: <Stats />,
    },
    {
      path: "/coordinator/batches",
      element: <Batches />,
    },
    {
      path: "/coordinator/community",
      element: <Community />,
    },
    {
      path: "/coordinator/uniques360",
      element: <Uniques360 />,
    },
    {
      path: "/coordinator/leave-management",
      element: <LeaveManagement />
    },
   { path: "/coordinator/project-insights",
      element: <ProjectInsights />,
    },
    {
      path: "/coordinator/event-insights",
      element: <EventInsights />,

    }
  ],
};

export default CoordinatorRoute;
