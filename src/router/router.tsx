import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from '@/layout/DashboardLayout'
import DepartmentWorkspaceLayout from '@/layout/DepartmentWorkspaceLayout'
import DashboardPage from '@/app-modules/dashboard/pages/DashboardPage'
import NewsPage from '@/app-modules/news/pages/NewsPage'
import EventsPage from '@/app-modules/events/pages/EventsPage'
import DepartmentsPage from '@/app-modules/departments/pages/DepartmentsPage'
import IntroductionPage from '@/app-modules/departments/pages/info/IntroductionPage'
import AboutPage from '@/app-modules/departments/pages/info/AboutPage'
import HODProfilePage from '@/app-modules/departments/pages/info/HODProfilePage'
import DistinguishedAlumniPage from '@/app-modules/departments/pages/info/DistinguishedAlumniPage'
import DeptFacultyPage from '@/app-modules/departments/pages/people/DeptFacultyPage'
import StaffPage from '@/app-modules/departments/pages/people/StaffPage'
import AccreditationsPage from '@/app-modules/departments/pages/people/AccreditationsPage'
import FacultyResearchPage from '@/app-modules/departments/pages/research/FacultyResearchPage'
import PhDGuidePage from '@/app-modules/departments/pages/research/PhDGuidePage'
import PublicationsPage from '@/app-modules/departments/pages/research/PublicationsPage'
import GrantsPage from '@/app-modules/departments/pages/research/GrantsPage'
import PatentsPage from '@/app-modules/departments/pages/research/PatentsPage'
import DeptCatalogProgramsPage from '@/app-modules/departments/pages/academics/DeptCatalogProgramsPage'
import DeptCatalogProgramListPage from '@/app-modules/departments/pages/academics/DeptCatalogProgramListPage'
import DeptCatalogSemestersPage from '@/app-modules/departments/pages/academics/DeptCatalogSemestersPage'
import DeptCatalogBatchesPage from '@/app-modules/departments/pages/academics/DeptCatalogBatchesPage'
import DeptCatalogCoursesPage from '@/app-modules/departments/pages/academics/DeptCatalogCoursesPage'
import DeptTTProgramsPage from '@/app-modules/departments/pages/academics/timetable/DeptTTProgramsPage'
import DeptTTProgramListPage from '@/app-modules/departments/pages/academics/timetable/DeptTTProgramListPage'
import DeptTTSemestersPage from '@/app-modules/departments/pages/academics/timetable/DeptTTSemestersPage'
import DeptTTBatchesPage from '@/app-modules/departments/pages/academics/timetable/DeptTTBatchesPage'
import DeptTTSectionsPage from '@/app-modules/departments/pages/academics/timetable/DeptTTSectionsPage'
import DeptTimetableViewPage from '@/app-modules/departments/pages/academics/timetable/DeptTimetableViewPage'
import DeptLMProgramsPage from '@/app-modules/departments/pages/academics/materials/DeptLMProgramsPage'
import DeptLMSemestersPage from '@/app-modules/departments/pages/academics/materials/DeptLMSemestersPage'
import DeptLMBatchesPage from '@/app-modules/departments/pages/academics/materials/DeptLMBatchesPage'
import DeptLMCoursesPage from '@/app-modules/departments/pages/academics/materials/DeptLMCoursesPage'
import DeptLMMaterialsPage from '@/app-modules/departments/pages/academics/materials/DeptLMMaterialsPage'
import InnovativeTeachingPage from '@/app-modules/departments/pages/academics/InnovativeTeachingPage'
import ResultAnalysisPage from '@/app-modules/departments/pages/academics/ResultAnalysisPage'
import DeptEventsPage from '@/app-modules/departments/pages/activities/EventsPage'
import DeptPlacementsPage from '@/app-modules/departments/pages/activities/PlacementsPage'
import AchievementsPage from '@/app-modules/departments/pages/activities/AchievementsPage'
import ActivitiesPage from '@/app-modules/departments/pages/activities/ActivitiesPage'
import NewsletterPage from '@/app-modules/departments/pages/activities/NewsletterPage'
import PhotoGalleryPage from '@/app-modules/departments/pages/activities/PhotoGalleryPage'
import BrandingPage from '@/app-modules/departments/pages/settings/BrandingPage'
import CommitteesPage from '@/app-modules/committees/pages/CommitteesPage'
import FacultyListPage from '@/app-modules/faculty/pages/FacultyListPage'
import FacultyProfilePage from '@/app-modules/faculty/pages/FacultyProfilePage'
import CoursesProgramsPage from '@/app-modules/courses/pages/CoursesProgramsPage'
import CoursesDepartmentsPage from '@/app-modules/courses/pages/DepartmentsPage'
import SemestersPage from '@/app-modules/courses/pages/SemestersPage'
import BatchSelectionPage from '@/app-modules/courses/pages/BatchSelectionPage'
import CoursesListPage from '@/app-modules/courses/pages/CoursesListPage'
import PlacementsPage from '@/app-modules/placements/pages/PlacementsPage'
import AlumniPage from '@/app-modules/alumni/pages/AlumniPage'
import UsersPage from '@/core-modules/users/pages/UsersPage'
import NotificationsPage from '@/core-modules/notifications/pages/NotificationsPage'
import AuditLogsPage from '@/core-modules/audit/pages/AuditLogsPage'
import ProfilePage from '@/app-modules/profile/pages/ProfilePage'
import LoginPage from '@/core-modules/auth/pages/LoginPage'
import PlaceholderPage from '@/shared/components/common/PlaceholderPage'
import ProtectedRoute from '@/shared/components/common/ProtectedRoute'
import AdminProgramsPage from '@/app-modules/departments/pages/academics/admin-courses/AdminProgramsPage'
import AdminProgramDeptsPage from '@/app-modules/departments/pages/academics/admin-courses/AdminProgramDeptsPage'
import AdminSemestersPage from '@/app-modules/departments/pages/academics/admin-courses/AdminSemestersPage'
import AdminBatchesPage from '@/app-modules/departments/pages/academics/admin-courses/AdminBatchesPage'
import AdminCourseListPage from '@/app-modules/departments/pages/academics/admin-courses/AdminCourseListPage'
import DeptDashboardPage from '@/app-modules/departments/pages/DeptDashboardPage'

