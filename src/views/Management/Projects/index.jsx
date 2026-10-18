import React from "react";
import { useLocation } from "react-router-dom";
import ProjectList from "@/components/project/ProjectList";

const Projects = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/coordinator")
    ? "/coordinator/projects-overview"
    : "/admin/projects-overview";

  return <ProjectList createRoutePrefix={basePath} />;
};

export default Projects;
