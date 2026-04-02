// ── DeptSlot ───────────────────────────────────────────────────────────────────

export const CREATE_DEPT_SLOT = /* GraphQL */ `
  mutation CreateDeptSlot($input: CreateDeptSlotInput!) {
    createDeptSlot(input: $input) {
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
`

export const UPDATE_DEPT_SLOT = /* GraphQL */ `
  mutation UpdateDeptSlot($input: UpdateDeptSlotInput!) {
    updateDeptSlot(input: $input) {
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
`

export const DELETE_DEPT_SLOT = /* GraphQL */ `
  mutation DeleteDeptSlot($deptSlotId: ID!) {
    deleteDeptSlot(deptSlotId: $deptSlotId) {
      deptSlotId
    }
  }
`

// ── DeptSection ────────────────────────────────────────────────────────────────

export const CREATE_DEPT_SECTION = /* GraphQL */ `
  mutation CreateDeptSection($input: CreateDeptSectionInput!) {
    createDeptSection(input: $input) {
      deptSectionId
      deptId
      programId
      batchName
      semester
      name
    }
  }
`

export const DELETE_DEPT_SECTION = /* GraphQL */ `
  mutation DeleteDeptSection($deptSectionId: ID!) {
    deleteDeptSection(deptSectionId: $deptSectionId) {
      deptSectionId
    }
  }
`

// ── DeptBatch ──────────────────────────────────────────────────────────────────

export const CREATE_DEPT_BATCH = /* GraphQL */ `
  mutation CreateDeptBatch($input: CreateDeptBatchInput!) {
    createDeptBatch(input: $input) {
      deptBatchId
      deptId
      programType
      program
      name
      startYear
      endYear
    }
  }
`

export const DELETE_DEPT_BATCH = /* GraphQL */ `
  mutation DeleteDeptBatch($deptBatchId: ID!) {
    deleteDeptBatch(deptBatchId: $deptBatchId) {
      deptBatchId
    }
  }
`

// ── DeptCourse ─────────────────────────────────────────────────────────────────

export const CREATE_DEPT_COURSE = /* GraphQL */ `
  mutation CreateDeptCourse($input: CreateDeptCourseInput!) {
    createDeptCourse(input: $input) {
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

export const UPDATE_DEPT_COURSE = /* GraphQL */ `
  mutation UpdateDeptCourse($input: UpdateDeptCourseInput!) {
    updateDeptCourse(input: $input) {
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

export const DELETE_DEPT_COURSE = /* GraphQL */ `
  mutation DeleteDeptCourse($deptCourseId: ID!) {
    deleteDeptCourse(deptCourseId: $deptCourseId) {
      deptCourseId
    }
  }
`

// ── DeptTimetable ──────────────────────────────────────────────────────────────

export const CREATE_DEPT_TIMETABLE = /* GraphQL */ `
  mutation CreateDeptTimetable($input: CreateDeptTimetableInput!) {
    createDeptTimetable(input: $input) {
      deptTimetableId
      deptId
      section
      semester
      academicYear
      fileUrl
      uploadedAt
    }
  }
`

export const UPDATE_DEPT_TIMETABLE = /* GraphQL */ `
  mutation UpdateDeptTimetable($input: UpdateDeptTimetableInput!) {
    updateDeptTimetable(input: $input) {
      deptTimetableId
      deptId
      section
      semester
      academicYear
      fileUrl
      uploadedAt
    }
  }
`

export const DELETE_DEPT_TIMETABLE = /* GraphQL */ `
  mutation DeleteDeptTimetable($deptTimetableId: ID!) {
    deleteDeptTimetable(deptTimetableId: $deptTimetableId) {
      deptTimetableId
    }
  }
`

// ── LearningMaterial ───────────────────────────────────────────────────────────

export const CREATE_LEARNING_MATERIAL = /* GraphQL */ `
  mutation CreateLearningMaterial($input: CreateLearningMaterialInput!) {
    createLearningMaterial(input: $input) {
      learningMaterialId
      deptId
      courseCode
      courseName
      title
      type
      fileUrl
      uploadedBy
    }
  }
`

export const UPDATE_LEARNING_MATERIAL = /* GraphQL */ `
  mutation UpdateLearningMaterial($input: UpdateLearningMaterialInput!) {
    updateLearningMaterial(input: $input) {
      learningMaterialId
      deptId
      courseCode
      courseName
      title
      type
      fileUrl
      uploadedBy
    }
  }
`

export const DELETE_LEARNING_MATERIAL = /* GraphQL */ `
  mutation DeleteLearningMaterial($learningMaterialId: ID!) {
    deleteLearningMaterial(learningMaterialId: $learningMaterialId) {
      learningMaterialId
    }
  }
`

// ── InnovativeTeaching ─────────────────────────────────────────────────────────

export const CREATE_INNOVATIVE_TEACHING = /* GraphQL */ `
  mutation CreateInnovativeTeaching($input: CreateInnovativeTeachingInput!) {
    createInnovativeTeaching(input: $input) {
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
`

export const UPDATE_INNOVATIVE_TEACHING = /* GraphQL */ `
  mutation UpdateInnovativeTeaching($input: UpdateInnovativeTeachingInput!) {
    updateInnovativeTeaching(input: $input) {
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
`

export const DELETE_INNOVATIVE_TEACHING = /* GraphQL */ `
  mutation DeleteInnovativeTeaching($innovativeTeachingId: ID!) {
    deleteInnovativeTeaching(innovativeTeachingId: $innovativeTeachingId) {
      innovativeTeachingId
    }
  }
`

// ── ResultAnalysis ─────────────────────────────────────────────────────────────

export const CREATE_RESULT_ANALYSIS = /* GraphQL */ `
  mutation CreateResultAnalysis($input: CreateResultAnalysisInput!) {
    createResultAnalysis(input: $input) {
      resultAnalysisId
      deptId
      title
      semester
      batch
      pdfUrl
      graphImageUrl
    }
  }
`

export const UPDATE_RESULT_ANALYSIS = /* GraphQL */ `
  mutation UpdateResultAnalysis($input: UpdateResultAnalysisInput!) {
    updateResultAnalysis(input: $input) {
      resultAnalysisId
      deptId
      title
      semester
      batch
      pdfUrl
      graphImageUrl
    }
  }
`

export const DELETE_RESULT_ANALYSIS = /* GraphQL */ `
  mutation DeleteResultAnalysis($resultAnalysisId: ID!) {
    deleteResultAnalysis(resultAnalysisId: $resultAnalysisId) {
      resultAnalysisId
    }
  }
`
