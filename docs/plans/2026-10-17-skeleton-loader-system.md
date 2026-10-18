# Skeleton Loader System & UX State Optimization Implementation Plan

**Goal:** Build and deploy a zero-dependency, brand-themed reusable skeleton loader component library and state stabilization system to eliminate Cumulative Layout Shift (CLS), full-screen flashes, and unstyled loading text across The Uniques Portal.

**Architecture:** Combine `@mui/material/Skeleton` v6.4.6 with Tailwind CSS responsive layouts in a modular `src/components/common/skeletons` directory. Synchronize Tailwind `dark` mode with MUI's ThemeProvider, introduce a slim 3px top-bar route transition loader, and upgrade critical views (Landing, Admin, and Uniques360) to maintain stable layouts with zero height jumping.

**Tech Stack:** React 18.3, `@mui/material` v6.4.6, `@emotion/react`, Tailwind CSS 3.4, Framer Motion v11, Redux Toolkit v2.5.0, Vite 6.

---

## Proposed Changes

### Theme & Global Layout

#### [ThemeProvider.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/theme/ThemeProvider.jsx)
- Synchronize `document.documentElement.classList.toggle('dark', isDarkMode)` inside an effect so Tailwind and MUI dark mode stay in exact parity.

#### [src/components/common/loaders/TopBarProgress.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/loaders/TopBarProgress.jsx)
- Build a lightweight 3px brand-red (`#ca0019`) top-of-viewport indeterminate progress bar for route transitions.

#### [src/utils/Loader/index.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/utils/Loader/index.jsx)
- Modernize the Suspense HOC fallback to use `TopBarProgress` instead of mounting the intrusive full-screen portal modal.

---

### Reusable Skeleton Primitives

#### [src/components/common/skeletons/BaseSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/BaseSkeleton.jsx)
- Core wrapper around `@mui/material/Skeleton` with preconfigured `animation="wave"` and theme-aware surface colors.

#### [src/components/common/skeletons/CardSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/CardSkeleton.jsx)
- Parameterized card skeleton supporting `type="member"`, `type="trainer"`, and `type="event"`, matching exact card aspect ratios and badge placements.

#### [src/components/common/skeletons/TableSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/TableSkeleton.jsx)
- Renders `rows` and `columns` with simulated avatar, text lines, status badge pill, and action icons to preserve exact table height during data fetching.

#### [src/components/common/skeletons/StatsSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/StatsSkeleton.jsx)
- 4 or 8-card responsive metric tile skeleton preserving label, number shimmer, and subtitle positions.

#### [src/components/common/skeletons/FeedSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/FeedSkeleton.jsx)
- Feed item skeleton for Uniques 360 report feed, notices, and activity logs.

#### [src/components/common/skeletons/WorkspaceSkeleton.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/WorkspaceSkeleton.jsx)
- Two-column split skeleton for Uniques 360 member and coordinator workspaces (sidebar + feed area).

#### [src/components/common/skeletons/index.js](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/components/common/skeletons/index.js)
- Barrel export for clean imports across the application.

---

### High-Priority View Upgrades

#### [src/routes/ProtectedRoute.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/routes/ProtectedRoute.jsx)
- Replace bare unstyled `<div>Loading...</div>` with `<CustomLoader />`.

#### [src/views/Landing/Trainers/index.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Landing/Trainers/index.jsx)
- Replace `<CustomLoader />` full-screen portal with in-place `<CardSkeleton type="trainer" count={8} />`.

#### [src/views/Landing/homComponents/Batches.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Landing/homComponents/Batches.jsx)
- Replace centered CSS spinner div with 4-card `<CardSkeleton type="member" count={4} />`.

#### [src/views/Landing/homComponents/Event.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Landing/homComponents/Event.jsx)
- Replace bare `<div className="text-center">Loading events...</div>` with 3-item carousel card skeleton.

#### [src/views/Admin/Accounts/index.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Admin/Accounts/index.jsx)
- Replace `<CircularProgress size={24} />` inside stat values with `<StatsSkeleton count={8} />`.

#### [src/views/Admin/Accounts/components/TransactionTable.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Admin/Accounts/components/TransactionTable.jsx)
- Replace collapsing single-row `<CircularProgress />` with `<TableSkeleton rows={8} columns={6} />`.

#### [src/views/Uniques360/Member360/uniques360.jsx](file:///run/media/jimfleax/DEV/Projects/The-Uniques-Portal/src/views/Uniques360/Member360/uniques360.jsx)
- Replace 100vh full-page spinner with `<WorkspaceSkeleton />`.

