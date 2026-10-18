/**
 * @file projectModel.js
 * @description Proxy re-export for the Project Mongoose model.
 * @architecture Re-exports the unified Project model from the projects domain into the community module namespace for backwards compatibility.
 * @agent_note Do not define schema here; any schema modifications should occur in server/models/projects/projectModel.js.
 */

import Project from "../projects/projectModel.js";

/**
 * @module Project
 */
export default Project;

