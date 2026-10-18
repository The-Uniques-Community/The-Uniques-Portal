/**
 * @file RootLayout.jsx
 * @description Top-level layout wrapper that mounts React Router native ScrollRestoration and Outlet.
 */
import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

export default RootLayout;
