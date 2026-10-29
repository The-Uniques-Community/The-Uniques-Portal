# Complete Codebase Directory and File Index

This document serves as an exhaustive reference index connecting all directories, source files, functions, relationships, and dependencies across **The Uniques Portal**.

---

## Table of Contents
1. [Root Build & Environment Files](#1-root-build--environment-files)
2. [Frontend Core (`src/`)](#2-frontend-core-src)
   - [Bootstrap & Routing](#bootstrap--routing)
   - [Layout Wrappers](#layout-wrappers)
   - [Domain Views](#domain-views)
   - [UI Components](#ui-components)
   - [API Services & Network Client](#api-services--network-client)
   - [State Management (Redux)](#state-management-redux)
   - [Theme & Styling](#theme--styling)
   - [Utilities & Mock Datasets](#utilities--mock-datasets)
3. [Backend Server (`server/`)](#3-backend-server-server)
   - [Server Entry & Config](#server-entry--config)
   - [Middleware Pipeline](#middleware-pipeline)
   - [Domain Controllers](#domain-controllers)
   - [Mongoose Data Models](#mongoose-data-models)
   - [REST Routes](#rest-routes)

---

## 1. Root Build & Environment Files

| File | Purpose | Primary Exports & Roles | Connected Dependencies |
| :--- | :--- | :--- | :--- |
| [`package.json`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/package.json) | Project manifest defining client dependencies, scripts (`dev`, `build`, `lint`). | Build targets, React 18, MUI, Vite, Tailwind CSS. | Consumed by npm and Vite. |
| [`vite.config.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/vite.config.js) | Vite bundler configuration. | Configures `@` path alias pointing to `src/`, React plugin, server port (5173). | Referenced across all `@/...` imports. |
| [`tailwind.config.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/tailwind.config.js) | Tailwind CSS styling rules, custom theme extensions, brand red `#ca0019`, animations. | Exports theme palette and plugin definitions. | Consumed by PostCSS and Tailwind. |
| [`postcss.config.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/postcss.config.js) | PostCSS pipeline running Tailwind and Autoprefixer. | PostCSS plugin registration. | Vite CSS pipeline. |
| [`eslint.config.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/eslint.config.js) | Flat ESLint rules validating React hooks, JSX syntax, and modern JS standards. | Lint rule sets. | Used by `npm run lint`. |
| [`LOCAL_SETUP_ENV.md`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/LOCAL_SETUP_ENV.md) | Ready-to-use localhost configuration file containing all credentials and the original production MongoDB URI. | Guide for developers spinning up the portal locally. | Mirrors `server/.env` and root `.env`. |

---

## 2. Frontend Core (`src/`)

### Bootstrap & Routing

- **[`src/main.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/main.jsx)**:
  - *Description*: Client entry point initializing ReactDOM root, Redux Provider, and ThemeProvider.
  - *Dependencies*: [`src/App.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/App.jsx), [`src/redux/store.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/redux/store.js), [`src/theme/ThemeProvider.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/ThemeProvider.jsx).
- **[`src/App.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/App.jsx)**:
  - *Description*: Top-level component rendering React Router `RouterProvider` and toast notifications.
  - *Dependencies*: [`src/routes/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/index.jsx).
- **[`src/routes/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/index.jsx)**:
  - *Description*: Master router combining public landing routes, authentication routes, management routes, and 360 workspaces.
  - *Sub-routes*: [`MainRoutes.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/MainRoutes.jsx), [`AuthenticationRoutes.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/AuthenticationRoutes.jsx), [`Management/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/Management/index.jsx).

---

### Layout Wrappers

- **[`src/layout/Management/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Management/index.jsx)**:
  - *Description*: Scaffold for executive dashboard views featuring collateral sidebar, breadcrumb headers, and theme toggles.
- **[`src/layout/Admin/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Admin/index.jsx)**:
  - *Description*: Admin layout enforcing token verification and role permissions.
- **[`src/layout/Authentication/AuthLayout.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Authentication/AuthLayout.jsx)**:
  - *Description*: Centered clean card wrapper for login, registration, and password recovery.
- **[`src/layout/Uniques/Coordinator/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Uniques/Coordinator/index.jsx)**:
  - *Description*: Dedicated workspace layout for Uniques360 cohort coordinators.
- **[`src/layout/Uniques/Member/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/Uniques/Member/index.jsx)**:
  - *Description*: Student self-service layout containing navigation for tasks, blogs, and leave tracking.
- **[`src/layout/NavMotion.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/NavMotion.jsx)**:
  - *Description*: Framer Motion container animating view transitions smoothly between route switches.
- **[`src/layout/NavigationScroll.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/layout/NavigationScroll.jsx)**:
  - *Description*: Utility component resetting window scroll to `(0, 0)` upon route changes.

---

### Domain Views

#### Management Views (`src/views/Management/`)
- **[`Dashboard/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Dashboard/index.jsx)**: Executive KPI cockpit showing live cohort metrics, active members, calendar events, and notices.
- **[`Events/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/index.jsx)**: Event calendar manager with tabs for upcoming, ongoing, and past events.
- **[`Events/View.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/View.jsx)**: Detailed single-event preview showing registered participants, agenda, and speakers.
- **[`Events/Budget.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Events/Budget.jsx)**: Event financial ledger tracking itemized expenses, vendor receipts, and budget variances.
- **[`Projects/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Projects/index.jsx)**: Directory of all student projects with search and filter capabilities.
- **[`Projects/View.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Projects/View.jsx)**: Single project detail sheet showcasing live demos, GitHub links, and author roster.
- **[`Batches/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Batches/index.jsx)**: Cohort management interface linked to the Single Source of Truth `Batch` model.
- **[`Accounts/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Accounts/index.jsx)**: Fee accounting overview monitoring paid and pending dues.
- **[`Enquiry/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Enquiry/index.jsx)**: Inbound inquiries and leads from students and corporate visitors.
- **[`Stats/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Stats/index.jsx)**: Historical placement metrics and cohort growth charts.
- **[`Trainers/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Management/Trainers/index.jsx)**: Trainer profiles, domain expertise, and contact cards.
- **[`NotFound.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/NotFound.jsx)**: Custom branded 404 page with navigation redirect to safety.

#### Uniques360 Workspaces (`src/views/Uniques360/`)
- **[`Coordinator360/Uniques360.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Coordinator360/Uniques360.jsx)**: Coordinator hub for task dispatching and report audits.
- **[`Member360/uniques360.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/uniques360.jsx)**: Student hub for logging daily reports and checking off assigned tasks.
- **[`Events/EventInsights.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Events/EventInsights.jsx)**: Analytical breakdown of hackathon and workshop attendance and feedback.
- **[`Projects/ProjectInsights.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Projects/ProjectInsights.jsx)**: Sprint analytics for development teams tracking completed milestones.

#### Member Self-Service (`src/views/Uniques/Member/`)
- **[`Member/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques/Member/index.jsx)**: Student profile dashboard displaying personal achievements, attendance, and dues.
- **[`Blog/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques/Member/Blog/index.jsx)**: Article drafting and publishing interface for technical write-ups.
- **[`LeaveManagement/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques/Member/LeaveManagement/index.jsx)**: Leave application form with calendar picker and status tracker.

#### Authentication Views (`src/views/Authentication/`)
- **[`login/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Authentication/login/index.jsx)**: Dual email/password and Google OAuth login portal.
- **[`login/ForgetPassword.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Authentication/login/ForgetPassword.jsx)**: Self-service password reset dispatching email links.
- **[`signup/index.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Authentication/signup/index.jsx)**: New member onboarding registration screen.
- **[`Unauthorized.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Authentication/Unauthorized.jsx)**: 403 Forbidden screen shown when non-admins attempt to access restricted panels.

---

### UI Components (`src/components/`)

- **Cards**:
  - [`MemberCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/MemberCard.jsx), [`MemberCardDashboard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/MemberCardDashboard.jsx): Member showcase and administrative management cards.
  - [`BlogCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/BlogCard.jsx), [`BlogCard2.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/BlogCard2.jsx): Article cards with tag taxonomy and thumbnail zoom.
  - [`ModernStatCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/ModernStatCard.jsx): KPI metrics card with trend percentages.
  - [`HoverCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/HoverCard.jsx), [`SpotLightCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/SpotLightCard.jsx), [`TitledCard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/TitledCard.jsx): Interactive physics-based and cursor-following motion cards.
  - [`TrainerCardDashboard.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/cards/TrainerCardDashboard.jsx): Trainer summary card with full inspector dialog.
- **Buttons & Headers**:
  - [`Button.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/Button.jsx), [`HoverButton.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/HoverButton.jsx), [`ModernButton.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/buttons/ModernButton.jsx): Core design system buttons.
  - [`CelebrationHeader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/headers/CelebrationHeader.jsx), [`ModernHeader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/headers/ModernHeader.jsx), [`WorkspaceHeader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/headers/WorkspaceHeader.jsx): Section and page title headers.
- **Modals**:
  - [`ConfirmationModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/ConfirmationModal.jsx): Accessible modal guarding destructive operations.
  - [`ProfileModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/ProfileModal.jsx): Tabbed member inspector with suspension and fine controls.
  - [`CommunityModal.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/modals/CommunityModal.jsx): Cohort registration dialog.
- **Loaders & Effects**:
  - [`CustomLoader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/loaders/CustomLoader.jsx): Portal splash screen.
  - [`RouteLoader.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/loaders/RouteLoader.jsx): Suspense boundary fallback.
  - [`ClickSpark.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/ui/ClickSpark.jsx), [`Orbit.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/ui/Orbit.jsx), [`meteors.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/magicui/meteors.jsx): Particle canvas, orbital planetary rotations, and shooting stars.
  - [`Timeline.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/timeline/Timeline.jsx): Historical milestone track.

---

### API Services & Network Client (`src/services/`)

- [`apiClient.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/apiClient.js): Configured Axios instance with dynamic base URL, JWT interceptors, and 401 unauthenticated redirect.
- [`authService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/authService.js): Email login, signup, token validation, password recovery.
- [`communityService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/communityService.js): Unified cohort queries (`/api/batches/all`, `/api/batches/profiles`), stats.
- [`eventService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/eventService.js): Event CRUD, image uploads, registration counts.
- [`projectService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/projectService.js): Project showcase CRUD, GitHub links, thumbnail uploads.
- [`memberService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/memberService.js): Member roster queries, profile updates, fines, status toggles.
- [`coordinatorService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/coordinatorService.js): Coordinator profile updates and team assignments.
- [`uniques360Service.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/uniques360Service.js): Daily report submission, peer report feeds, task checklists.
- [`leaveService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/leaveService.js): Leave requests and approval workflows.
- [`fineService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/fineService.js): Disciplinary fine tracking and receipt updates.
- [`trainerService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/trainerService.js): Trainer profiles and assignments.
- [`enquiryService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/enquiryService.js): Inbound inquiries management.
- [`successStoriesService.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/services/successStoriesService.js): Testimonials and alumni success stories.

---

### State Management (`src/redux/`)

- [`src/redux/store.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/redux/store.js): Central Redux Toolkit store.
- [`src/redux/slices/userSlice.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/redux/slices/userSlice.js): Authenticated user session state (`currentUser`, `isAuthenticated`, `token`).

---

### Theme & Styling (`src/theme/`)

- [`ThemeProvider.jsx`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/ThemeProvider.jsx): React context provider synchronizing Material UI palette with dark/light mode toggles.
- [`themes.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/themes.js): Material UI theme generator with custom typography, shadow tokens, and component overrides.
- [`palette.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/palette.js): Color token definitions for primary brand red (`#ca0019`), dark slate neutrals, and secondary accents.
- [`typography.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/typography.js): Font family definitions (Inter, Poppins) and responsive header scales.

---

### Utilities & Mock Datasets (`src/utils/` & `src/assets/dummyData/`)

- [`src/utils/fileValidation.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/utils/fileValidation.js): File type and maximum file size validator for image/document uploads.
- [`src/utils/preload.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/utils/preload.js): Dynamic route and component code-splitting preloader on hover.
- [`src/utils/videoUtils.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/utils/videoUtils.js): YouTube URL parser extracting video IDs and embed URLs.
- [`src/hooks/useInView.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/hooks/useInView.js): Viewport intersection observer hook triggering animations on scroll.
- [`src/assets/dummyData/`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/assets/dummyData): Fallback mock data used for offline testing (`adminData.js`, `blogData.js`, `eventsData.js`, `fineData.js`, `gdpData.js`, `memberData.js`, `reviewData.js`).

---

## 3. Backend Server (`server/`)

### Server Entry & Config
- **[`server/server.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/server.js)**: Initializes Express, attaches CORS for localhost and Vercel domains, mounts routes, connects MongoDB.
- **[`server/config/db.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/config/db.js)**: Mongoose connection manager with reconnection logic.
- **[`server/config/email.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/config/email.js)**: Nodemailer SMTP transport using Google Workspace credentials.
- **[`server/config/googleDrive.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/config/googleDrive.js)**: Google Drive API client using service account keys.

### Middleware Pipeline
- **[`server/middlewares/auth.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/middlewares/auth.js)**: `verifyToken` JWT validator and `checkRole` authorization filter.
- **[`server/middlewares/errorHandler.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/middlewares/errorHandler.js)**: Centralized error handling middleware.
- **[`server/middlewares/upload.js`](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/server/middlewares/upload.js)**: In-memory `multer` buffer handler for file streams.

### Domain Controllers (`server/controller/`)
- **`Community/batchController.js`**: Single Source of Truth controller for `/api/batches/all` and `/api/batches/profiles`.
- **`events/eventController.js`**: Event creation, registration tracking, image uploading.
- **`Community/projectController.js`**: Student project showcases and Drive thumbnail persistence.
- **`admin/memberController.js`**: Administrative roster management, status updates, disciplinary fines.
- **`uniques360/taskController.js`** & **`uniques360/reportController.js`**: Task dispatch and daily student work reports.
- **`Authentication/auth.controller.js`**: Bcrypt password validation, JWT token creation, registration.
- **`googleDriveService.js`**: Drive folder management, file streaming, and public link generation.

### Mongoose Models (`server/models/`)
- **`community/batchModel.js`**: Cohort schema (`Batch`) mapped to collection `batchprofiles`.
- **`member/memberModel.js`**: Student/coordinator user model with contact info, roll number, fines.
- **`community/eventModel.js`**: Events, agendas, registration lists, budget entries.
- **`community/projectModel.js`**: Project titles, tech stacks, GitHub/live links.
- **`uniques360/taskModel.js`**: Assigned tasks, priority, due dates, statuses.
- **`uniques360/reportModel.js`**: Daily milestone reports and blockers.
- **`member/leaveModel.js`**: Leave requests, dates, justification, approval status.
- **`user/userModel.js`**: Legacy and admin authentication records.
- **`Enquiry/enquiryModel.js`**: Inbound partner and student inquiries.
