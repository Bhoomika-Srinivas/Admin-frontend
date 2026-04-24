const CALENDAR_FIELDS = `
  calendarId
  title
  description
  type
  authority
  program
  semester
  year
  date
  fileUrl
  createdAt
  updatedAt
`

export const CREATE_ACADEMIC_CALENDAR = `
  mutation CreateAcademicCalendar($input: CreateAcademicCalendarInput!) {
    createAcademicCalendar(input: $input) { ${CALENDAR_FIELDS} }
  }
`

export const UPDATE_ACADEMIC_CALENDAR = `
  mutation UpdateAcademicCalendar($input: UpdateAcademicCalendarInput!) {
    updateAcademicCalendar(input: $input) { ${CALENDAR_FIELDS} }
  }
`

export const DELETE_ACADEMIC_CALENDAR = `
  mutation DeleteAcademicCalendar($calendarId: ID!) {
    deleteAcademicCalendar(calendarId: $calendarId) { calendarId }
  }
`

const RULES_FIELDS = `
  documentId
  serviceRulesFile
  serviceRulesText
  attendanceFile
  attendance
  disciplineFile
  discipline
  updatedAt
`

export const UPDATE_RULES_REGULATIONS = `
  mutation UpdateRulesRegulations($input: UpdateRulesRegulationsInput!) {
    updateRulesRegulations(input: $input) { ${RULES_FIELDS} }
  }
`

const RANK_FIELDS = `
  rankId
  year
  program
  usn
  studentName
  branch
  rank
  rankOrder
  createdAt
`

export const CREATE_RANK_HOLDER = `
  mutation CreateRankHolder($input: CreateRankHolderInput!) {
    createRankHolder(input: $input) { ${RANK_FIELDS} }
  }
`

export const UPDATE_RANK_HOLDER = `
  mutation UpdateRankHolder($input: UpdateRankHolderInput!) {
    updateRankHolder(input: $input) { ${RANK_FIELDS} }
  }
`

export const DELETE_RANK_HOLDER = `
  mutation DeleteRankHolder($rankId: ID!) {
    deleteRankHolder(rankId: $rankId) { rankId }
  }
`

const FIELDS = `
  syllabusId
  year
  category
  title
  subtitle
  fileUrl
  order
  createdAt
`

export const CREATE_SCHEME_SYLLABUS = `
  mutation CreateSchemeSyllabus($input: CreateSchemeSyllabusInput!) {
    createSchemeSyllabus(input: $input) { ${FIELDS} }
  }
`

export const UPDATE_SCHEME_SYLLABUS = `
  mutation UpdateSchemeSyllabus($input: UpdateSchemeSyllabusInput!) {
    updateSchemeSyllabus(input: $input) { ${FIELDS} }
  }
`

export const DELETE_SCHEME_SYLLABUS = `
  mutation DeleteSchemeSyllabus($syllabusId: ID!) {
    deleteSchemeSyllabus(syllabusId: $syllabusId) { syllabusId }
  }
`
