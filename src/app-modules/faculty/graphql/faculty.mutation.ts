// ── Faculty core ──────────────────────────────────────────────────────────────

export const CREATE_FACULTY = `
  mutation CreateFaculty($input: CreateFacultyInput!) {
    createFaculty(input: $input) {
      facultyId
      name
      designation
      deptId
      department
      profileImage
      cvUrl
      status
      order
      createdAt
    }
  }
`

export const UPDATE_FACULTY = `
  mutation UpdateFaculty($input: UpdateFacultyInput!) {
    updateFaculty(input: $input) {
      facultyId
      name
      designation
      deptId
      department
      profileImage
      cvUrl
      status
      order
      updatedAt
    }
  }
`

export const DELETE_FACULTY = `
  mutation DeleteFaculty($facultyId: ID!) {
    deleteFaculty(facultyId: $facultyId) {
      facultyId
    }
  }
`

// ── Publications ──────────────────────────────────────────────────────────────

export const ADD_PUBLICATION = `
  mutation AddPublication($input: AddPublicationInput!) {
    addPublication(input: $input) {
      publicationId
      facultyId
      title
      authors
      journal
      year
      doi
      type
    }
  }
`

export const UPDATE_PUBLICATION = `
  mutation UpdatePublication($input: UpdatePublicationInput!) {
    updatePublication(input: $input) {
      publicationId
      facultyId
      title
      authors
      journal
      year
      doi
      type
    }
  }
`

export const REMOVE_PUBLICATION = `
  mutation RemovePublication($input: RemovePublicationInput!) {
    removePublication(input: $input) {
      publicationId
      facultyId
    }
  }
`

// ── Education ─────────────────────────────────────────────────────────────────

export const ADD_EDUCATION = `
  mutation AddEducation($input: AddEducationInput!) {
    addEducation(input: $input) {
      educationId
      facultyId
      degree
      institution
      fieldOfStudy
      startYear
      endYear
      description
    }
  }
`

export const UPDATE_EDUCATION = `
  mutation UpdateEducation($input: UpdateEducationInput!) {
    updateEducation(input: $input) {
      educationId
      facultyId
      degree
      institution
      fieldOfStudy
      startYear
      endYear
      description
    }
  }
`

export const REMOVE_EDUCATION = `
  mutation RemoveEducation($input: RemoveEducationInput!) {
    removeEducation(input: $input) {
      educationId
      facultyId
    }
  }
`

// ── Work Experience ───────────────────────────────────────────────────────────

export const ADD_WORK_EXPERIENCE = `
  mutation AddWorkExperience($input: AddWorkExperienceInput!) {
    addWorkExperience(input: $input) {
      workExperienceId
      facultyId
      title
      organization
      startDate
      endDate
      current
      description
    }
  }
`

export const UPDATE_WORK_EXPERIENCE = `
  mutation UpdateWorkExperience($input: UpdateWorkExperienceInput!) {
    updateWorkExperience(input: $input) {
      workExperienceId
      facultyId
      title
      organization
      startDate
      endDate
      current
      description
    }
  }
`

export const REMOVE_WORK_EXPERIENCE = `
  mutation RemoveWorkExperience($input: RemoveWorkExperienceInput!) {
    removeWorkExperience(input: $input) {
      workExperienceId
      facultyId
    }
  }
`

// ── Research Projects ─────────────────────────────────────────────────────────

export const ADD_RESEARCH_PROJECT = `
  mutation AddResearchProject($input: AddResearchProjectInput!) {
    addResearchProject(input: $input) {
      researchProjectId
      facultyId
      title
      description
      status
      startDate
      endDate
      fundingSource
      collaborators
    }
  }
`

export const UPDATE_RESEARCH_PROJECT = `
  mutation UpdateResearchProject($input: UpdateResearchProjectInput!) {
    updateResearchProject(input: $input) {
      researchProjectId
      facultyId
      title
      description
      status
      startDate
      endDate
      fundingSource
      collaborators
    }
  }
`

export const REMOVE_RESEARCH_PROJECT = `
  mutation RemoveResearchProject($input: RemoveResearchProjectInput!) {
    removeResearchProject(input: $input) {
      researchProjectId
      facultyId
    }
  }
`

// ── Course Teachings ──────────────────────────────────────────────────────────

export const ADD_COURSE_TEACHING = `
  mutation AddCourseTeaching($input: AddCourseTeachingInput!) {
    addCourseTeaching(input: $input) {
      courseTeachingId
      facultyId
      courseCode
      courseName
      semester
      year
      credits
      description
    }
  }
`

export const UPDATE_COURSE_TEACHING = `
  mutation UpdateCourseTeaching($input: UpdateCourseTeachingInput!) {
    updateCourseTeaching(input: $input) {
      courseTeachingId
      facultyId
      courseCode
      courseName
      semester
      year
      credits
      description
    }
  }
`

export const REMOVE_COURSE_TEACHING = `
  mutation RemoveCourseTeaching($input: RemoveCourseTeachingInput!) {
    removeCourseTeaching(input: $input) {
      courseTeachingId
      facultyId
    }
  }
`

// ── Honors ────────────────────────────────────────────────────────────────────

export const ADD_HONOR = `
  mutation AddHonor($input: AddHonorInput!) {
    addHonor(input: $input) {
      honorId
      facultyId
      title
      organization
      year
      description
    }
  }
`

export const UPDATE_HONOR = `
  mutation UpdateHonor($input: UpdateHonorInput!) {
    updateHonor(input: $input) {
      honorId
      facultyId
      title
      organization
      year
      description
    }
  }
`

export const REMOVE_HONOR = `
  mutation RemoveHonor($input: RemoveHonorInput!) {
    removeHonor(input: $input) {
      honorId
      facultyId
    }
  }
`
