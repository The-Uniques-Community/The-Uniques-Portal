import React from "react";
import ProjectList from "@/utils/project/ProjectList";

const Projects = () => {
  return <ProjectList createRoutePrefix="/admin/projects-overview" />;
};

export default Projects;
