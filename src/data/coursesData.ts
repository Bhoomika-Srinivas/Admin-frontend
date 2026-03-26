// ─── Types ────────────────────────────────────────────────────────────────────

export interface Program {
  id: string
  name: string
  fullName: string
  duration: string
  maxSemesters: number
  color: string          // Tailwind bg class for card accent
  textColor: string      // Tailwind text class
  borderColor: string    // Tailwind border class
  departments: ProgramDept[]
  batches: string[]
}

export interface ProgramDept {
  id: string
  name: string
  shortName: string
}

export interface Course {
  code: string
  name: string
  credits: number
  type: 'Theory' | 'Lab' | 'Elective' | 'Project' | 'Seminar'
  hoursPerWeek: number
  faculty?: string
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export const programs: Program[] = [
  {
    id: 'be',
    name: 'BE',
    fullName: 'Bachelor of Engineering',
    duration: '4 Years',
    maxSemesters: 8,
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    departments: [
      { id: 'cse',  name: 'Computer Science & Engineering',          shortName: 'CSE'  },
      { id: 'ece',  name: 'Electronics & Communication Engineering', shortName: 'ECE'  },
      { id: 'me',   name: 'Mechanical Engineering',                  shortName: 'ME'   },
      { id: 'civil',name: 'Civil Engineering',                       shortName: 'Civil'},
      { id: 'eee',  name: 'Electrical & Electronics Engineering',    shortName: 'EEE'  },
      { id: 'ise',  name: 'Information Science & Engineering',       shortName: 'ISE'  },
      { id: 'aiml', name: 'Artificial Intelligence & ML',            shortName: 'AIML' },
    ],
    batches: ['2021-25', '2022-26', '2023-27', '2024-28'],
  },
  {
    id: 'mca',
    name: 'MCA',
    fullName: 'Master of Computer Applications',
    duration: '2 Years',
    maxSemesters: 4,
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    departments: [
      { id: 'mca', name: 'Computer Applications', shortName: 'MCA' },
    ],
    batches: ['2022-24', '2023-25', '2024-26'],
  },
  {
    id: 'mtech',
    name: 'MTech',
    fullName: 'Master of Technology',
    duration: '2 Years',
    maxSemesters: 4,
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    departments: [
      { id: 'cse', name: 'Computer Science & Engineering',          shortName: 'CSE' },
      { id: 'ece', name: 'Electronics & Communication Engineering', shortName: 'ECE' },
      { id: 'me',  name: 'Mechanical Engineering',                  shortName: 'ME'  },
    ],
    batches: ['2022-24', '2023-25', '2024-26'],
  },
  {
    id: 'bca',
    name: 'BCA',
    fullName: 'Bachelor of Computer Applications',
    duration: '3 Years',
    maxSemesters: 6,
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    departments: [
      { id: 'bca', name: 'Computer Applications', shortName: 'BCA' },
    ],
    batches: ['2022-25', '2023-26', '2024-27'],
  },
]

// ─── Course Map  key: `programId-deptId-semesterNumber` ───────────────────────

export const courseMap: Record<string, Course[]> = {

  // ── BE CSE ──────────────────────────────────────────────────────────────────
  'be-cse-1': [
    { code: 'MAT101', name: 'Engineering Mathematics I',    credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Usha Rani'     },
    { code: 'CSE101', name: 'Programming Fundamentals (C)', credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'  },
    { code: 'PHY101', name: 'Engineering Physics',          credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Ramesh Babu'    },
    { code: 'ENG101', name: 'Communication Skills',         credits: 2, type: 'Theory', hoursPerWeek: 2, faculty: 'Ms. Rekha Sharma'   },
    { code: 'CSE191', name: 'Programming Lab',              credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'  },
    { code: 'PHY191', name: 'Engineering Physics Lab',      credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Dr. Ramesh Babu'    },
    { code: 'WKP101', name: 'Workshop Practice',            credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Mr. Suresh Kumar'   },
  ],
  'be-cse-2': [
    { code: 'MAT201', name: 'Engineering Mathematics II',   credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Usha Rani'      },
    { code: 'CSE201', name: 'Data Structures',              credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Prof. Kiran Desai'  },
    { code: 'CSE202', name: 'Digital Electronics',          credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty'  },
    { code: 'CHM201', name: 'Engineering Chemistry',        credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Latha H.'       },
    { code: 'CSE291', name: 'Data Structures Lab',          credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'  },
    { code: 'CSE292', name: 'Digital Electronics Lab',      credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Dr. Rakesh Shetty'  },
    { code: 'HUM201', name: 'Constitution of India',        credits: 1, type: 'Theory', hoursPerWeek: 1, faculty: 'Mr. Anand Rao'      },
  ],
  'be-cse-3': [
    { code: 'MAT301', name: 'Discrete Mathematics',         credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Usha Rani'      },
    { code: 'CSE301', name: 'Computer Organization & Architecture', credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Prof. Kiran Desai' },
    { code: 'CSE302', name: 'Object Oriented Programming (Java)',   credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'   },
    { code: 'CSE303', name: 'Database Management Systems',  credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE391', name: 'OOP Lab',                      credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE392', name: 'DBMS Lab',                     credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Dr. Anitha Rao'      },
    { code: 'HUM301', name: 'Professional Ethics & Values', credits: 1, type: 'Theory', hoursPerWeek: 1, faculty: 'Mr. Anand Rao'       },
  ],
  'be-cse-4': [
    { code: 'CSE401', name: 'Design & Analysis of Algorithms', credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Anitha Rao'   },
    { code: 'CSE402', name: 'Microprocessors & Microcontrollers', credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai' },
    { code: 'CSE403', name: 'Operating Systems',             credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE404', name: 'Software Engineering',          credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE491', name: 'OS Lab',                        credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE492', name: 'Microprocessors Lab',           credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Prof. Kiran Desai'   },
    { code: 'OE401',  name: 'Open Elective I',               credits: 3, type: 'Elective', hoursPerWeek: 3                               },
  ],
  'be-cse-5': [
    { code: 'CSE501', name: 'Computer Networks',             credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE502', name: 'Compiler Design',               credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE503', name: 'Machine Learning',              credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE504', name: 'Web Technologies',              credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE591', name: 'Networks Lab',                  credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE592', name: 'Machine Learning Lab',          credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'OE501',  name: 'Open Elective II',              credits: 3, type: 'Elective', hoursPerWeek: 3                               },
  ],
  'be-cse-6': [
    { code: 'CSE601', name: 'Cloud Computing',               credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE602', name: 'Deep Learning',                 credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'      },
    { code: 'CSE603', name: 'Big Data Analytics',            credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE604', name: 'Distributed Systems',           credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Prof. Kiran Desai'   },
    { code: 'CSE691', name: 'Project Phase I',               credits: 2, type: 'Project', hoursPerWeek: 4                               },
    { code: 'PE601',  name: 'Professional Elective I',       credits: 3, type: 'Elective', hoursPerWeek: 3                               },
    { code: 'OE601',  name: 'Open Elective III',             credits: 3, type: 'Elective', hoursPerWeek: 3                               },
  ],
  'be-cse-7': [
    { code: 'CSE701', name: 'Information Security',          credits: 3, type: 'Theory',   hoursPerWeek: 3, faculty: 'Prof. Kiran Desai' },
    { code: 'CSE702', name: 'IoT & Embedded Systems',        credits: 3, type: 'Theory',   hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty' },
    { code: 'CSE703', name: 'Natural Language Processing',   credits: 3, type: 'Theory',   hoursPerWeek: 3, faculty: 'Dr. Anitha Rao'    },
    { code: 'PE701',  name: 'Professional Elective II',      credits: 3, type: 'Elective', hoursPerWeek: 3                               },
    { code: 'CSE791', name: 'Project Phase II',              credits: 4, type: 'Project',  hoursPerWeek: 8                               },
    { code: 'CSE792', name: 'Technical Seminar',             credits: 1, type: 'Seminar',  hoursPerWeek: 2                               },
  ],
  'be-cse-8': [
    { code: 'CSE891', name: 'Industry Internship',           credits: 8,  type: 'Project', hoursPerWeek: 40 },
    { code: 'CSE892', name: 'Project Phase III (Major)',     credits: 8,  type: 'Project', hoursPerWeek: 16 },
    { code: 'CSE893', name: 'Technical Seminar & Viva',     credits: 2,  type: 'Seminar', hoursPerWeek: 2  },
  ],

  // ── BE ECE ──────────────────────────────────────────────────────────────────
  'be-ece-1': [
    { code: 'MAT101', name: 'Engineering Mathematics I',    credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'ECE101', name: 'Basic Electronics',            credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'PHY101', name: 'Engineering Physics',          credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'ENG101', name: 'Communication Skills',         credits: 2, type: 'Theory', hoursPerWeek: 2 },
    { code: 'ECE191', name: 'Basic Electronics Lab',        credits: 2, type: 'Lab',    hoursPerWeek: 3 },
    { code: 'PHY191', name: 'Engineering Physics Lab',      credits: 1, type: 'Lab',    hoursPerWeek: 2 },
  ],
  'be-ece-2': [
    { code: 'MAT201', name: 'Engineering Mathematics II',   credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Usha Rani'     },
    { code: 'ECE201', name: 'Signals & Systems',            credits: 4, type: 'Theory', hoursPerWeek: 4, faculty: 'Dr. Rakesh Shetty' },
    { code: 'ECE202', name: 'Analog Circuits',              credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty' },
    { code: 'ECE203', name: 'Digital Logic Design',         credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty' },
    { code: 'ECE291', name: 'Analog Circuits Lab',          credits: 2, type: 'Lab',    hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty' },
    { code: 'ECE292', name: 'Digital Lab',                  credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Dr. Rakesh Shetty' },
  ],
  'be-ece-3': [
    { code: 'ECE301', name: 'Electromagnetic Theory',       credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'ECE302', name: 'Electronic Circuits',          credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'ECE303', name: 'Microprocessors',              credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'ECE304', name: 'Network Analysis',             credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'ECE391', name: 'Electronic Circuits Lab',      credits: 2, type: 'Lab',    hoursPerWeek: 3 },
    { code: 'ECE392', name: 'Microprocessors Lab',          credits: 1, type: 'Lab',    hoursPerWeek: 2 },
  ],
  'be-ece-4': [
    { code: 'ECE401', name: 'Communication Systems',        credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'ECE402', name: 'VLSI Design',                  credits: 3, type: 'Theory', hoursPerWeek: 3, faculty: 'Dr. Rakesh Shetty' },
    { code: 'ECE403', name: 'Control Systems',              credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'ECE404', name: 'Digital Signal Processing',    credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'ECE491', name: 'Communication Lab',            credits: 2, type: 'Lab',    hoursPerWeek: 3 },
    { code: 'ECE492', name: 'VLSI Lab',                     credits: 1, type: 'Lab',    hoursPerWeek: 2, faculty: 'Dr. Rakesh Shetty' },
    { code: 'OE401',  name: 'Open Elective I',              credits: 3, type: 'Elective', hoursPerWeek: 3 },
  ],

  // ── MCA ─────────────────────────────────────────────────────────────────────
  'mca-mca-1': [
    { code: 'MCA101', name: 'Discrete Mathematics & Combinatorics', credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MCA102', name: 'C Programming & Data Structures',      credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MCA103', name: 'Database Management Systems',          credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MCA104', name: 'Computer Organization',                credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MCA191', name: 'C Programming Lab',                    credits: 2, type: 'Lab',    hoursPerWeek: 3 },
    { code: 'MCA192', name: 'DBMS Lab',                             credits: 2, type: 'Lab',    hoursPerWeek: 3 },
  ],
  'mca-mca-2': [
    { code: 'MCA201', name: 'Advanced Data Structures',    credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MCA202', name: 'OOP with Java',               credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MCA203', name: 'Computer Networks',           credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MCA204', name: 'Software Engineering',        credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MCA291', name: 'Java Lab',                    credits: 2, type: 'Lab',    hoursPerWeek: 3 },
    { code: 'MCA292', name: 'Networks Lab',                credits: 1, type: 'Lab',    hoursPerWeek: 2 },
  ],
  'mca-mca-3': [
    { code: 'MCA301', name: 'Machine Learning',            credits: 4, type: 'Theory',   hoursPerWeek: 4 },
    { code: 'MCA302', name: 'Mobile Application Development', credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MCA303', name: 'Cloud Computing',             credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'MCA304', name: 'Elective I',                  credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'MCA391', name: 'ML Lab',                      credits: 2, type: 'Lab',      hoursPerWeek: 3 },
    { code: 'MCA392', name: 'Mini Project',                credits: 2, type: 'Project',  hoursPerWeek: 4 },
  ],
  'mca-mca-4': [
    { code: 'MCA401', name: 'Cybersecurity & Cryptography', credits: 3, type: 'Theory',  hoursPerWeek: 3 },
    { code: 'MCA402', name: 'Elective II',                  credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'MCA491', name: 'Major Project',                credits: 10, type: 'Project', hoursPerWeek: 20 },
    { code: 'MCA492', name: 'Technical Seminar',            credits: 2,  type: 'Seminar', hoursPerWeek: 2  },
  ],

  // ── MTech CSE ───────────────────────────────────────────────────────────────
  'mtech-cse-1': [
    { code: 'MT101', name: 'Advanced Algorithms',          credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MT102', name: 'Research Methodology',         credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MT103', name: 'Advanced DBMS',                credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'MT104', name: 'Machine Learning Techniques',  credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'MT191', name: 'Lab I',                        credits: 2, type: 'Lab',    hoursPerWeek: 4 },
  ],
  'mtech-cse-2': [
    { code: 'MT201', name: 'Deep Learning',                credits: 4, type: 'Theory',   hoursPerWeek: 4 },
    { code: 'MT202', name: 'Distributed Systems',          credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'MT203', name: 'Advanced Computer Networks',   credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'MT204', name: 'Elective I',                   credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'MT291', name: 'Lab II',                       credits: 2, type: 'Lab',      hoursPerWeek: 4 },
    { code: 'MT292', name: 'Mini Project',                 credits: 2, type: 'Project',  hoursPerWeek: 4 },
  ],
  'mtech-cse-3': [
    { code: 'MT301', name: 'Elective II',                  credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'MT302', name: 'Technical Seminar',            credits: 2, type: 'Seminar',  hoursPerWeek: 2 },
    { code: 'MT391', name: 'Dissertation Phase I',         credits: 8, type: 'Project',  hoursPerWeek: 16 },
  ],
  'mtech-cse-4': [
    { code: 'MT491', name: 'Dissertation Phase II',        credits: 16, type: 'Project', hoursPerWeek: 40 },
    { code: 'MT492', name: 'Viva Voce',                    credits: 2,  type: 'Seminar', hoursPerWeek: 2  },
  ],

  // ── BCA ─────────────────────────────────────────────────────────────────────
  'bca-bca-1': [
    { code: 'BCA101', name: 'Programming in C',            credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'BCA102', name: 'Digital Fundamentals',        credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'BCA103', name: 'Applied Mathematics I',       credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'BCA104', name: 'Communication Skills',        credits: 2, type: 'Theory', hoursPerWeek: 2 },
    { code: 'BCA191', name: 'C Programming Lab',           credits: 2, type: 'Lab',    hoursPerWeek: 3 },
  ],
  'bca-bca-2': [
    { code: 'BCA201', name: 'OOP with C++',                credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'BCA202', name: 'Data Structures',             credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'BCA203', name: 'Applied Mathematics II',      credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'BCA204', name: 'Web Design Basics',           credits: 2, type: 'Theory', hoursPerWeek: 2 },
    { code: 'BCA291', name: 'C++ & Web Lab',               credits: 2, type: 'Lab',    hoursPerWeek: 3 },
  ],
  'bca-bca-3': [
    { code: 'BCA301', name: 'Java Programming',            credits: 4, type: 'Theory', hoursPerWeek: 4 },
    { code: 'BCA302', name: 'Database Management Systems', credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'BCA303', name: 'Computer Networks',           credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'BCA304', name: 'Operating Systems',           credits: 3, type: 'Theory', hoursPerWeek: 3 },
    { code: 'BCA391', name: 'Java & DBMS Lab',             credits: 2, type: 'Lab',    hoursPerWeek: 3 },
  ],
  'bca-bca-4': [
    { code: 'BCA401', name: 'Python Programming',          credits: 4, type: 'Theory',   hoursPerWeek: 4 },
    { code: 'BCA402', name: 'Software Engineering',        credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'BCA403', name: 'Open Elective I',             credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'BCA491', name: 'Python Lab',                  credits: 2, type: 'Lab',      hoursPerWeek: 3 },
    { code: 'BCA492', name: 'Mini Project',                credits: 2, type: 'Project',  hoursPerWeek: 4 },
  ],
  'bca-bca-5': [
    { code: 'BCA501', name: 'Machine Learning Basics',     credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'BCA502', name: 'Mobile App Development',      credits: 3, type: 'Theory',   hoursPerWeek: 3 },
    { code: 'BCA503', name: 'Open Elective II',            credits: 3, type: 'Elective', hoursPerWeek: 3 },
    { code: 'BCA591', name: 'ML Lab',                      credits: 2, type: 'Lab',      hoursPerWeek: 3 },
    { code: 'BCA592', name: 'Project Phase I',             credits: 2, type: 'Project',  hoursPerWeek: 4 },
  ],
  'bca-bca-6': [
    { code: 'BCA691', name: 'Final Year Project',          credits: 8,  type: 'Project', hoursPerWeek: 16 },
    { code: 'BCA692', name: 'Internship',                  credits: 4,  type: 'Project', hoursPerWeek: 40 },
    { code: 'BCA693', name: 'Technical Seminar',           credits: 2,  type: 'Seminar', hoursPerWeek: 2  },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getProgram(programId: string): Program | undefined {
  return programs.find(p => p.id === programId)
}

export function getDept(program: Program, deptId: string): ProgramDept | undefined {
  return program.departments.find(d => d.id === deptId)
}

export function getCourses(programId: string, deptId: string, semester: number): Course[] {
  return courseMap[`${programId}-${deptId}-${semester}`] ?? []
}