// ── Department workspace child routes (shared between the two layouts) ────────
const deptWorkspaceChildren = [
  { index: true, element: <DeptDashboardPage /> },
  // Info
  { path: 'info/introduction', element: <IntroductionPage /> },
  { path: 'info/about',        element: <AboutPage /> },
  { path: 'info/hod',     element: <HODProfilePage /> },
  { path: 'info/alumni',  element: <DistinguishedAlumniPage /> },
  // People
  { path: 'people/faculty',        element: <DeptFacultyPage /> },
  { path: 'people/staff',          element: <StaffPage /> },
  { path: 'people/accreditations', element: <AccreditationsPage /> },
  // Research
  { path: 'research/details',      element: <FacultyResearchPage /> },
  { path: 'research/phd',          element: <PhDGuidePage /> },
  { path: 'research/publications', element: <PublicationsPage /> },
  { path: 'research/grants',       element: <GrantsPage /> },
  { path: 'research/patents',      element: <PatentsPage /> },
  // Academics
  { path: 'academics/courses',                                                    element: <DeptCatalogProgramsPage /> },
  { path: 'academics/courses/:programType',                                       element: <DeptCatalogProgramListPage /> },
  { path: 'academics/courses/:programType/:program',                              element: <DeptCatalogSemestersPage /> },
  { path: 'academics/courses/:programType/:program/:semester',                    element: <DeptCatalogBatchesPage /> },
  { path: 'academics/courses/:programType/:program/:semester/:batch',             element: <DeptCatalogCoursesPage /> },
  { path: 'academics/timetable',                                                              element: <DeptTTProgramsPage /> },
  { path: 'academics/timetable/:programType',                                                 element: <DeptTTProgramListPage /> },
  { path: 'academics/timetable/:programType/:program',                                        element: <DeptTTSemestersPage /> },
  { path: 'academics/timetable/:programType/:program/:semester',                              element: <DeptTTBatchesPage /> },
  { path: 'academics/timetable/:programType/:program/:semester/:batch',                       element: <DeptTTSectionsPage /> },
  { path: 'academics/timetable/:programType/:program/:semester/:batch/:section',              element: <DeptTimetableViewPage /> },
  { path: 'academics/materials',                                                              element: <DeptLMProgramsPage /> },
  { path: 'academics/materials/:programId',                                                   element: <DeptLMSemestersPage /> },
  { path: 'academics/materials/:programId/:semester',                                         element: <DeptLMBatchesPage /> },
  { path: 'academics/materials/:programId/:semester/:batch',                                  element: <DeptLMCoursesPage /> },
  { path: 'academics/materials/:programId/:semester/:batch/:courseId',                        element: <DeptLMMaterialsPage /> },
  { path: 'academics/teaching',  element: <InnovativeTeachingPage /> },
  { path: 'academics/results',   element: <ResultAnalysisPage /> },
  // Activities
  { path: 'activities/events',       element: <DeptEventsPage /> },
  { path: 'activities/placements',   element: <DeptPlacementsPage /> },
  { path: 'activities/achievements', element: <AchievementsPage /> },
  { path: 'activities/activities',   element: <ActivitiesPage /> },
  { path: 'activities/newsletter',   element: <NewsletterPage /> },
  { path: 'activities/gallery',      element: <PhotoGalleryPage /> },
  // Settings
  { path: 'settings/branding', element: <BrandingPage /> },
]

