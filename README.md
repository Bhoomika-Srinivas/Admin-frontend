# BIET Admin Dashboard

Admin frontend for the **Bapuji Institute of Engineering & Technology** website. Built as a React SPA, it connects to an AWS AppSync GraphQL backend with Cognito authentication.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| API | AWS AppSync (GraphQL via `gqlRequest`) |
| Auth | Amazon Cognito (`amazon-cognito-identity-js`) |
| Validation | Zod |
| Icons | Lucide React |
| Utilities | clsx, date-fns |
| Linting | ESLint (`--max-warnings 0`) |
| Git hooks | Husky (pre-commit: lint + conflict marker check) |
| CI | GitHub Actions (lint + build on PRs to `dev` / `main`) |

---

## Getting Started

```bash
npm install

# Copy and fill in env vars
cp .env.example .env

npm run dev        # Vite dev server
npm run build      # tsc + vite build
npm run lint       # ESLint (zero warnings)
npm run preview    # Preview production build
```

### Environment Variables

```env
VITE_API_BASE_URL=          # Django REST API base URL
VITE_APPSYNC_URL=           # AWS AppSync GraphQL endpoint
VITE_COGNITO_USER_POOL_ID=  # Cognito User Pool ID
VITE_COGNITO_CLIENT_ID=     # Cognito App Client ID
```

---

## Branch Strategy

```
feature/* → dev → main
```

- Always branch off `dev`, open PRs back to `dev`
- `main` receives merges from `dev` for releases
- CI runs on every PR targeting `dev` or `main`

---

## Project Structure

```
src/
├── api/
│   └── graphqlClient.ts          # gqlRequest — all GraphQL calls go here
│
├── auth/
│   └── AuthContext.tsx           # Cognito auth state + useAuth()
│
├── core-modules/                 # Backend core module UIs
│   ├── auth/
│   ├── users/
│   ├── notifications/
│   └── audit/
│
├── app-modules/                  # Feature module UIs
│   ├── dashboard/
│   ├── departments/              # Department workspace (see below)
│   ├── events/
│   ├── news/
│   ├── faculty/
│   ├── courses/
│   ├── placements/
│   ├── alumni/
│   ├── committees/
│   └── profile/
│
├── shared/
│   ├── components/               # Reusable UI components
│   │   ├── tables/DataTable.tsx
│   │   ├── common/Modal, Badge, ConfirmDialog, …
│   │   ├── forms/FormField.tsx
│   │   └── filters/SearchBar, SelectFilter
│   ├── context/                  # ToastContext, NotificationContext
│   ├── hooks/                    # usePagination, useSearch, useConfirmDialog, …
│   ├── utils/                    # permissions.ts, s3Upload.ts
│   └── types/
│       └── models.ts             # All shared TypeScript interfaces
│
├── layout/                       # DashboardLayout, Sidebar, Navbar
├── router/
│   └── router.tsx                # All routes
└── data/
    └── mockData.ts               # Seed data for development
```

Each module follows the same internal layout:
```
<module>/
├── api/          <module>Api.ts
├── graphql/      <module>.query.ts + <module>.mutation.ts
├── components/
├── hooks/
├── pages/
└── types.ts
```

---

## Roles

| Role | Access |
|---|---|
| `super_admin` | Full access across all departments and modules |
| `dept_admin` | Scoped to their own department only |

Permission checks use `can(user, permission)` from `src/shared/utils/permissions.ts`.

---

## Module Overview

### Admin Dashboard (`/`)
Stats, activity feed, quick links.

### Site Content
| Route | Description |
|---|---|
| `/news` | Institutional news — create, edit, delete |
| `/events` | Institutional + department events with approval flow |

Events support single-day and multi-day (`isMultiDay`) with `startDate/endDate/startTime/endTime`. Department events require super admin approval; super admin events are auto-approved.

### Departments (`/departments`)
Lists all departments. Each department has a dedicated workspace at `/departments/:deptId/` with the following sections:

**Info**
- Introduction, About, HOD Profile, Distinguished Alumni

**People**
- Faculty, Staff, Accreditations

**Research**
- Faculty Research, PhD Guide, Publications, Grants, Patents

**Academics**

| Section | Route Pattern |
|---|---|
| Courses | `academics/courses` → UG/PG → Program → Semester → Batch → Course list |
| Timetable | `academics/timetable` → UG/PG → Program → Semester → Batch → Sections → Grid |
| Learning Materials | `academics/materials` → Program → Semester → Batch → Course → Files |
| Innovative Teaching | `academics/teaching` |
| Result Analysis | `academics/results` |

Batches are named as year ranges (e.g. `2021-25`) auto-generated from program type duration (UG = 4 yr, PG = 2 yr).

**Activities**
- Events, Placements, Achievements, Forum Activities (with PDF attachments), Newsletter (year + PDF), Photo Gallery

### Admin Academics (`/academics`)
- Faculty list + profiles
- Course catalog (admin-level: Program → Department → Semester → Batch → Courses)

### Other Modules
- `/committees` — Committee management (super admin only)
- `/placements` — Placement records
- `/alumni` — Alumni directory

---

## Key Patterns

### GraphQL
All requests go through `gqlRequest<T>(query, variables?)` in `src/api/graphqlClient.ts`. Never call `fetch()` directly.

```ts
import { gqlRequest } from '@/api/graphqlClient'
const data = await gqlRequest<{ listEvents: { items: BackendEvent[] } }>(LIST_EVENTS, { level: 'institutional' })
```

### Page Pattern (every list page)
1. Fetch data with a `useSomethingAsync` hook
2. Filter/search with `useState` + `useMemo`
3. Paginate with `usePagination`
4. Render with `DataTable<T>`
5. Add/edit via `Modal` + `FormField`
6. Delete via `ConfirmDialog`

### S3 Uploads
```ts
import { uploadToS3 } from '@/shared/utils/s3Upload'
const url = await uploadToS3(file, 'module-name', entityId)
```

### Auth Guard
```tsx
<ProtectedRoute permission="manage:committees">
  <CommitteesPage />
</ProtectedRoute>
```

---

## Pre-commit Hooks

Husky runs on every commit:
1. Blocks `.env` files from being staged
2. Blocks merge conflict markers (git conflict delimiters)
3. Runs `npm run lint` (zero warnings enforced)

---

## CI (GitHub Actions)

Triggers on PRs to `dev` or `main`:
1. Install dependencies (`npm ci`)
2. Run ESLint
3. Run `tsc + vite build`

Secrets required in GitHub repo settings: `VITE_API_BASE_URL`, `VITE_APPSYNC_URL`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`.
