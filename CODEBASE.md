# BIET Admin — Codebase Reference

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + custom component classes |
| Routing | React Router v6 |
| API | AWS AppSync (GraphQL) |
| Auth | AWS Cognito (amazon-cognito-identity-js) |
| Storage | AWS S3 |
| HTTP Client | `fetch` (via `gqlRequest`) |

---

## Directory Structure

```
src/
├── api/                          # Global API clients
│   ├── graphqlClient.ts          # gqlRequest<T>() — all GraphQL calls go here
│   └── cognitoClient.ts          # Cognito sign-in / token refresh
│
├── auth/
│   ├── AuthContext.tsx           # React context: user, login, logout, switchUser
│   └── permissions.ts            # Permission tokens + ROLE_PERMISSIONS map
│
├── layout/
│   ├── DashboardLayout.tsx       # Admin sidebar shell (auth guard)
│   ├── DepartmentWorkspaceLayout.tsx  # Dept workspace shell (loads dept context)
│   ├── Navbar.tsx
│   └── Sidebar.tsx
│
├── router/
│   └── router.tsx                # All routes (public + admin + dept workspace)
│
├── shared/
│   ├── components/
│   │   ├── cards/StatCard.tsx
│   │   ├── common/               # Modal, ConfirmDialog, Badge, ProtectedRoute, …
│   │   ├── filters/              # SearchBar, SelectFilter
│   │   ├── forms/FormField.tsx
│   │   └── tables/DataTable.tsx
│   ├── context/
│   │   ├── ToastContext.tsx       # useToast() → success / error / warning / info
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   ├── useConfirmDialog.ts
│   │   ├── usePagination.ts
│   │   └── useSearch.ts
│   ├── types/
│   │   └── models.ts             # ALL shared TypeScript interfaces (see below)
│   └── utils/
│       ├── permissions.ts        # can(), canManageDepartment()
│       ├── s3Upload.ts           # uploadToS3(file, folder, id)
│       └── validateFile.ts
│
├── data/
│   ├── mockData.ts               # Legacy in-memory seed data
│   └── coursesData.ts
│
├── core-modules/                 # Platform-level features
│   ├── auth/                     # LoginPage
│   ├── users/                    # UsersPage (super_admin only)
│   ├── notifications/            # NotificationsPage
│   └── audit/                    # AuditLogsPage
│
├── app-modules/                  # Business features
│   ├── dashboard/
│   ├── faculty/
│   ├── departments/              # Largest module — see breakdown below
│   ├── events/
│   ├── news/
│   ├── alumni/
│   ├── committees/
│   ├── placements/
│   ├── courses/
│   └── profile/
│
├── App.tsx
└── main.tsx
```

---

## Module Internal Structure

Every module follows this identical layout:

```
<module>/
├── api/
│   └── <module>Api.ts          Service functions (calls gqlRequest)
├── graphql/
│   ├── <module>.query.ts       GraphQL query strings
│   └── <module>.mutation.ts    GraphQL mutation strings
├── components/                 Feature-specific UI only
├── hooks/                      Data hooks for this module
├── pages/                      Route-level page components
├── types.ts                    Module-local type re-exports
└── index.ts                    Public exports
```

---

## Backend Integration

### How a GraphQL call works

```
Page component
  → calls service function  (src/app-modules/<mod>/api/<mod>Api.ts)
      → calls gqlRequest()  (src/api/graphqlClient.ts)
          → getCurrentToken() from Cognito
          → POST VITE_APPSYNC_URL  { query, variables }
          → if json.errors → throw Error(json.errors[0].message)
          → return json.data as T
      → maps backend shape → frontend shape
  → updates React state
```

### `gqlRequest<T>` — `src/api/graphqlClient.ts`

```ts
gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T>
```

