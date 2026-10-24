/**
 * @file index.js
 * @description Unified barrel exports for portal skeleton loaders.
 */

export { default as BaseSkeleton } from "./BaseSkeleton";
export {
  default as CardSkeleton,
  MemberCardSkeleton,
  TrainerCardSkeleton,
  EventCardSkeleton,
  BlogCardSkeleton,
} from "./CardSkeleton";
export { default as TableSkeleton } from "./TableSkeleton";
export { default as StatsSkeleton, StatCardSkeleton } from "./StatsSkeleton";
export { default as FeedSkeleton } from "./FeedSkeleton";
export { default as WorkspaceSkeleton } from "./WorkspaceSkeleton";
export { default as PageSkeleton } from "./PageSkeleton";

// Dedicated page-level skeletons
export { default as DashboardPageSkeleton } from "./pages/DashboardPageSkeleton";
export { default as MembersPageSkeleton } from "./pages/MembersPageSkeleton";
export { default as TrainersPageSkeleton } from "./pages/TrainersPageSkeleton";
export { default as EventsPageSkeleton } from "./pages/EventsPageSkeleton";
export { default as EventViewSkeleton } from "./pages/EventViewSkeleton";
export { default as EventBudgetSkeleton } from "./pages/EventBudgetSkeleton";
export { default as ProjectsPageSkeleton } from "./pages/ProjectsPageSkeleton";
export { default as ProjectViewSkeleton } from "./pages/ProjectViewSkeleton";
export { default as AccountsPageSkeleton } from "./pages/AccountsPageSkeleton";
export { default as ProfilePageSkeleton } from "./pages/ProfilePageSkeleton";
export { default as EnquiryPageSkeleton } from "./pages/EnquiryPageSkeleton";
export { default as BatchesPageSkeleton } from "./pages/BatchesPageSkeleton";
export { default as StatsPageSkeleton } from "./pages/StatsPageSkeleton";
export { default as LeaveManagementPageSkeleton } from "./pages/LeaveManagementPageSkeleton";
export { default as Coordinator360Skeleton } from "./pages/Coordinator360Skeleton";
export { default as ProjectInsightsSkeleton } from "./pages/ProjectInsightsSkeleton";
export { default as EventInsightsSkeleton } from "./pages/EventInsightsSkeleton";
export { default as MemberDashboardSkeleton } from "./pages/MemberDashboardSkeleton";
export { default as BlogPageSkeleton } from "./pages/BlogPageSkeleton";
export { default as MemberLeaveSkeleton } from "./pages/MemberLeaveSkeleton";
export { default as FormPageSkeleton } from "./pages/FormPageSkeleton";
export { default as AuthPageSkeleton } from "./pages/AuthPageSkeleton";
export { default as SuccessStoriesSkeleton } from "./pages/SuccessStoriesSkeleton";

