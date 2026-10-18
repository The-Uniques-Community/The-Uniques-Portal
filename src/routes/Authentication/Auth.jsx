import { lazy } from "react";
import Loader from "@/components/common/loaders/RouteLoader";

const AuthLayout = Loader(lazy(() => import("@/layout/Authentication/AuthLayout")));
const Login = Loader(lazy(() => import("@/views/Authentication/login")));

const ForgetPassword = Loader(lazy(() => import("@/views/Authentication/login/ForgetPassword")));

const Auth = {
  path: "/auth",
  element: <AuthLayout />,
  children: [
    {
      path: "login", // Fix: should be relative, not absolute
      element: <Login />,
    },
    {
      path: "forget-password",
      element: <ForgetPassword />,
    },
  ],
};

export default Auth;