- Gets JWT from Cognito via `getCurrentToken()`
- Sends as `Authorization: <token>` header to AppSync endpoint
- Throws on `json.errors` (any GraphQL error bubbles up as `Error`)
- Returns `json.data` cast to `T`
- 401 → redirects to `/login`

### `cognitoClient.ts`

| Function | Purpose |
|----------|---------|
| `signIn(email, password)` | USER_PASSWORD_AUTH flow → session |
| `signOut()` | Clears Cognito session |
| `getCurrentSession()` | Returns valid session or null |
| `getCurrentToken()` | Returns JWT string or null |

### Environment Variables (`.env`)

```
VITE_API_BASE_URL=        # REST base (legacy)
VITE_APPSYNC_URL=         # AppSync endpoint
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_S3_BUCKET=           # S3 bucket for file uploads
VITE_AWS_REGION=
```

---

## Departments Module (Detailed)

The largest module — manages the entire department workspace at `/departments/:deptId/...`

### API Files

| File | Services | Backend Scope |
|------|----------|---------------|
| `departmentsApi.ts` | `departmentService` | List/create/update/delete departments |
| `deptAboutApi.ts` | `deptAboutService`, `swotService`, `programOutcomeService` | Vision/mission, SWOT, POs |
| `deptAcademicsApi.ts` | `deptCourseService`, `timetableService`, `learningMaterialService`, `innovativeTeachingService`, `resultAnalysisService` | Courses, timetables, materials, results |
| `deptActivitiesApi.ts` | `placementOverviewService`, `studentPlacementService`, `achievementService`, `forumSectionService`, `forumEventService`, `departmentActivityService`, `newsletterService`, `galleryPhotoService` | All activity sub-sections |
| `deptBrandingApi.ts` | `deptBrandingService` | Logo, social links, contact info |
| `deptPeopleApi.ts` | `hodProfileService`, `distinguishedAlumniService`, `committeeMemberService`, `deptStaffService`, `accreditationService` | People sub-sections |
| `deptResearchApi.ts` | `deptPublicationService`, `publicationProfileService`, `researchGrantService`, `patentService`, `facultyResearchService`, `phdGuideService`, `phdScholarService` | Research sub-sections |
| `adminCoursesApi.ts` | `adminProgramService`, `adminProgramDeptService`, `adminBatchService`, `adminCourseService` | Admin course catalog |

### GraphQL Files

```
graphql/
├── departments.query.ts / .mutation.ts     # List/CRUD departments
├── deptInfo.query.ts / .mutation.ts        # Intro, about, HOD, alumni
├── deptPeople.mutation.ts / .query.ts      # Staff, accreditations, committees
├── deptAcademics.query.ts / .mutation.ts   # Courses, timetables, materials, results
├── deptActivities.query.ts / .mutation.ts  # Events, placements, gallery, etc.
├── deptBranding.query.ts / .mutation.ts    # Branding settings
└── deptResearch.query.ts / .mutation.ts    # Research, PhD, publications
```

### Department Context

```ts
// src/app-modules/departments/context/DepartmentContext.tsx
const dept = useDeptContext()   // throws if used outside DepartmentWorkspaceLayout
dept.id          // ULID — used as deptId in all API calls
dept.shortName   // e.g. "CSE" — used for display + faculty filtering
```

`DepartmentWorkspaceLayout` loads the department from the URL param and provides it via context to all nested pages.

### Hooks

```ts
// Async hook for all dept section list pages
const { data, setData, loading, error, reload } = useDepartmentSectionAsync<T>(
  () => someService.getAll(deptId!)
)
```

Uses `loaderRef` pattern so `reload()` always calls the latest version of the loader without stale closure issues.

---

## Routes

### Public
| Path | Component |
|------|-----------|
| `/login` | `LoginPage` |

