/**
 * @file index.jsx
 * @description Entry-point view for management project listings that adapts route prefixes based on user role (Admin vs Coordinator).
 * @architecture Routed via `/admin/projects-overview` and `/coordinator/projects-overview`. Wraps and renders `@/components/project/ProjectList` with dynamic `createRoutePrefix`.
 * @agent_note Thin routing wrapper determining prefix from `location.pathname` to pass to `ProjectList`. All CRUD, filtering, and pagination logic resides in `ProjectList` and `@/utils/project/projectsData`.
 */

import React from "react";
import { useLocation } from "react-router-dom";
import ProjectList from "@/components/project/ProjectList";

/**
 * @component Projects
 * @description Routes to and renders the unified `ProjectList` component configured with the role-specific route prefix.
 * @state None - Delegates state management to `ProjectList`.
 * @api None - Direct API operations handled in child components.
 */
const Projects = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/coordinator")
    ? "/coordinator/projects-overview"
    : "/admin/projects-overview";

  return <ProjectList createRoutePrefix={basePath} />;
};

export default Projects;
