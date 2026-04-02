export const LIST_DEPT_COURSES = /* GraphQL */ `
  query ListDeptCourses($deptId: ID!, $programType: String, $program: String, $batch: String, $semester: Int, $type: String, $limit: Int, $nextToken: String) {
    listDeptCourses(deptId: $deptId, programType: $programType, program: $program, batch: $batch, semester: $semester, type: $type, limit: $limit, nextToken: $nextToken) {
      items {
        deptCourseId
        deptId
        programType
        program
        batch
        code
        name
        semester
        credits
        type
        scheme
      }
      nextToken
    }
  }
`

export const GET_DEPT_COURSE = /* GraphQL */ `
  query GetDeptCourse($deptCourseId: ID!) {
    getDeptCourse(deptCourseId: $deptCourseId) {
      deptCourseId
      deptId
      programType
      program
      batch
      code
      name
      semester
      credits
      type
      scheme
    }
  }
`

export const LIST_DEPT_TIMETABLES = /* GraphQL */ `
  query ListDeptTimetables($deptId: ID!, $semester: Int, $academicYear: String) {
    listDeptTimetables(deptId: $deptId, semester: $semester, academicYear: $academicYear) {
      items {
        deptTimetableId
        deptId
        section
        semester
        academicYear
        fileUrl
        uploadedAt
      }
    }
  }
`

export const LIST_LEARNING_MATERIALS = /* GraphQL */ `
  query ListLearningMaterials($deptId: ID!, $courseCode: String, $type: String, $limit: Int, $nextToken: String) {
    listLearningMaterials(deptId: $deptId, courseCode: $courseCode, type: $type, limit: $limit, nextToken: $nextToken) {
      items {
        learningMaterialId
        deptId
        courseCode
        courseName
        title
        type
        fileUrl
        uploadedBy
      }
      nextToken
    }
  }
`

export const LIST_INNOVATIVE_TEACHING = /* GraphQL */ `
  query ListInnovativeTeaching($deptId: ID!) {
    listInnovativeTeaching(deptId: $deptId) {
      items {
        innovativeTeachingId
        deptId
        faculties {
          facultyId
          facultyName
        }
        description
        imageUrls
        pdfUrl
      }
    }
  }
`

export const LIST_DEPT_SLOTS = /* GraphQL */ `
  query ListDeptSlots($deptId: ID!, $sectionId: ID!) {
    listDeptSlots(deptId: $deptId, sectionId: $sectionId) {
      items {
        deptSlotId
        deptId
        sectionId
        day
        period
        courseCode
        courseName
        type
        facultyId
      }
    }
  }
`

export const LIST_DEPT_SECTIONS = /* GraphQL */ `
  query ListDeptSections($deptId: ID!, $programId: ID, $semester: Int, $batchName: String) {
    listDeptSections(deptId: $deptId, programId: $programId, semester: $semester, batchName: $batchName) {
      items {
        deptSectionId
        deptId
        programId
        batchName
        semester
        name
      }
    }
  }
`

export const LIST_DEPT_BATCHES = /* GraphQL */ `
  query ListDeptBatches($deptId: ID!, $programType: String, $program: String) {
    listDeptBatches(deptId: $deptId, programType: $programType, program: $program) {
      items {
        deptBatchId
        deptId
        programType
        program
        name
        startYear
        endYear
      }
    }
  }
`

export const LIST_RESULT_ANALYSES = /* GraphQL */ `
  query ListResultAnalyses($deptId: ID!, $semester: Int, $batch: String) {
    listResultAnalyses(deptId: $deptId, semester: $semester, batch: $batch) {
      items {
        resultAnalysisId
        deptId
        title
        semester
        batch
        pdfUrl
        graphImageUrl
      }
    }
  }
`
