/**
 * @file paths.js
 * @description Centralized URL path dictionary and role-based route resolution utilities.
 * Single source of truth for all portal workspace and authentication routes.
 */

export const PATHS = {
  // Authentication & Root Entry
  AUTH: {
    ROOT: "/",
    LOGIN: "/",
    FORGET_PASSWORD: "/forget-password",
  },

  // Admin Portal
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    MEMBERS: "/admin/members-overview",
    EVENTS: "/admin/events-overview",
    EVENT_CREATE: "/admin/events-overview/create",
    EVENT_VIEW: (id = ":id") => `/admin/events-overview/view/${id}`,
    EVENT_BUDGET: (id = ":id") => `/admin/events-overview/${id}/budget`,
    PROJECTS: "/admin/projects-overview",
    PROJECT_CREATE: "/admin/projects-overview/create",
    PROJECT_VIEW: (id = ":id") => `/admin/projects-overview/view/${id}`,
    ACCOUNTS: "/admin/accounts",
    PROFILE: "/admin/profile",
    ENQUIRY: "/admin/enquiry",
    TRAINERS: "/admin/trainers",
    STATS: "/admin/stats",
    BATCHES: "/admin/batches",
    LEAVE: "/admin/leave-management",
    UNIQUES360: "/admin/uniques360",
    PROJECT_INSIGHTS: "/admin/project-insights",
    EVENT_INSIGHTS: "/admin/event-insights",
  },

  // Coordinator Portal
  COORDINATOR: {
    ROOT: "/coordinator",
    DASHBOARD: "/coordinator/dashboard",
    MEMBERS: "/coordinator/members-overview",
    EVENTS: "/coordinator/events-overview",
    EVENT_CREATE: "/coordinator/events-overview/create",
    EVENT_VIEW: (id = ":id") => `/coordinator/events-overview/view/${id}`,
    EVENT_BUDGET: (id = ":id") => `/coordinator/events-overview/${id}/budget`,
    PROJECTS: "/coordinator/projects-overview",
    PROJECT_CREATE: "/coordinator/projects-overview/create",
    PROJECT_VIEW: (id = ":id") => `/coordinator/projects-overview/view/${id}`,
    ACCOUNTS: "/coordinator/accounts",
    PROFILE: "/coordinator/profile",
    ENQUIRY: "/coordinator/enquiry",
    TRAINERS: "/coordinator/trainers",
    STATS: "/coordinator/stats",
    BATCHES: "/coordinator/batches",
    LEAVE: "/coordinator/leave-management",
    UNIQUES360: "/coordinator/uniques360",
    PROJECT_INSIGHTS: "/coordinator/project-insights",
    EVENT_INSIGHTS: "/coordinator/event-insights",
  },

  // Member Portal
  MEMBER: {
    ROOT: "/member",
    DASHBOARD: "/member",
    CREATE_BLOG: "/member/create-blog",
    UNIQUES360: "/member/uniques360",
    LEAVE: "/member/leave-management",
    PROJECT_INSIGHTS: "/member/project-insights",
    EVENT_INSIGHTS: "/member/event-insights",
  },

  // Status & Error Pages
  UNAUTHORIZED: "/unauthorized",
  FORBIDDEN: "/401",
  NOT_FOUND: "/404",
};

/**
 * Resolves the primary dashboard route for a given user role.
 * @param {string|null|undefined} role - User role (admin, coordinator, member)
 * @returns {string} Route path to redirect the user to
 */
export const getRoleDashboard = (role) => {
  switch ((role || "").toLowerCase().trim()) {
    case "admin":
    case "superadmin":
      return PATHS.ADMIN.ROOT;
    case "coordinator":
    case "communityadmin":
      return PATHS.COORDINATOR.ROOT;
    case "member":
      return PATHS.MEMBER.ROOT;
    default:
      return PATHS.AUTH.LOGIN;
  }
};

export default PATHS;
