# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Type-check + build for production (tsc && vite build)
npm run lint         # ESLint with zero max-warnings
npm run preview      # Preview production build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` and `VITE_APPSYNC_URL` before starting.

## Architecture

**React 18 + TypeScript SPA** built with Vite, Tailwind CSS, React Router v6, and Axios.

### Directory Structure

```
src/
├── api/                    # Centralized API clients
│   └── graphqlClient.ts    # All GraphQL requests go through here
│
├── core-modules/           # UI for backend core modules
│   ├── auth/
│   ├── users/
│   ├── notifications/
│   └── audit/
│
├── app-modules/            # UI for backend app modules
│   ├── departments/
│   ├── faculty/
│   ├── courses/
│   ├── events/
│   ├── news/
│   ├── placements/
│   ├── alumni/
│   ├── committees/
│   ├── dashboard/
│   └── profile/
│
├── shared/
│   ├── components/         # Reusable, feature-agnostic UI components
│   ├── context/            # ToastContext, NotificationContext
│   ├── hooks/              # Reusable hooks (usePagination, useDebounce, …)
│   ├── utils/              # permissions.ts and other helpers
│   ├── constants/
│   └── types/              # models.ts — all shared TypeScript interfaces
│
├── layout/                 # DashboardLayout, Sidebar, Navbar
├── router/                 # router.tsx
├── auth/                   # AuthContext.tsx (cross-cutting auth context)
├── assets/
└── data/                   # mockData.ts, coursesData.ts (in-memory data)
```

### Module Structure

Every module (core or app) follows this internal layout:

```
<module>/
├── api/          <module>Api.ts      — service / API functions
├── graphql/
│   ├── <module>.query.ts             — GraphQL query strings
│   └── <module>.mutation.ts          — GraphQL mutation strings
├── components/   feature-specific UI components
├── hooks/        <module> data hooks
├── pages/        route-level page components
├── types.ts      re-exports from shared/types/models
└── index.ts      public exports for the module
```

**GraphQL file naming convention:** always prefix with the module name.

```
faculty/graphql/faculty.query.ts
faculty/graphql/faculty.mutation.ts
departments/graphql/departments.query.ts
```

Import pattern inside a module:

```ts
import { GET_FACULTY }    from '../graphql/faculty.query'
import { CREATE_FACULTY } from '../graphql/faculty.mutation'
```

### Adding a New Module

1. Create `src/app-modules/<name>/` with the full internal structure above.
2. Add pages to `src/router/router.tsx`.
3. Export pages from the module's `index.ts`.
4. Put any reusable UI in `src/shared/components/` — never inside a module.

### Layout Shell

`DashboardLayout` (`src/layout/`) wraps every authenticated route via React Router's `<Outlet>`. It owns `sidebarOpen` state and composes `Sidebar` + `Navbar`. All page content renders inside `<main>`.

### Page Pattern

Every list page follows this pattern:

1. Filter/search state with `useState` + `useMemo`
2. Client-side pagination (slice the filtered array)
3. `DataTable` for rendering rows
4. `Modal` + `FormField` for add/edit
5. `ConfirmDialog` for delete

### Shared Components

All live in `src/shared/components/`.

- `DataTable<T>` — generic table; pass `columns: Column<T>[]`, `data`, `keyExtractor`, and optional pagination props
- `Modal` / `ModalFooter` — controlled modal with backdrop
- `Badge` + `statusVariant` — semantic color badges for status values
- `ConfirmDialog` — delete confirmation
- `SearchBar`, `SelectFilter` — filter controls used at the top of every list page
- `PlaceholderPage` — placeholder for unimplemented routes
- `StatCard` — dashboard stat card

### Styling Conventions