### Admin Dashboard (inside `DashboardLayout`)
| Path | Component | Permission |
|------|-----------|------------|
| `/` | `DashboardPage` | — |
| `/profile` | `ProfilePage` | — |
| `/news` | `NewsPage` | — |
| `/events` | `EventsPage` | — |
| `/departments` | `DepartmentsPage` | — |
| `/committees` | `CommitteesPage` | `manage:committees` |
| `/academics/faculty` | `FacultyListPage` | — |
| `/academics/faculty/:facultyId` | `FacultyProfilePage` | — |
| `/academics/catalog/...` | Admin catalog pages | `manage:all_departments` |
| `/academics/courses/...` | Course browse pages | — |
| `/placements` | `PlacementsPage` | `manage:placements` |
| `/alumni` | `AlumniPage` | `manage:alumni` |
| `/users` | `UsersPage` | `manage:users` |
| `/notifications` | `NotificationsPage` | — |
| `/audit-logs` | `AuditLogsPage` | `manage:users` |

### Department Workspace (inside `DepartmentWorkspaceLayout`)
Base: `/departments/:deptId/`

| Sub-path | Component |
|----------|-----------|
| *(index)* | `DeptDashboardPage` |
| `info/introduction` | `IntroductionPage` |
| `info/about` | `AboutPage` |
| `info/hod` | `HODProfilePage` |
| `info/alumni` | `DistinguishedAlumniPage` |
| `people/faculty` | `DeptFacultyPage` |
| `people/staff` | `StaffPage` |
| `people/accreditations` | `AccreditationsPage` |
| `research/details` | `FacultyResearchPage` |
| `research/phd` | `PhDGuidePage` |
| `research/publications` | `PublicationsPage` |
| `research/grants` | `GrantsPage` |
| `research/patents` | `PatentsPage` |
| `academics/courses/...` | Catalog browse (5-level drill-down) |
| `academics/timetable/...` | Timetable browse (5-level drill-down) |
| `academics/materials/...` | Learning materials browse (5-level drill-down) |
| `academics/teaching` | `InnovativeTeachingPage` |
| `academics/results` | `ResultAnalysisPage` |
| `activities/events` | `EventsPage` (dept-scoped) |
| `activities/placements` | `DeptPlacementsPage` |
| `activities/achievements` | `AchievementsPage` |
| `activities/activities` | `ActivitiesPage` |
| `activities/newsletter` | `NewsletterPage` |
| `activities/gallery` | `PhotoGalleryPage` |
| `settings/branding` | `BrandingPage` |

---

## Shared Types (`src/shared/types/models.ts`)

### Core
- `Status` — `'active' | 'inactive' | 'draft' | 'published' | 'archived'`
- `UserRole` — `'super_admin' | 'dept_admin' | 'admin' | 'editor' | 'viewer'`
- `User`, `Department`, `Faculty`, `Student`, `Placement`, `Alumni`, `Committee`, `News`, `Event`

### Faculty Sub-types
- `Publication`, `Education`, `WorkExperience`, `ResearchProject`, `CourseTeaching`, `Honor`

### Department Research
- `FacultyResearchSummary`, `PhDGuide`, `PhdScholar`, `DeptPublication`, `PublicationProfile`, `ResearchGrant`, `Patent`

### Department Academics
- `DeptCourse`, `DeptTimetable`, `LearningMaterial`, `InnovativeTeaching`, `ResultAnalysis`

### Department Activities
- `PlacementOverview`, `StudentPlacement`, `Achievement`, `ForumSection`, `ForumEvent`, `DepartmentActivity`, `DeptNewsletter`, `DeptGalleryPhoto`

### Department Info / People
- `DeptIntroduction`, `DeptAbout`, `SWOTAnalysis`, `ProgramOutcome`, `HODProfile`, `DistinguishedAlumnus`, `CommitteeMember`, `DeptStaff`, `Accreditation`

### Branding
- `DeptBranding`, `InstituteSettings`

### Admin Course Catalog
- `AdminProgram`, `AdminProgramDept`, `AdminBatch`, `AdminCourse`, `CourseMaterial`, `TimetableSection`, `TimetableSlot`

