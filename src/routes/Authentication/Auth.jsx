import { lazy } from "react";
import Loader from "@/utils/Loader";

const AuthLayout = Loader(lazy(() => import("@/layout/Authentication/AuthLayout")));
const Login = Loader(lazy(() => import("@/views/Authentication/login")));

const Auth = {
  path: "/auth",
  element: <AuthLayout />,
  children: [
    {
      path: "login", // Fix: should be relative, not absolute
      element: <Login />,
    },
  ],
};

export default Auth;