Tailwind utility classes plus component-layer aliases defined in `src/index.css`:
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-danger`
- Inputs: `.input-field`, `.label`
- Cards: `.card`
- Table cells: `.table-th`, `.table-td`
- Sidebar links: `.sidebar-link-active`, `.sidebar-link-inactive`

Custom Tailwind tokens: `brand-*` (blue scale), `accent-400/500` (amber), fonts `font-sans` (Outfit) and `font-display` (Syne), shadow `shadow-card`.

### Types

All shared TypeScript interfaces are in `src/shared/types/models.ts`. The shared `Status` union and `PaginatedResponse<T>` / `ApiResponse<T>` wrappers are defined there. Module-specific types go in the module's own `types.ts`.

### Auth

`apiClient` (`src/services/apiClient.ts`) reads `auth_token` from `localStorage` and attaches it as a Bearer token. A 401 response clears the token and redirects to `/login`. The new `graphqlClient` (`src/api/graphqlClient.ts`) does the same for GraphQL requests.

### Role-Based Access Control

Two application roles: `super_admin` and `dept_admin`.

**Permission layer** (`src/shared/utils/permissions.ts`): Defines `Permission` tokens and a `ROLE_PERMISSIONS` map. Use `can(user, permission)` for boolean checks, `canManageDepartment(user, shortName)` for per-department checks.

**Auth context** (`src/auth/AuthContext.tsx`): `AuthProvider` holds the active `User` in state. `useAuth()` returns `{ user, switchUser }`. Wraps `RouterProvider` in `App.tsx`.

**Route guards** (`src/shared/components/common/ProtectedRoute.tsx`): Redirects to `/` if the user lacks the required permission. Applied in `router/router.tsx`.

**UI-level enforcement**:
- `DepartmentsPage` / `FacultyListPage`: data pre-filtered to `user.department` for `dept_admin`
- `EventsPage`: Approve/Reject shown only when `can(user, 'events:approve')`
- `Sidebar`: items with a `permission` field filtered at render time using `can()`
- `Navbar`: shows user name, role badge, and a "Switch Demo User" dropdown

### Service Layer (In-Memory)

Modules use in-memory service singletons seeded from `src/data/mockData.ts`. Each service now lives in its module's `api/` folder.

| Location | Service | Key extras |
|----------|---------|-----------|
| `app-modules/events/api/eventsApi.ts` | `eventService` | Conflict detection, `approve()`, `reject()`, triggers notifications + audit |
| `core-modules/notifications/api/notificationsApi.ts` | `notificationService` | Per-user in-memory notifications |
| `core-modules/audit/api/auditApi.ts` | `auditService` | Append-only log; called by all other services |
| `app-modules/faculty/api/facultyApi.ts` | `facultyService` | Standard CRUD + audit |
| `app-modules/departments/api/departmentsApi.ts` | `departmentService` | Standard CRUD + audit |
| `app-modules/news/api/newsApi.ts` | `newsService` | Standard CRUD + audit |
| `app-modules/alumni/api/alumniApi.ts` | `alumniService` | Standard CRUD + audit |
| `app-modules/committees/api/committeesApi.ts` | `committeeService` | Standard CRUD + audit |
| `app-modules/placements/api/placementsApi.ts` | `placementService` | Standard CRUD + audit |
| `core-modules/users/api/usersApi.ts` | `userService` | Standard CRUD + audit |

To connect to a real backend, replace the in-memory implementations with `gqlRequest` calls from `src/api/graphqlClient.ts`.

### Contexts

**Toast** (`src/shared/context/ToastContext.tsx`): `ToastProvider` renders a fixed bottom-right toast container. `useToast()` returns `{ success, error, warning, info }`. Auto-dismisses after 3.5 s.

**Notifications** (`src/shared/context/NotificationContext.tsx`): `NotificationProvider` re-syncs unread count when `userId` changes. `useNotifications()` returns `{ unreadCount, refresh }`. Bell icon in `Navbar` shows live count.

### GraphQL Client

`src/api/graphqlClient.ts` exports `gqlRequest<T>(query, variables?)`. All future API calls must go through this function — modules must not call `fetch()` directly.

### Routes

Defined in `src/router/router.tsx`. Routes map to module page components imported via each module's `index.ts`.

### Routes Not Yet Implemented

Placeholder routes: Gallery, Results, Admissions (Applications & Students), Campus Life (Clubs, Sports), Facilities (Labs, Library, Hostel), Settings. Implement by adding a page inside `src/app-modules/<name>/pages/` and registering it in `src/router/router.tsx`.

## UI Specifications

### Page Header Pattern

Every list/management page must follow this layout:

```
[Page Title + subtitle]                    [Primary Action Button]
```

- The primary action button (e.g. "Add Event") belongs in the **page header**, never inside cards or filter rows.
- Cards are for **statistics and navigation only** — no action buttons inside cards.
- Subtitle format: `"N events • M upcoming • Context"` — use `•` as separator, not `·` or `/`.

### Filter Row Layout

All filter rows must use `flex items-center justify-between`:

```
[Search bar — far left]         [Filters — far right, grouped]
```

- Search bar: `max-w-xs`, always aligned to the left.
- Filter controls: grouped in a `div` with `flex items-center gap-3 shrink-0`, aligned to the right.
- Filter order from **left to right** inside the right group: `Department ▼` → `Sort ▼` → `Approval ▼`
  (i.e. rightmost filter visually = Approval, leftmost = Department).
- Never mix search and filter controls in a single flex row without `justify-between`.

### Event Context Rules

- **Site Content → Events** (`/events`): manages **institutional** events only. "Add Event" always creates `level: 'institutional'`. No level selector in the form.
- **Department workspace → Activities → Events** (`/departments/:deptId/activities/events`): manages events for **that specific department only**. Scoped to `department === deptShortName` for all roles. "Add Event" auto-assigns the dept from URL context — no department dropdown in the form.
- **Department Events moderation** (inside `/events` → Department Events view): super admin can see and create events for any department. "Add Event" shows a **department dropdown** to pick the target dept.

### Badge Usage

- Department identifiers must render as `DeptBadge` (e.g. `[CSE]`), never as plain text like "Dept: CSE".
- `DeptBadge` is exported from `src/app-modules/events/components/EventBadges.tsx`.
- Status and approval states use `StatusBadge` and `ApprovalBadge` from the same file.

### Pending Approval Alert

- The amber pending-approval banner must be **fully clickable** (entire row acts as a button).
- It must include a visible **"View Pending"** text link on the right.
- Clicking either sets the approval filter to `'pending'` and resets pagination.
