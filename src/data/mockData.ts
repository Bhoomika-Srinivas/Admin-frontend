import type { User, Department, News, Event, Faculty, Placement, Alumni, DashboardStats, Publication, Education, WorkExperience, ResearchProject, CourseTeaching, Honor } from '@/shared/types/models'

export const mockStats: DashboardStats = {
  totalStudents: 3840,
  totalFaculty: 186,
  totalDepartments: 12,
  totalAlumni: 12500,
  pendingAdmissions: 247,
  publishedNews: 34,
  upcomingEvents: 8,
  totalPlacements: 420,
}

export const mockUsers: User[] = [
  { id: '1', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@biet.edu', role: 'super_admin', department: 'Administration', status: 'active', lastLogin: '2024-03-10T09:30:00Z', createdAt: '2022-01-01T00:00:00Z' },
  { id: '2', name: 'Prof. Anita Sharma', email: 'anita.sharma@biet.edu', role: 'dept_admin', department: 'CSE', status: 'active', lastLogin: '2024-03-09T14:20:00Z', createdAt: '2022-06-15T00:00:00Z' },
  { id: '3', name: 'Suresh Patil', email: 'suresh.patil@biet.edu', role: 'editor', department: 'Electronics', status: 'active', lastLogin: '2024-03-08T11:45:00Z', createdAt: '2023-01-10T00:00:00Z' },
  { id: '4', name: 'Meena Desai', email: 'meena.desai@biet.edu', role: 'editor', department: 'Mechanical', status: 'inactive', lastLogin: '2024-02-20T10:00:00Z', createdAt: '2023-03-22T00:00:00Z' },
  { id: '5', name: 'Vikram Singh', email: 'vikram.singh@biet.edu', role: 'viewer', department: 'Civil', status: 'active', lastLogin: '2024-03-07T16:00:00Z', createdAt: '2023-07-01T00:00:00Z' },
  { id: '6', name: 'Priya Nair', email: 'priya.nair@biet.edu', role: 'editor', department: 'Administration', status: 'active', lastLogin: '2024-03-10T08:15:00Z', createdAt: '2023-08-12T00:00:00Z' },
]

export const mockDepartments: Department[] = [
  { id: '1', name: 'Computer Science & Engineering', shortName: 'CSE', hod: 'Dr. Anitha Rao', established: 1985, totalFaculty: 24, totalStudents: 480, status: 'active', description: 'Leading department for CS education and research.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '2', name: 'Electronics & Communication Engineering', shortName: 'ECE', hod: 'Dr. Prakash Naidu', established: 1985, totalFaculty: 22, totalStudents: 420, status: 'active', description: 'State-of-the-art electronics and communication labs.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '3', name: 'Mechanical Engineering', shortName: 'ME', hod: 'Prof. Shiva Kumar', established: 1985, totalFaculty: 20, totalStudents: 360, status: 'active', description: 'Comprehensive mechanical engineering curriculum.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '4', name: 'Civil Engineering', shortName: 'CE', hod: 'Dr. Latha Murthy', established: 1987, totalFaculty: 18, totalStudents: 300, status: 'active', description: 'Infrastructure and construction engineering excellence.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '5', name: 'Electrical & Electronics Engineering', shortName: 'EEE', hod: 'Dr. Sudhir Patil', established: 1990, totalFaculty: 16, totalStudents: 240, status: 'active', description: 'Power systems and automation specialization.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '6', name: 'Information Science & Engineering', shortName: 'ISE', hod: 'Dr. Kavya Reddy', established: 2000, totalFaculty: 14, totalStudents: 300, status: 'active', description: 'Data science and information systems focus.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '7', name: 'Artificial Intelligence & Machine Learning', shortName: 'AIML', hod: 'Dr. Deepak Raj', established: 2019, totalFaculty: 12, totalStudents: 240, status: 'active', description: 'Cutting-edge AI and ML research and education.', createdAt: '2020-01-01T00:00:00Z' },
  { id: '8', name: 'Mathematics', shortName: 'MATH', hod: 'Prof. Usha Rani', established: 1985, totalFaculty: 10, totalStudents: 0, status: 'active', description: 'Foundation mathematics for all engineering branches.', createdAt: '2020-01-01T00:00:00Z' },
]

export const mockNews: News[] = [
  { id: '1', title: 'BIET Ranked Among Top Engineering Colleges in Karnataka', date: '2024-03-08', description: 'BIET has been ranked in the top 10 engineering colleges in Karnataka by NIRF 2024.', image: '', pinned: true, createdAt: '2024-03-07T00:00:00Z' },
  { id: '2', title: 'New AI Lab Inaugurated at BIET Campus', date: '2024-03-05', description: 'A state-of-the-art Artificial Intelligence laboratory has been inaugurated at BIET.', image: '', pinned: false, createdAt: '2024-03-04T00:00:00Z' },
  { id: '3', title: 'Admissions Open for 2024-25 Academic Year', date: '2024-03-01', description: 'Applications are now open for all undergraduate and postgraduate programs.', image: '', pinned: false, createdAt: '2024-02-28T00:00:00Z' },
  { id: '4', title: 'BIET Students Win National Robotics Championship', date: '2024-02-28', description: 'Team RoboTech from BIET won first place at the National Robotics Championship 2024.', image: '', pinned: false, createdAt: '2024-02-27T00:00:00Z' },
  { id: '5', title: 'Annual Fest "Synergy 2024" Announced', date: '2024-02-25', description: "BIET's annual technical and cultural fest Synergy 2024 will be held from March 20-22.", image: '', pinned: false, createdAt: '2024-02-25T00:00:00Z' },
  { id: '6', title: 'MoU Signed with ISRO for Research Collaboration', date: '2024-02-20', description: 'BIET signs MoU with ISRO for joint research in aerospace technologies.', image: '', pinned: false, createdAt: '2024-02-19T00:00:00Z' },
]

export const mockEvents: Event[] = [
  { id: '1', title: 'Synergy 2024 - Annual Technical Fest', isMultiDay: false, date: '2026-04-20', time: '09:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'BIET Main Campus', description: 'Annual technical and cultural fest with competitions, workshops and seminars.', images: [], pinned: true, level: 'institutional', department: '', status: 'upcoming', approvalStatus: 'approved', createdBy: '1', createdAt: '2024-02-01T00:00:00Z' },
  { id: '2', title: 'Industry Expert Workshop on Cloud Computing', isMultiDay: false, date: '2026-04-15', time: '10:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'Seminar Hall A', description: 'Hands-on workshop by industry experts from AWS and Google Cloud.', images: [], pinned: false, level: 'department', department: 'CSE', status: 'upcoming', approvalStatus: 'pending', createdBy: '2', createdAt: '2024-02-10T00:00:00Z' },
  { id: '3', title: 'Alumni Meet 2024', isMultiDay: false, date: '2026-05-30', time: '11:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'College Auditorium', description: 'Annual alumni gathering to reconnect and network.', images: [], pinned: false, level: 'institutional', department: '', status: 'upcoming', approvalStatus: 'approved', createdBy: '1', createdAt: '2024-02-05T00:00:00Z' },
  { id: '4', title: 'Inter-College Sports Tournament', isMultiDay: false, date: '2024-03-10', time: '08:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'BIET Sports Complex', description: 'Annual inter-college sports tournament featuring cricket, football and more.', images: [], pinned: false, level: 'institutional', department: '', status: 'upcoming', approvalStatus: 'approved', createdBy: '1', createdAt: '2024-02-15T00:00:00Z' },
  { id: '5', title: 'IEEE Student Chapter Workshop', isMultiDay: false, date: '2024-02-25', time: '10:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'ECE Lab', description: 'IEEE workshop on embedded systems and IoT applications.', images: [], pinned: false, level: 'department', department: 'ECE', status: 'upcoming', approvalStatus: 'approved', createdBy: '1', createdAt: '2024-01-20T00:00:00Z' },
  { id: '6', title: 'ECE Department Tech Talk', isMultiDay: false, date: '2026-04-10', time: '14:00', startDate: '', startTime: '', endDate: '', endTime: '', venue: 'ECE Seminar Hall', description: 'Guest lecture on VLSI design trends.', images: [], pinned: false, level: 'department', department: 'ECE', status: 'upcoming', approvalStatus: 'pending', createdBy: '3', createdAt: '2024-02-20T00:00:00Z' },
]

const anithaPublications: Publication[] = [
  { id: 'p1', title: 'Deep Learning Approaches for Intrusion Detection in IoT Networks', journal: 'IEEE Transactions on Network and Service Management', year: 2023, authors: 'Anitha Rao, K. Desai, R. Mehta', doi: '10.1109/TNSM.2023.0012', type: 'journal' },
  { id: 'p2', title: 'Federated Learning for Privacy-Preserving Healthcare Analytics', journal: 'International Conference on Machine Learning (ICML)', year: 2022, authors: 'Anitha Rao, P. Sharma', doi: '10.5555/icml22.045', type: 'conference' },
  { id: 'p3', title: 'Optimizing Neural Architecture Search with Evolutionary Algorithms', journal: 'Expert Systems with Applications', year: 2022, authors: 'Anitha Rao, M. Gupta, R. Naik', doi: '10.1016/j.eswa.2022.115', type: 'journal' },
  { id: 'p4', title: 'A Survey on Data Mining Techniques for Smart Agriculture', journal: 'Computers and Electronics in Agriculture', year: 2021, authors: 'Anitha Rao, S. Patil', doi: '10.1016/j.compag.2021.106', type: 'journal' },
  { id: 'p5', title: 'Attention Mechanisms in Natural Language Processing: A Review', journal: 'ACM Computing Surveys', year: 2020, authors: 'Anitha Rao, K. Iyer, T. Reddy', doi: '10.1145/3402072', type: 'journal' },
]

const anithaEducation: Education[] = [
  { id: 'e1', degree: 'Ph.D in Computer Science', institution: 'IIT Bombay', year: 2007, specialization: 'Machine Learning & Pattern Recognition' },
  { id: 'e2', degree: 'M.Tech in Computer Science & Engineering', institution: 'NIT Karnataka', year: 2002, specialization: 'Artificial Intelligence' },
  { id: 'e3', degree: 'B.E in Computer Science & Engineering', institution: 'Visvesvaraya Technological University', year: 2000, specialization: '' },
]

const anithaExperience: WorkExperience[] = [
  { id: 'w1', position: 'Head of Department & Professor', institution: 'BIET, Davangere', startYear: 2019, description: 'Leading the CSE department with 24 faculty members. Spearheading AI/ML curriculum modernization and industry partnerships.' },
  { id: 'w2', position: 'Associate Professor', institution: 'BIET, Davangere', startYear: 2013, endYear: 2019, description: 'Taught advanced algorithms, machine learning, and data mining. Supervised 6 PhD students.' },
  { id: 'w3', position: 'Assistant Professor', institution: 'RV College of Engineering, Bangalore', startYear: 2007, endYear: 2013, description: 'Taught core CS subjects, established the data analytics laboratory.' },
]

const anithaProjects: ResearchProject[] = [
  { id: 'r1', title: 'AI-Driven Crop Disease Detection for Karnataka Farmers', fundingAgency: 'DST (Dept. of Science & Technology)', amount: '₹42 Lakhs', startYear: 2022, status: 'ongoing' },
  { id: 'r2', title: 'Privacy-Preserving Machine Learning in Healthcare Systems', fundingAgency: 'SERB (Science and Engineering Research Board)', amount: '₹28 Lakhs', startYear: 2021, endYear: 2023, status: 'completed' },
  { id: 'r3', title: 'Intelligent Traffic Management Using Deep Learning', fundingAgency: 'KSCST (Karnataka State Council for S&T)', amount: '₹12 Lakhs', startYear: 2020, endYear: 2022, status: 'completed' },
]

const anithaCourses: CourseTeaching[] = [
  { id: 'c1', courseName: 'Machine Learning', semester: 'Odd', program: 'B.E CSE', academicYear: '2024-25' },
  { id: 'c2', courseName: 'Deep Learning & Applications', semester: 'Even', program: 'M.Tech CSE', academicYear: '2024-25' },
  { id: 'c3', courseName: 'Data Mining & Warehousing', semester: 'Odd', program: 'B.E CSE', academicYear: '2024-25' },
  { id: 'c4', courseName: 'Research Methodology', semester: 'Even', program: 'Ph.D', academicYear: '2023-24' },
]

const anithaHonors: Honor[] = [
  { id: 'h1', title: 'Best Researcher Award', organization: 'VTU (Visvesvaraya Technological University)', year: 2023, description: 'Recognized for outstanding research contributions in Machine Learning.' },
  { id: 'h2', title: 'Karnataka Rajyotsava Award for Education', organization: 'Government of Karnataka', year: 2021, description: 'Honored for exceptional service to technical education in Karnataka.' },
  { id: 'h3', title: 'Excellence in Teaching Award', organization: 'BIET', year: 2019, description: 'Awarded for innovative teaching methods and outstanding student outcomes.' },
  { id: 'h4', title: 'Young Scientist Award', organization: 'ISCA (Indian Science Congress Association)', year: 2010, description: 'Recognized as an emerging researcher in the field of Artificial Intelligence.' },
]

export const mockFaculty: Faculty[] = [
  {
    id: '1',
    name: 'Dr. Anitha Rao',
    designation: 'HOD',
    department: 'CSE',
    qualification: 'Ph.D (IIT Bombay)',
    experience: 18,
    email: 'anitha.rao@biet.edu',
    phone: '+91 94482 10234',
    specialization: 'Machine Learning, Data Mining',
    status: 'active',
    officeLocation: 'CSE Block, Room 301',
    publications: anithaPublications,
    education: anithaEducation,
    workExperience: anithaExperience,
    projects: anithaProjects,
    courses: anithaCourses,
    honors: anithaHonors,
    createdAt: '2010-06-01T00:00:00Z',
  },
  { id: '2', name: 'Prof. Kiran Desai', designation: 'Professor', department: 'CSE', qualification: 'M.Tech, Ph.D', experience: 15, email: 'kiran.desai@biet.edu', specialization: 'Computer Networks, Security', status: 'active', createdAt: '2012-08-01T00:00:00Z' },
  { id: '3', name: 'Dr. Rakesh Shetty', designation: 'Associate Professor', department: 'ECE', qualification: 'Ph.D (NIT Surathkal)', experience: 12, email: 'rakesh.shetty@biet.edu', specialization: 'VLSI Design, Signal Processing', status: 'active', createdAt: '2014-06-01T00:00:00Z' },
  { id: '4', name: 'Prof. Suma H.', designation: 'Assistant Professor', department: 'ME', qualification: 'M.Tech', experience: 8, email: 'suma.h@biet.edu', specialization: 'Thermodynamics, CAD/CAM', status: 'active', createdAt: '2018-07-01T00:00:00Z' },
  { id: '5', name: 'Dr. Nagaraj Hegde', designation: 'Professor', department: 'Civil', qualification: 'Ph.D, M.Tech', experience: 20, email: 'nagaraj.hegde@biet.edu', specialization: 'Structural Engineering', status: 'active', createdAt: '2008-01-01T00:00:00Z' },
]

export const mockPlacements: Placement[] = [
  { id: '1', company: 'Infosys', year: '2023-24', package: '4.5 LPA', studentsPlaced: 45, department: 'CSE', roles: ['Software Engineer', 'Systems Engineer'], createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', company: 'TCS', year: '2023-24', package: '3.6 LPA', studentsPlaced: 62, department: 'ALL', roles: ['Software Engineer'], createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', company: 'Wipro', year: '2023-24', package: '3.5 LPA', studentsPlaced: 38, department: 'CSE, ECE, ISE', roles: ['Project Engineer', 'Analyst'], createdAt: '2024-01-01T00:00:00Z' },
  { id: '4', company: 'L&T Technology Services', year: '2023-24', package: '5.5 LPA', studentsPlaced: 22, department: 'ME, EEE', roles: ['Graduate Engineer Trainee'], createdAt: '2024-01-01T00:00:00Z' },
  { id: '5', company: 'Amazon', year: '2023-24', package: '18 LPA', studentsPlaced: 5, department: 'CSE', roles: ['SDE-1'], createdAt: '2024-01-01T00:00:00Z' },
  { id: '6', company: 'Accenture', year: '2023-24', package: '4.5 LPA', studentsPlaced: 55, department: 'ALL', roles: ['Application Developer', 'Analyst'], createdAt: '2024-01-01T00:00:00Z' },
]

export const mockAlumni: Alumni[] = [
  { id: '1', name: 'Arun Mathew', batch: '2015', department: 'CSE', company: 'Google', designation: 'Senior Software Engineer', location: 'Bangalore', linkedin: '#', createdAt: '2020-01-01T00:00:00Z' },
  { id: '2', name: 'Deepa Krishnan', batch: '2014', department: 'ECE', company: 'Qualcomm', designation: 'VLSI Engineer', location: 'Hyderabad', linkedin: '#', createdAt: '2020-01-01T00:00:00Z' },
  { id: '3', name: 'Rohit Joshi', batch: '2016', department: 'ME', company: 'Bosch', designation: 'Mechanical Engineer', location: 'Pune', linkedin: '#', createdAt: '2020-01-01T00:00:00Z' },
  { id: '4', name: 'Shwetha Nair', batch: '2013', department: 'CSE', company: 'Microsoft', designation: 'Principal Engineer', location: 'Seattle, USA', linkedin: '#', createdAt: '2020-01-01T00:00:00Z' },
  { id: '5', name: 'Karthik Reddy', batch: '2017', department: 'AIML', company: 'NVIDIA', designation: 'AI Research Engineer', location: 'Bangalore', linkedin: '#', createdAt: '2020-01-01T00:00:00Z' },
]

export const recentActivities = [
  { id: '1', action: 'New news article published', user: 'Dr. Rajesh Kumar', time: '2 minutes ago', type: 'news' },
  { id: '2', action: 'Department profile updated', user: 'Prof. Anita Sharma', time: '1 hour ago', type: 'department' },
  { id: '3', action: 'Event "AWS Workshop" created', user: 'Suresh Patil', time: '3 hours ago', type: 'event' },
  { id: '4', action: 'New user account created', user: 'Admin', time: '5 hours ago', type: 'user' },
  { id: '5', action: 'Placement record added for TCS', user: 'Priya Nair', time: '1 day ago', type: 'placement' },
  { id: '6', action: 'Gallery images uploaded', user: 'Meena Desai', time: '1 day ago', type: 'gallery' },
]
