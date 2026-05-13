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
const CoordinatorLayout = Loader(lazy(() => import("@/layout/Uniques/Coordinator")));
const CoordinatorDashboard = Loader(lazy(() => import("@/views/Uniques/Coordinator")));
const Member = Loader(lazy(() => import("@/views/Uniques/Coordinator/Members")));
const Event = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events")));
const Account = Loader(lazy(() => import("@/views/Uniques/Coordinator/Accounts/index")));
const Profile = Loader(lazy(() => import("@/views/Uniques/Member")));
const EventBudget = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events/Budget")));
const EventView = Loader(lazy(() => import("@/views/Uniques/Coordinator/Events/View")));
const Enquiry = Loader(lazy(() => import("@/views/Uniques/Coordinator/Enquiry")));
const Trainers = Loader(lazy(() => import("@/views/Uniques/Coordinator/Trainers")));
const Uniques360 = Loader(lazy(() => import("@/views/Uniques/Coordinator/Uniques360/uniques360")));
const LeaveManagement = Loader(lazy(() => import("@/views/Uniques/Coordinator/LeaveManagement")));

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
      path: "/coordinator/uniques360",
      element: <Uniques360 />,
    },
    {
      path: "/coordinator/leave-management",
      element: <LeaveManagement />,
    }
  ],
};

export default CoordinatorRoute;
