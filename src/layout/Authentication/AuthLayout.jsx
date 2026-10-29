/**
 * @file AuthLayout.jsx
 * @description Lightweight layout shell hosting authentication views such as login, signup, and password recovery.
 * @architecture Layout container for auth routes, rendering children through React Router Outlet.
 * @agent_note Provides an unconstrained container for authentication card layouts without drawer or header chrome.
 */

import React from "react";
import { Outlet } from "react-router-dom"; // Ensure correct import

/**
 * @component AuthLayout
 * @description Renders authentication view tree outlets.
 * @param {Object} props - Component properties.
 * @state Stateless.
 */
const AuthLayout = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
