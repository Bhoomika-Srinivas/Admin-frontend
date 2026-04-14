// Master department enum for Alumni module
// Reusable across: Events, Coordinators, Distinguished Alumni

export const ALUMNI_DEPARTMENTS = [
  'CSE',
  'ISE',
  'ECE',
  'EEE',
  'MECHANICAL',
  'CIVIL',
  'TEXTILE',
  'CHEMICAL',
  'BT',
  'MCA',
  'EI',
] as const

export type AlumniDepartment = (typeof ALUMNI_DEPARTMENTS)[number]

export const DEPARTMENT_OPTIONS = ALUMNI_DEPARTMENTS.map(d => ({
  value: d,
  label: d,
}))

// For dropdown filters - includes "All" option
export const DEPARTMENT_FILTER_OPTIONS = [
  { value: '', label: 'All Departments' },
  ...DEPARTMENT_OPTIONS,
]
