/**
 * @file LandingRoutes.jsx
 * @description Route definitions for all public marketing and community views.
 */
import { lazy } from "react";
import Loader from "@/components/common/loaders/RouteLoader";
import { Navigate } from "react-router-dom";

// Layout
const LandingLayout = Loader(lazy(() => import("@/layout/Landing")));

// Views
const Home = Loader(lazy(() => import("@/views/Landing")));
const About = Loader(lazy(() => import("@/views/Landing/About")));
const Batches = Loader(lazy(() => import("@/views/Landing/Batches")));
const Blog = Loader(lazy(() => import("@/views/Landing/Blog")));
const Community = Loader(lazy(() => import("@/views/Landing/Community")));
const Contact = Loader(lazy(() => import("@/views/Landing/Contact")));
const Events = Loader(lazy(() => import("@/views/Landing/Event/index")));
const EventDetail = Loader(lazy(() => import("@/views/Landing/Event/components/EventDetailPage")));
const HowItStarted = Loader(lazy(() => import("@/views/Landing/HowItStarted")));
const Trainers = Loader(lazy(() => import("@/views/Landing/Trainers")));
const Training = Loader(lazy(() => import("@/views/Landing/TrainingModel/Training")));
const Notices = Loader(lazy(() => import("@/views/Landing/Notices")));
const MemberProfile = Loader(lazy(() => import("@/views/Landing/Profile/MemberProfile")));
const AdvisoryBoard = Loader(lazy(() => import("@/views/Landing/AdvisoryBoard")));
const NotFound = Loader(lazy(() => import("@/views/Landing/NotFound")));

const LandingRoutes = {
  path: "/",
  element: <LandingLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "about", element: <About /> },
    { path: "batches", element: <Batches /> },
    { path: "blogs", element: <Blog /> },
    { path: "blog", element: <Navigate to="/blogs" replace /> },
    { path: "community-main", element: <Community /> },
    { path: "contact", element: <Contact /> },
    { path: "events", element: <Events /> },
    { path: "events/:id", element: <EventDetail /> },
    { path: "howitstarted", element: <HowItStarted /> },
    { path: "trainers", element: <Trainers /> },
    { path: "training", element: <Training /> },
    { path: "notices", element: <Notices /> },
    { path: "profile/:id", element: <MemberProfile /> },
    { path: "advisory-board", element: <AdvisoryBoard /> },
    { path: "404", element: <NotFound /> },
  ],
};

export default LandingRoutes;