---

## Step-by-Step Implementation Tasks

### Task 1: Dark Mode DOM Synchronization & TopBarProgress
**Files:**
- Modify: `src/theme/ThemeProvider.jsx`
- Create: `src/components/common/loaders/TopBarProgress.jsx`
- Modify: `src/utils/Loader/index.jsx`
- Modify: `src/routes/ProtectedRoute.jsx`

**Step 1: Update ThemeProvider**
Add effect to synchronize `document.documentElement.classList.toggle('dark', isDarkMode)` when `isDarkMode` changes.

**Step 2: Create TopBarProgress component**
Create fixed 3px top linear progress with branded `#ca0019` accent.

**Step 3: Update Loader HOC & ProtectedRoute**
Swap route transition fallback to `TopBarProgress` and replace `<div>Loading...</div>` in `ProtectedRoute.jsx` with `<CustomLoader />`.

**Step 4: Verify build**
Run: `npm run build`
Expected: Build succeeds with 0 lint/syntax errors.

---

### Task 2: Implement Core Skeleton Library Primitives
**Files:**
- Create: `src/components/common/skeletons/BaseSkeleton.jsx`
- Create: `src/components/common/skeletons/CardSkeleton.jsx`
- Create: `src/components/common/skeletons/TableSkeleton.jsx`
- Create: `src/components/common/skeletons/StatsSkeleton.jsx`
- Create: `src/components/common/skeletons/FeedSkeleton.jsx`
- Create: `src/components/common/skeletons/WorkspaceSkeleton.jsx`
- Create: `src/components/common/skeletons/index.js`

**Step 1: Write BaseSkeleton**
Configure MUI Skeleton wrapper with `animation="wave"` and dark mode awareness.

**Step 2: Write domain-specific skeletons**
Implement `CardSkeleton`, `TableSkeleton`, `StatsSkeleton`, `FeedSkeleton`, and `WorkspaceSkeleton`.

**Step 3: Export barrel**
Create `index.js` exporting all skeleton primitives.

**Step 4: Verify build**
Run: `npm run build`
Expected: Build succeeds with new skeleton module bundle.

---

### Task 3: Upgrade Landing & Home Page Views
**Files:**
- Modify: `src/views/Landing/Trainers/index.jsx`
- Modify: `src/views/Landing/homComponents/Batches.jsx`
- Modify: `src/views/Landing/homComponents/Event.jsx`
- Modify: `src/views/Landing/homComponents/Highlight.jsx`

**Step 1: Remove CustomLoader portal from Trainers**
Replace with `<CardSkeleton type="trainer" count={8} />`.

**Step 2: Replace spinning divs in Batches**
Replace with `<CardSkeleton type="member" count={4} />`.

**Step 3: Replace raw text in Home Event**
Replace with carousel skeleton cards.

**Step 4: Verify build**
Run: `npm run build`
Expected: Clean build without errors.

---

### Task 4: Upgrade Admin Portal (Accounts & TransactionTable)
**Files:**
- Modify: `src/views/Admin/Accounts/index.jsx`
- Modify: `src/views/Admin/Accounts/components/TransactionTable.jsx`
- Modify: `src/views/Admin/Members/index.jsx`

**Step 1: Update Accounts stat tiles**
Render `<StatsSkeleton count={8} />` during loading instead of injecting CircularProgress into typography.

**Step 2: Update TransactionTable loading row**
Render `<TableSkeleton rows={8} columns={6} />` maintaining table structure and fixed height.

**Step 3: Update Admin Members tab switching**
Replace centered CircularProgress with `<CardSkeleton type="member" count={8} />`.

**Step 4: Verify build**
Run: `npm run build`
Expected: Build passes.

---

### Task 5: Upgrade Uniques 360 Workspace
**Files:**
- Modify: `src/views/Uniques360/Member360/uniques360.jsx`
- Modify: `src/views/Uniques360/Member360/components/ReportFeed.jsx`
- Modify: `src/views/Uniques360/Coordinator360/Uniques360.jsx`

**Step 1: Replace 100vh full-page spinner in Member 360**
Use `<WorkspaceSkeleton />` so sidebar layout and main header shell stay visible immediately.

**Step 2: Replace feed box spinner in ReportFeed**
Render `<FeedSkeleton count={4} />` when switching active tasks.

**Step 3: Update Coordinator 360**
Replace full-page spinner with stats + task table skeletons.

**Step 4: Verify build & test**
Run: `npm run build`
Expected: Build succeeds.
