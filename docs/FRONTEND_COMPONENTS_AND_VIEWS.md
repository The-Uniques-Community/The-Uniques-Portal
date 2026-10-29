# Frontend Views and UI Component Catalog

This document details the user interface layer of **The Uniques Portal**, organizing all views, dialogs, cards, and reusable design components by role and domain.

---

## 1. Views Architecture

The portal's visual interface is partitioned into four primary views subsystems:
1. **Management Portal** (`src/views/Management`): Executive administration for cohorts, finances, events, student records, and trainers.
2. **Uniques360 Workspace** (`src/views/Uniques360`): Day-to-day agile tracking and report submission for coordinators and student cohorts.
3. **Member Portal** (`src/views/Uniques/Member`): Student self-service for profile management, blogs, and leave tracking.
4. **Authentication** (`src/views/Authentication`): Public entry points for email login, password recovery, and onboarding.

---

## 2. Management Views

All management views are mounted under [`src/layout/Management/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Management/index.jsx) and inherit responsive sidebar navigation and admin role checks.

| View | File Path | Core Role & Responsibilities | Key Child Components |
| :--- | :--- | :--- | :--- |
| **Dashboard** | [`Dashboard/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Dashboard/index.jsx) | Central analytics command center aggregating live counts, upcoming calendar items, and attendance. | [`Banner.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/dashboardComponents/Banner.jsx), [`StatCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/dashboardComponents/StatCard.jsx), [`EventOverView.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/dashboardComponents/EventOverView.jsx) |
| **Events Management** | [`Events/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/index.jsx) | CRUD operations for hackathons and workshops, registration counts, and thumbnail management. | [`Events/View.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/View.jsx), [`Events/Budget.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/Budget.jsx) |
| **Projects Management** | [`Projects/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Projects/index.jsx) | Student project directory administration, live links, and repository tracking. | [`Projects/View.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Projects/View.jsx) |
| **Batches Cohorts** | [`Batches/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Batches/index.jsx) | Cohort profile configuration (`The Uniques 1.0` through `6.0`), dates, and member roster linking. | Batch cards, profile editors |
| **Trainers** | [`Trainers/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Trainers/index.jsx) | Instructor bios, assigned domains, contact details, and session schedules. | [`TrainerCardDashboard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/TrainerCardDashboard.jsx) |
| **Enquiries** | [`Enquiry/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Enquiry/index.jsx) | Lead management for student registrations, corporate partnerships, and contact submissions. | Status toggle badges, query filters |
| **Accounts & Fees** | [`Accounts/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Accounts/index.jsx) | Community fee accounting, payment verification, and budget ledger monitoring. | [`FeatureCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Accounts/components/FeatureCard.jsx) |
| **Stats Overview** | [`Stats/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Stats/index.jsx) | Historical performance statistics, placement figures, and member growth charts. | [`ModernStatCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/ModernStatCard.jsx) |

---

## 3. Uniques360 Agile Workspaces

Uniques360 provides daily reporting, accountability, and mentorship workflows:

### Coordinator Workspace: [`src/views/Uniques360/Coordinator360/Uniques360.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/Uniques360.jsx)
- **Role**: Allows batch coordinators to assign tasks, inspect daily reports, monitor blocker trends, and communicate with team leads.
- **Key Dialogs & Components**:
  - [`TaskTable.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/components/TaskTable.jsx): Paginated table of cohort tasks, deadlines, and completion statuses.
  - [`CreateTaskDialog.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/components/CreateTaskDialog.jsx): Modal for dispatching assignments to individual members or teams.
  - [`EditTaskDialog.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/components/EditTaskDialog.jsx): Modifies deadlines, priority, and descriptions.
  - [`ReportsDialog.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/components/ReportsDialog.jsx): Deep-dive dialog viewing historical member reports.
  - [`TeamDialog.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/components/TeamDialog.jsx): Organizes student cohorts into active working pods.

### Member Workspace: [`src/views/Uniques360/Member360/uniques360.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/uniques360.jsx)
- **Role**: Student daily landing page to review assigned tasks and log daily progress.
- **Key Components**:
  - [`ReportComposer.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/components/ReportComposer.jsx): Form for drafting daily achievements, hours spent, and blockers.
  - [`ReportFeed.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/components/ReportFeed.jsx): Activity stream showing submissions from fellow cohort members.
  - [`TaskSidebar.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/components/TaskSidebar.jsx): Quick-access checklist of pending assignments.

---

## 4. Reusable UI Components Catalog

Located in [`src/components/`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components):

### Cards (`src/components/cards/`)
- [`MemberCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/MemberCard.jsx): Public member badge showing student portrait, batch badge, roll number, and social links.
- [`MemberCardDashboard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/MemberCardDashboard.jsx): Admin member row card with status pills and edit triggers.
- [`BlogCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/BlogCard.jsx) & [`BlogCard2.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/BlogCard2.jsx): Formats technical articles with author attribution, publish dates, and tag chips.
- [`ModernStatCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/ModernStatCard.jsx): Metric card showing KPI totals, percentage growth, and SVG icons.
- [`ReviewCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/ReviewCard.jsx): Student testimonial card.
- [`HoverCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/HoverCard.jsx) & [`SpotLightCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/SpotLightCard.jsx): Interactive cards featuring dynamic mouse-follow spotlights and CSS glow borders.

### Buttons (`src/components/buttons/`)
- [`Button.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/Button.jsx): Core design system button supporting `primary`, `secondary`, `outlined`, and `danger` variants.
- [`HoverButton.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/HoverButton.jsx): Animated button with sliding background fills using Framer Motion.
- [`ModernButton.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/ModernButton.jsx): Sleek button designed for call-to-action headers.

### Modals (`src/components/modals/`)
- [`ConfirmationModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/ConfirmationModal.jsx): Accessible warning dialog before irreversible actions (deleting events, removing members).
- [`ProfileModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/ProfileModal.jsx): Quick modal preview of student details and contact links.
- [`CommunityModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/CommunityModal.jsx): Cohort registration modal.

### Loaders & Motion Effects
- [`CustomLoader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/loaders/CustomLoader.jsx): Spinner with brand logo used for component-level loading states.
- [`RouteLoader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/loaders/RouteLoader.jsx): Full-page suspense fallback rendered during route transitions.
- [`GridBackground.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/GridBackground.jsx): Subtle SVG grid backdrop used on hero banners.
- [`meteors.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/magicui/meteors.jsx): Particle meteor shower animation effect for landing cards.
- [`Timeline.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/timeline/Timeline.jsx): Vertical milestone timeline for historical cohort journeys.
