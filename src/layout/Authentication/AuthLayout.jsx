import React from "react";
import { Outlet } from "react-router-dom"; // Ensure correct import

const AuthLayout = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