---

## Page Pattern

Every list/management page follows this exact pattern:

```tsx
export default function SomePage() {
  const { deptId } = useParams()

  // 1. Load data
  const loader = useCallback(() => someService.getAll(deptId!), [deptId])
  const { data, loading, error, reload } = useDepartmentSectionAsync(loader)

  // 2. Filter + search
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const filtered = useMemo(() => data.filter(...), [data, debouncedSearch])

  // 3. Pagination
  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  // 4. Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const deleteDialog = useConfirmDialog()

  // 5. Save / Delete handlers (always async, call reload() after)
  async function handleSave() { ... await service.create(...); reload(); setModalOpen(false) }
  async function handleDelete() { ... await service.delete(...); reload(); deleteDialog.close() }

  return (
    <>
      {/* Header: title + primary action button */}
      {/* Error banner if error */}
      {/* SearchBar + filters */}
      <DataTable columns={columns} data={paginated} ... />
      <Modal ...> ... <ModalFooter> ... </ModalFooter> </Modal>
      <ConfirmDialog ... />
    </>
  )
}
```

---

## Backend Mapping Conventions

### ID field renaming
Backend uses entity-specific primary key names; frontend always uses `id`:

| Backend field | Maps to |
|---------------|---------|
| `facultyId` | `id` |
| `deptPublicationId` | `id` |
| `researchGrantId` | `id` |
| `patentId` | `id` |
| `facultyResearchSummaryId` | `id` |
| `phdGuideId` | `id` |
| `phdScholarId` | `id` |

Each API file defines `Backend*` types and `map*()` functions that rename the key to `id`.

### Null guards
All `getAll` services use:
```ts
(data.listXxx?.items ?? []).map(mapXxx)
```
Backend resolvers may return `items: null` instead of `items: []` for empty results.

### Lambda validator gotcha
The backend Joi validator **rejects `null`** for optional query arguments (like `limit`, `nextToken`, `guideFacultyId`).
**Rule:** never declare a `$variable` in a query unless you actually pass a value for it. Use separate query strings for optional filter variants.

### Create mutations — `__typename` pattern
Several Lambda resolvers save data correctly but **don't return the generated ID** in the response, causing AppSync to throw `Cannot return null for non-nullable type: ID`.
These create mutations use `{ __typename }` as the response selection so AppSync resolves it without needing the Lambda to return the object. The caller then calls `reload()` to fetch the saved record.

Affected: `createFacultyResearchSummary`, `createResearchGrant`, `createPatent`

---

## Auth & RBAC

### Roles
| Role | Access |
|------|--------|
| `super_admin` | Everything |
| `dept_admin` | Own department workspace only |

### Checking permissions
```ts
import { can } from '@/shared/utils/permissions'
can(user, 'events:approve')              // boolean
canManageDepartment(user, 'CSE')         // boolean
```

### Route guards
`ProtectedRoute` in `router.tsx` redirects to `/` if user lacks required permission.

---

## Shared Components Quick Reference

| Component | Usage |
|-----------|-------|
| `DataTable<T>` | `columns`, `data`, `keyExtractor`, pagination props |
| `Modal` / `ModalFooter` | Controlled with `open` + `onClose` |
| `ConfirmDialog` | Delete confirmation; use `useConfirmDialog()` hook |
| `FormField` | Label wrapper for inputs |
| `SearchBar` | `value` + `onChange`, `className="max-w-xs"` |
| `SelectFilter` | Dropdown filter |
| `Badge` + `statusVariant` | Semantic color badges |
| `StatCard` | Dashboard stat cards |

## CSS Class Reference

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Blue action button |
| `.btn-secondary` | Gray secondary button |
| `.btn-danger` | Red destructive button |
| `.input-field` | Standard text input |
| `.label` | Form label |
| `.card` | White rounded panel |
| `.table-th` / `.table-td` | Table cell styling |