export const router = createBrowserRouter([
  // ── Public ─────────────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Department Workspace — standalone, no admin sidebar ────────────────────
  {
    path: '/departments/:deptId',
    element: <DepartmentWorkspaceLayout />,
    children: deptWorkspaceChildren,
  },

  // ── Admin Dashboard — main layout with sidebar ─────────────────────────────
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      // Profile
      { path: 'profile', element: <ProfilePage /> },
      // Site content
      { path: 'news',    element: <NewsPage /> },
      { path: 'events',  element: <EventsPage /> },
      { path: 'gallery', element: <PlaceholderPage title="Gallery" description="Manage campus photo gallery and media assets." /> },
      // Departments list — both roles
      { path: 'departments', element: <DepartmentsPage /> },
      // Super admin only
      {
        path: 'committees',
        element: (
          <ProtectedRoute permission="manage:committees">
            <CommitteesPage />
          </ProtectedRoute>
        ),
      },
      // Academics
      // Course Catalog Admin (manage programs → depts → semesters → batches → courses)
      { path: 'academics/catalog',                                                        element: <AdminProgramsPage /> },
      { path: 'academics/catalog/:programId',                                             element: <AdminProgramDeptsPage /> },
      { path: 'academics/catalog/:programId/:deptId',                                    element: <AdminSemestersPage /> },
      { path: 'academics/catalog/:programId/:deptId/:semester',                          element: <AdminBatchesPage /> },
      { path: 'academics/catalog/:programId/:deptId/:semester/:batch',                   element: <AdminCourseListPage /> },
      { path: 'academics/faculty', element: <FacultyListPage /> },
      { path: 'academics/faculty/:facultyId', element: <FacultyProfilePage /> },
      { path: 'academics/courses', element: <CoursesProgramsPage /> },
      { path: 'academics/courses/:programId', element: <CoursesDepartmentsPage /> },
      { path: 'academics/courses/:programId/:deptId', element: <SemestersPage /> },
      { path: 'academics/courses/:programId/:deptId/:semester', element: <BatchSelectionPage /> },
      { path: 'academics/courses/:programId/:deptId/:semester/:batch', element: <CoursesListPage /> },
      {
        path: 'academics/results',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Results" description="Manage and publish examination results." />
          </ProtectedRoute>
        ),
      },
      // Admissions
      {
        path: 'admissions/applications',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Applications" description="Review and process admission applications." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admissions/students',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Students" description="Manage enrolled student records." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'placements',
        element: (
          <ProtectedRoute permission="manage:placements">
            <PlacementsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campus-life/clubs',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Clubs & Societies" description="Manage student clubs and extracurricular societies." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'campus-life/sports',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Sports" description="Manage sports teams and events." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'facilities/labs',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Laboratories" description="Manage laboratory facilities and equipment." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'facilities/library',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Library" description="Manage library resources and catalog." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'facilities/hostel',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Hostel" description="Manage hostel accommodations and facilities." />
          </ProtectedRoute>
        ),
      },
      {
        path: 'alumni',
        element: (
          <ProtectedRoute permission="manage:alumni">
            <AlumniPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute permission="manage:users">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute permission="manage:all_departments">
            <PlaceholderPage title="Settings" description="Configure system preferences and integrations." />
          </ProtectedRoute>
        ),
      },
      { path: 'notifications', element: <NotificationsPage /> },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute permission="manage:users">
            <AuditLogsPage />
          </ProtectedRoute>
        ),
      },
      // Catch-all
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
