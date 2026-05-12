import { lazy } from "react";
import SuccessLayout from "@/layout/Landing/successStories";
import Loader from "@/utils/Loader";
import StudentStory from "@/views/Landing/SuccessStories/StudentStory";
// Lazy load components
const SuccessStoriesHome = Loader(lazy(() => import("@/views/Landing/SuccessStories/HomeContent")));


const SuccessStoriesRoutes = {
    path: "/success-stories",
    element: <SuccessLayout />,
    children: [
        { index: true, element: <SuccessStoriesHome /> },
        { path: ":studentId", element: <StudentStory /> }
    ],
};

export default SuccessStoriesRoutes;
