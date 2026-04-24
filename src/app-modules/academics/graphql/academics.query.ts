export const LIST_ACADEMIC_CALENDAR = `
  query ListAcademicCalendar($type: String, $authority: String, $program: String, $year: String) {
    listAcademicCalendar(type: $type, authority: $authority, program: $program, year: $year) {
      items {
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
      }
      nextToken
    }
  }
`

export const GET_RULES_REGULATIONS = `
  query GetRulesRegulations {
    getRulesRegulations {
      documentId
      serviceRulesFile
      serviceRulesText
      attendanceFile
      attendance
      disciplineFile
      discipline
      updatedAt
    }
  }
`

export const LIST_RANK_HOLDERS = `
  query ListRankHolders($year: String, $program: String) {
    listRankHolders(year: $year, program: $program) {
      items {
        rankId
        year
        program
        usn
        studentName
        branch
        rank
        rankOrder
        createdAt
      }
      nextToken
    }
  }
`

export const LIST_SCHEME_SYLLABUS = `
  query ListSchemeSyllabus {
    listSchemeSyllabus {
      items {
        syllabusId
        year
        category
        title
        subtitle
        fileUrl
        order
        createdAt
      }
      nextToken
    }
  }
`
