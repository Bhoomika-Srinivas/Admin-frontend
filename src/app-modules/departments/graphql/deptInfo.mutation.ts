// src/app-modules/departments/graphql/deptInfo.mutation.ts

// ── File upload ───────────────────────────────────────────────────────────────

export const GET_UPLOAD_URL = /* GraphQL */ `
  mutation GetUploadUrl($module: String!, $entity_id: String!, $extension: String!) {
    getUploadUrl(module: $module, entity_id: $entity_id, extension: $extension) {
      upload_url
      key
      file_id
    }
  }
`

// ── Singleton upserts ─────────────────────────────────────────────────────────

export const SAVE_DEPT_INTRODUCTION = /* GraphQL */ `
  mutation SaveDeptIntroduction($deptId: ID!, $input: SaveDeptIntroductionInput!) {
    saveDeptIntroduction(deptId: $deptId, input: $input) {
      deptId
      departmentName
      logoUrl
      imageUrl
      description
    }
  }
`

export const SAVE_DEPT_ABOUT = /* GraphQL */ `
  mutation SaveDeptAbout($deptId: ID!, $input: SaveDeptAboutInput!) {
    saveDeptAbout(deptId: $deptId, input: $input) {
      deptId
      vision
      mission
      updatedAt
    }
  }
`

export const SAVE_DEPT_SWOT = /* GraphQL */ `
  mutation SaveDeptSwot($deptId: ID!, $input: SaveDeptSwotInput!) {
    saveDeptSwot(deptId: $deptId, input: $input) {
      deptId
      strengths
      weaknesses
      opportunities
      threats
    }
  }
`

export const SAVE_HOD_PROFILE = /* GraphQL */ `
  mutation SaveHodProfile($deptId: ID!, $input: SaveHodProfileInput!) {
    saveHodProfile(deptId: $deptId, input: $input) {
      deptId
      name
      title
      designation
      qualification
      experience
      specialization
      message
      profileSummary
      email
      phone
      imageUrl
      cvUrl
    }
  }
`

// ── Program Outcomes CRUD ─────────────────────────────────────────────────────

export const CREATE_PROGRAM_OUTCOME = /* GraphQL */ `
  mutation CreateProgramOutcome($input: CreateProgramOutcomeInput!) {
    createProgramOutcome(input: $input) {
      programOutcomeId
      deptId
      type
      statement
      order
    }
  }
`

export const UPDATE_PROGRAM_OUTCOME = /* GraphQL */ `
  mutation UpdateProgramOutcome($input: UpdateProgramOutcomeInput!) {
    updateProgramOutcome(input: $input) {
      programOutcomeId
      deptId
      type
      statement
      order
    }
  }
`

export const DELETE_PROGRAM_OUTCOME = /* GraphQL */ `
  mutation DeleteProgramOutcome($programOutcomeId: ID!) {
    deleteProgramOutcome(programOutcomeId: $programOutcomeId) {
      programOutcomeId
    }
  }
`

export const REORDER_PROGRAM_OUTCOMES = /* GraphQL */ `
  mutation ReorderProgramOutcomes($input: ReorderProgramOutcomesInput!) {
    reorderProgramOutcomes(input: $input)
  }
`

// ── Distinguished Alumni CRUD ─────────────────────────────────────────────────

export const CREATE_DISTINGUISHED_ALUMNUS = /* GraphQL */ `
  mutation CreateDistinguishedAlumnus($input: CreateDistinguishedAlumnusInput!) {
    createDistinguishedAlumnus(input: $input) {
      distinguishedAlumnusId
      deptId
      name
      batch
      currentRole
      organization
      achievement
      imageUrl
    }
  }
`

export const UPDATE_DISTINGUISHED_ALUMNUS = /* GraphQL */ `
  mutation UpdateDistinguishedAlumnus($input: UpdateDistinguishedAlumnusInput!) {
    updateDistinguishedAlumnus(input: $input) {
      distinguishedAlumnusId
      deptId
      name
      batch
      currentRole
      organization
      achievement
      imageUrl
    }
  }
`

export const DELETE_DISTINGUISHED_ALUMNUS = /* GraphQL */ `
  mutation DeleteDistinguishedAlumnus($distinguishedAlumnusId: ID!) {
    deleteDistinguishedAlumnus(distinguishedAlumnusId: $distinguishedAlumnusId) {
      distinguishedAlumnusId
    }
  }
`
