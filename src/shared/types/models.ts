// ─── Shared ──────────────────────────────────────────────────────────────────

export type Status = 'active' | 'inactive' | 'draft' | 'published' | 'archived'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'dept_admin' | 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
  status: 'active' | 'inactive'
  lastLogin?: string
  createdAt: string
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string
  name: string
  shortName: string
  hod: string
  established: number
  totalFaculty: number
  totalStudents: number
  status: Status
  description: string
  image?: string
  createdAt: string
  programTypes?: string[]
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface News {
  id: string
  title: string
  date: string
  description: string
  image: string
  pinned: boolean
  createdAt: string
}

// ─── Event ────────────────────────────────────────────────────────────────────

export interface Event {
  id: string
  title: string
  date: string
  time: string
  venue: string
  description: string
  images: string[]
  pinned: boolean
  level: 'institutional' | 'department'
  department: string
  status: 'upcoming' | 'completed' | 'cancelled'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  createdBy: string
  createdAt: string
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export type Designation = 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'HOD' | 'Principal'

export interface Publication {
  id: string
  title: string
  journal: string
  year: number
  authors: string
  doi?: string
  type: 'journal' | 'conference' | 'book'
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: number
  specialization?: string
}

export interface WorkExperience {
  id: string
  position: string
  institution: string
  startYear: number
  endYear?: number
  description?: string
}

export interface ResearchProject {
  id: string
  title: string
  fundingAgency: string
  amount?: string
  startYear: number
  endYear?: number
  status: 'ongoing' | 'completed'
}

export interface CourseTeaching {
  id: string
  courseName: string
  semester: string
  program: string
  academicYear: string
}

export interface Honor {
  id: string
  title: string
  organization: string
  year: number
  description?: string
}

export interface Faculty {
  id: string
  name: string
  designation: Designation
  deptId?: string
  department: string
  qualification: string
  experience: number
  email: string
  phone?: string
  specialization: string
  status: 'active' | 'inactive'
  image?: string
  profileImage?: string
  cvUrl?: string
  order?: number
  officeLocation?: string
  publications?: Publication[]
  education?: Education[]
  workExperience?: WorkExperience[]
  projects?: ResearchProject[]
  courses?: CourseTeaching[]
  honors?: Honor[]
  createdAt: string
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string
  usn: string
  name: string
  department: string
  semester: number
  batch: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'graduated'
  createdAt: string
}

// ─── Placement ────────────────────────────────────────────────────────────────

export interface Placement {
  id: string
  company: string
  year: string
  package: string
  studentsPlaced: number
  department: string
  roles: string[]
  logo?: string
  createdAt: string
}

// ─── Alumni ───────────────────────────────────────────────────────────────────

export interface Alumni {
  id: string
  name: string
  batch: string
  department: string
  company: string
  designation: string
  location: string
  email?: string
  linkedin?: string
  image?: string
  createdAt: string
}

// ─── Committee ────────────────────────────────────────────────────────────────

export interface Committee {
  id: string
  name: string
  type: 'academic' | 'administrative' | 'student' | 'research'
  chairperson: string
  members: string[]
  status: Status
  description: string
  createdAt: string
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  description?: string
  date: string
  status: 'published' | 'draft'
  createdAt: string
}

// ─── Department Detail ────────────────────────────────────────────────────────

export interface DeptIntroduction {
  deptId: string
  department_name: string
  logo: string          // data-URL or hosted URL
  image: string         // banner / cover image
  description: string
}

export interface DeptAbout {
  deptId: string
  vision: string
  mission: string
  updatedAt: string
}

export interface SWOTAnalysis {
  deptId: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface ProgramOutcome {
  id: string
  deptId: string
  type: 'PEO' | 'PSO'
  statement: string
  order: number
}

export interface HODProfile {
  deptId: string
  name: string
  title?: string          // e.g. "Dr.", "Prof."
  designation: string
  qualification: string
  experience: string
  specialization: string
  message: string
  profileSummary?: string // rich-text HTML — main profile narrative
  email: string
  phone?: string
  imageUrl?: string       // photo data-URL or hosted URL
  cvUrl?: string          // PDF data-URL or hosted URL
}

export interface DistinguishedAlumnus {
  id: string
  deptId: string
  name: string
  batch: string
  currentRole: string
  organization: string
  achievement: string
  imageUrl?: string
  linkedin?: string
}

export interface CommitteeMember {
  id: string
  deptId: string
  committee: 'DAB' | 'PAC'
  name: string
  designation: string
  order: number
}

export interface DeptStaff {
  id: string
  deptId: string
  name: string
  designation: string
  staffType: 'supporting' | 'technical'
  imageUrl?: string
  order?: number
}

export interface Accreditation {
  id: string
  deptId: string
  name: string
  accreditedBy: string
  validFrom: string
  validUntil: string
  grade?: string
  certificateUrl?: string
  status: Status
}

export interface FacultyResearchSummary {
  id: string
  deptId: string
  // Faculty reference
  facultyId: string
  department: string        // auto-derived from faculty, stored for display
  researchArea: string
  // Guide Information
  guideName: string
  guideDesignation?: string
  guideInstitution?: string
  guideType: 'internal' | 'external'
  // Research Details
  thesisTitle?: string
  university?: string
  yearOfRegistration?: number
  yearOfDegreeAwarded?: number
  // Research Progress
  courseWorkCompleted: boolean
  prePhDVivaVoce: boolean
  finalThesisSubmitted: boolean
  // Additional
  researchStatus?: string
  thesisDocumentUrl?: string  // PDF data-URL or hosted URL
  remarks?: string
}

export interface PhDGuide {
  id: string
  deptId: string
  facultyName: string
  university: string
  recognizedYear: number
  scholarsGuided: number
  ongoingScholars: number
}

export interface PhdScholar {
  id: string
  deptId: string
  guideFacultyId: string
  scholarName: string
  institution: string
  department: string
  yearOfRegistration: number
  thesisTitle: string
  yearOfDegreeAwarded?: number
  courseWorkCompleted: boolean
  prePhdViva: boolean
  finalThesisSubmitted: boolean
  status: 'guided' | 'guiding'
}

export interface DeptPublication {
  id: string
  deptId: string
  title: string
  authors: string
  journal: string
  year: number
  type: 'journal' | 'conference' | 'book'
  doi?: string
}

export interface PublicationProfile {
  id: string
  deptId: string
  facultyId: string
  department: string
  googleScholarLink?: string
  irinsLink?: string
}

export interface ResearchGrant {
  id: string
  deptId: string
  text: string
}

export interface Patent {
  id: string
  deptId: string
  text: string
}

export interface DeptCourse {
  id: string
  deptId: string
  programType: string  // e.g. "UG" | "PG"
  program: string      // e.g. "BE", "MCA"
  batch?: string       // e.g. "2022-26"
  code: string
  name: string
  semester: number
  credits: number
  type: 'theory' | 'lab' | 'elective'
  scheme: string
}

export interface DeptTimetable {
  id: string
  deptId: string
  section: string
  semester: number
  academicYear: string
  fileUrl?: string
  uploadedAt: string
}

export interface LearningMaterial {
  id: string
  deptId: string
  courseCode: string
  courseName: string
  title: string
  type: 'ppt' | 'notes' | 'pyq' | 'model_qp' | 'lab_manual' | 'reference' | 'assignment' | 'other'
  fileUrl: string
  uploadedBy: string   // faculty name string
  uploadedAt: string
}

export interface FacultyRef {
  facultyId: string
  facultyName: string
}

export interface InnovativeTeaching {
  id: string
  deptId: string
  faculties: FacultyRef[]
  description: string
  imageUrls?: string[]
  pdfUrl?: string
}

export interface ResultAnalysis {
  id: string
  deptId: string
  title: string
  semester: number
  batch: string
  pdfUrl?: string
  graphImageUrl?: string
  uploadedAt: string
}

export interface PlacementOverview {
  id: string
  deptId: string
  academicYear: string
  companiesVisited: number
  studentsInCampus: number
  studentsOffCampus: number
  highestPackage: string   // e.g. "9 LPA", "30 LPA"
}

export interface StudentPlacement {
  id: string
  deptId: string
  studentName: string
  usn: string
  batch: string
  company: string
  role: string
  package: number
  imageUrl?: string
}

export interface Achievement {
  id: string
  deptId: string
  type: 'student' | 'staff'
  text: string
}

export interface DeptActivity {
  id: string
  deptId: string
  type: 'forum' | 'department'
  name: string
  description: string
  date: string
  venue: string
  organizer: string
  participants?: number
}

export interface ForumSection {
  id: string
  deptId: string
  title: string
  description: string
}

export interface ForumEvent {
  id: string
  deptId: string
  title: string
  description: string
  attachmentUrl?: string
  createdAt: string
}

export interface DepartmentActivity {
  id: string
  deptId: string
  text: string
  createdAt: string
}

export interface DeptNewsletter {
  id: string
  deptId: string
  year: string
  fileUrl: string
}

export interface DeptGalleryPhoto {
  id: string
  deptId: string
  title: string
  category: string
  imageUrl: string
  capturedAt: string
  uploadedAt: string
}

// ─── Branding & Layout ────────────────────────────────────────────────────────

/** Institute-level settings — shared across all department pages. Singleton. */
export interface InstituteSettings {
  institute_name: string
  institute_logo: string   // data-URL or hosted URL
  default_copyright_text: string
  default_website_credits: string
}

/** Per-department branding stored against deptId. */
export interface DeptBranding {
  deptId: string
  // ── Header ─────────────────────────────────────────────────────────────────
  department_title: string
  department_logo: string   // optional — empty string means "not set"
  // ── Footer · Social ────────────────────────────────────────────────────────
  twitter_url: string
  linkedin_url: string
  youtube_url: string
  email_contact: string
  map_location_link: string
  // ── Footer · Address ───────────────────────────────────────────────────────
  full_address: string
  // ── Footer · Contact ───────────────────────────────────────────────────────
  hod_phone: string
  hod_email: string
  department_phone: string
  department_fax: string
  department_email: string
  // ── Footer · Credits (override institute defaults when non-empty) ──────────
  copyright_text: string
  website_credits: string
}

// ─── Admin Course Catalog ─────────────────────────────────────────────────────

export interface AdminProgram {
  id: string
  name: string
  fullName: string
  duration: string
  maxSemesters: number
}

export interface AdminProgramDept {
  id: string
  programId: string
  name: string
  shortName: string
}

export interface AdminBatch {
  id: string
  programId: string
  departmentId: string
  batchYear: string   // e.g. "2021-25"
}

export interface DeptBatch {
  id: string
  deptId: string
  programType: string  // e.g. "UG" | "PG"
  program: string      // e.g. "BE", "MCA", "MBA"
  name: string         // e.g. "2022-2026"
  startYear?: number
  endYear?: number
}

export interface AdminCourse {
  id: string
  programId: string
  departmentId: string
  semesterNumber: number
  batchYear: string
  code: string
  name: string
  type: 'Theory' | 'Lab' | 'Elective' | 'Project' | 'Seminar'
  credits: number
  hoursPerWeek: number
  facultyId?: string
}

// ─── Course Materials ─────────────────────────────────────────────────────────

export type LMaterialType = 'ppt' | 'notes' | 'pyq' | 'model_qp' | 'lab_manual' | 'reference' | 'assignment' | 'other'

export interface CourseMaterial {
  id: string
  programId: string
  departmentId: string
  semesterNumber: number
  batchYear: string
  courseId: string
  courseCode: string
  courseName: string
  title: string
  type: LMaterialType
  facultyId?: string
  description?: string
  fileUrl?: string
  uploadedAt: string
}

// ─── Timetable ────────────────────────────────────────────────────────────────

export type TimetableDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'

export interface DeptSection {
  id: string
  deptId: string
  programId: string
  batchName: string
  semester: number
  name: string   // "A", "B", "C", "D"
}

export interface TimetableSection {
  id: string
  programId: string
  departmentId: string
  semesterNumber: number
  batchYear: string
  name: string  // "A", "B", "C", "D"
}

export interface TimetableSlot {
  id: string
  sectionId: string
  day: TimetableDay
  period: number       // 1–7
  courseCode: string
  courseName: string
  type: 'Theory' | 'Lab' | 'Elective' | 'Project' | 'Seminar'
  facultyId?: string
}

export interface DeptSlot {
  id: string
  deptId: string
  sectionId: string
  day: TimetableDay
  period: number
  courseCode: string
  courseName: string
  type: DeptCourse['type']
  facultyId?: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalStudents: number
  totalFaculty: number
  totalDepartments: number
  totalAlumni: number
  pendingAdmissions: number
  publishedNews: number
  upcomingEvents: number
  totalPlacements: number
}
