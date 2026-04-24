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

Copy `.env.example` to `.env` and fill in all four variables before starting:
- `VITE_API_BASE_URL` — REST base URL (legacy Axios client)
- `VITE_APPSYNC_URL` — AWS AppSync GraphQL endpoint
- `VITE_COGNITO_USER_POOL_ID` — Cognito User Pool ID
- `VITE_COGNITO_CLIENT_ID` — Cognito App Client ID

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

Authentication uses **AWS Cognito** (`amazon-cognito-identity-js`). Tokens are held in memory — never `localStorage`.

- `src/api/cognitoClient.ts` — `signIn`, `signOut`, `getCurrentSession`, `getCurrentToken`
- `src/auth/AuthContext.tsx` — `AuthProvider` builds the `User` object entirely from the Cognito JWT claims on login and session restore. No backend call is made at login time. Claims used: `sub` (id), `name`, `email`, `custom:roles` (JSON array), `custom:permissions` (JSON array, injected by pre-token-gen Lambda), `custom:tenant_id`, `custom:department`.
- `src/api/graphqlClient.ts` — calls `getCurrentToken()` and attaches it as `Authorization` header on every AppSync request. A 401 redirects to `/login`. Also sends `X-CSRF-Token`.
- `src/services/apiClient.ts` — legacy Axios REST client. Same token attach + 401 redirect pattern. Only used by modules not yet migrated to GraphQL.

`useAuth()` returns `{ user, isAuthenticated, login, logout, updateProfile }`.

### Role-Based Access Control

Two application roles: `super_admin` (full access) and `dept_admin` (own department only). Backend may send `dept-admin` (hyphen) — mapped to `dept_admin` in `AuthContext`.

**IMPORTANT — two separate permission layers, do not confuse them:**

**Layer 1 — Frontend sidebar/route gating** (`src/shared/utils/permissions.ts`):
- Static `ROLE_PERMISSIONS` map keyed by `user.role` → `Permission[]`
- Tokens: `manage:users`, `manage:all_departments`, `manage:own_department`, `manage:alumni`, `manage:committees`, `manage:placements`, `content:create`, `content:edit`, `content:delete`, `events:approve`
- `can(user, permission)` checks this map. It does **NOT** read `user.permissions`.
- Changing backend roles/permissions does not affect sidebar visibility without also updating this map.

**Layer 2 — Backend JWT claims** (`custom:permissions` in the Cognito token):
- Injected by the pre-token-generation Lambda into every token
- Stored in `user.permissions: string[]` (e.g. `"alumni:read:all"`, `"events:create:dept"`)
- Format: `module:action:scope`
- Used by backend AppSync resolvers for fine-grained authorization. The frontend sidebar and `ProtectedRoute` do **NOT** read this array — they only use Layer 1.

**Route guards** (`src/shared/components/common/ProtectedRoute.tsx`): Redirects to `/` if `can(user, permission)` returns false. Applied in `router/router.tsx`.

**UI-level enforcement**:
- `DepartmentsPage` / `FacultyListPage`: data pre-filtered to `user.department` for `dept_admin`
- `EventsPage`: Approve/Reject shown only when `can(user, 'events:approve')`
- `Sidebar`: items with a `permission` field filtered at render time using `can()`
- `Navbar`: shows user name and role badge

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

Modules already migrated to `gqlRequest`: `users`, `audit`, `settings` (roles + system settings). Remaining in-memory modules: `events`, `news`, `notifications`, `faculty`, `departments`, `alumni`, `committees`, `placements`. To migrate a module, replace its in-memory service with `gqlRequest` calls and add GraphQL query/mutation strings in its `graphql/` folder.

### Contexts

**Toast** (`src/shared/context/ToastContext.tsx`): `ToastProvider` renders a fixed bottom-right toast container. `useToast()` returns `{ success, error, warning, info }`. Auto-dismisses after 3.5 s.

**Notifications** (`src/shared/context/NotificationContext.tsx`): `NotificationProvider` re-syncs unread count when `userId` changes. `useNotifications()` returns `{ unreadCount, refresh }`. Bell icon in `Navbar` shows live count.

### GraphQL Client

`src/api/graphqlClient.ts` exports `gqlRequest<T>(query, variables?)`. All future API calls must go through this function — modules must not call `fetch()` directly.

### Routes

Defined in `src/router/router.tsx`. Routes map to module page components imported via each module's `index.ts`.

### Routes Not Yet Implemented

Placeholder routes still showing `<PlaceholderPage>`: Gallery, Results, Campus Life (Clubs, Sports), Facilities (Labs, Library, Hostel), Announcements, ERP. Implement by adding a page inside the relevant `src/app-modules/<name>/pages/` folder and registering it in `src/router/router.tsx`.

### Vite Dev Server — CSP Warning

Do **NOT** add a `Content-Security-Policy` header under `server.headers` in `vite.config.ts`. It blocks the inline `<script type="module">` that `@vitejs/plugin-react` injects for React Fast Refresh, causing every component to throw `"@vitejs/plugin-react can't detect preamble"` at runtime. The CSP in `index.html`'s `<meta http-equiv="Content-Security-Policy">` tag is the correct place for dev-time CSP.

### File Uploads

`src/shared/utils/uploadToS3.ts` (also re-exported as `s3Upload.ts`) — correct calling convention:

```ts
// Returns Promise<string> (the public URL) — throws on validation failure
uploadToS3(file: File, path?: string, id?: string): Promise<string>

// Example usage (3 args is correct):
const url = await uploadToS3(file, 'dept-academics', deptId)
```

Do not use the old 2-arg `(file, options: UploadOptions)` signature — callers across the codebase all use the 3-arg form.

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
