// ── DeptPublication ───────────────────────────────────────────────────────────

export const CREATE_DEPT_PUBLICATION = `
  mutation CreateDeptPublication($input: CreateDeptPublicationInput!) {
    createDeptPublication(input: $input) {
      deptPublicationId
      deptId
      title
      authors
      journal
      year
      type
      doi
    }
  }
`

export const UPDATE_DEPT_PUBLICATION = `
  mutation UpdateDeptPublication($input: UpdateDeptPublicationInput!) {
    updateDeptPublication(input: $input) {
      deptPublicationId
      deptId
      title
      authors
      journal
      year
      type
      doi
    }
  }
`

export const DELETE_DEPT_PUBLICATION = `
  mutation DeleteDeptPublication($deptPublicationId: ID!) {
    deleteDeptPublication(deptPublicationId: $deptPublicationId) {
      deptPublicationId
    }
  }
`

// ── PublicationProfile ────────────────────────────────────────────────────────

export const SAVE_PUBLICATION_PROFILE = `
  mutation SavePublicationProfile($input: SavePublicationProfileInput!) {
    savePublicationProfile(input: $input) {
      publicationProfileId
      deptId
      facultyId
      googleScholarLink
      irinsLink
    }
  }
`

export const DELETE_PUBLICATION_PROFILE = `
  mutation DeletePublicationProfile($publicationProfileId: ID!) {
    deletePublicationProfile(publicationProfileId: $publicationProfileId) {
      publicationProfileId
    }
  }
`

// ── ResearchGrant ─────────────────────────────────────────────────────────────

export const CREATE_RESEARCH_GRANT = `
  mutation CreateResearchGrant($input: CreateResearchGrantInput!) {
    createResearchGrant(input: $input) {
      __typename
    }
  }
`

export const UPDATE_RESEARCH_GRANT = `
  mutation UpdateResearchGrant($input: UpdateResearchGrantInput!) {
    updateResearchGrant(input: $input) {
      researchGrantId
      deptId
      text
    }
  }
`

export const DELETE_RESEARCH_GRANT = `
  mutation DeleteResearchGrant($researchGrantId: ID!) {
    deleteResearchGrant(researchGrantId: $researchGrantId) {
      researchGrantId
    }
  }
`

// ── Patent ────────────────────────────────────────────────────────────────────

export const CREATE_PATENT = `
  mutation CreatePatent($input: CreatePatentInput!) {
    createPatent(input: $input) {
      __typename
    }
  }
`

export const UPDATE_PATENT = `
  mutation UpdatePatent($input: UpdatePatentInput!) {
    updatePatent(input: $input) {
      patentId
      deptId
      text
    }
  }
`

export const DELETE_PATENT = `
  mutation DeletePatent($patentId: ID!) {
    deletePatent(patentId: $patentId) {
      patentId
    }
  }
`

// ── FacultyResearchSummary ────────────────────────────────────────────────────

export const CREATE_FACULTY_RESEARCH_SUMMARY = `
  mutation CreateFacultyResearchSummary($input: CreateFacultyResearchSummaryInput!) {
    createFacultyResearchSummary(input: $input) {
      __typename
    }
  }
`

export const UPDATE_FACULTY_RESEARCH_SUMMARY = `
  mutation UpdateFacultyResearchSummary($input: UpdateFacultyResearchSummaryInput!) {
    updateFacultyResearchSummary(input: $input) {
      facultyResearchSummaryId
      deptId
      facultyId
      researchArea
      guideName
      guideDesignation
      guideInstitution
      guideType
      thesisTitle
      university
      yearOfRegistration
      courseWorkCompleted
      prePhDVivaVoce
      finalThesisSubmitted
      researchStatus
      thesisDocumentUrl
      remarks
    }
  }
`

export const DELETE_FACULTY_RESEARCH_SUMMARY = `
  mutation DeleteFacultyResearchSummary($facultyResearchSummaryId: ID!) {
    deleteFacultyResearchSummary(facultyResearchSummaryId: $facultyResearchSummaryId) {
      facultyResearchSummaryId
    }
  }
`

// ── PhdGuide ──────────────────────────────────────────────────────────────────

export const CREATE_PHD_GUIDE = `
  mutation CreatePhdGuide($input: CreatePhdGuideInput!) {
    createPhdGuide(input: $input) {
      phdGuideId
      deptId
      facultyName
      university
      recognizedYear
      scholarsGuided
      ongoingScholars
    }
  }
`

export const UPDATE_PHD_GUIDE = `
  mutation UpdatePhdGuide($input: UpdatePhdGuideInput!) {
    updatePhdGuide(input: $input) {
      phdGuideId
      deptId
      facultyName
      university
      recognizedYear
      scholarsGuided
      ongoingScholars
    }
  }
`

export const DELETE_PHD_GUIDE = `
  mutation DeletePhdGuide($phdGuideId: ID!) {
    deletePhdGuide(phdGuideId: $phdGuideId) {
      phdGuideId
    }
  }
`

// ── PhdScholar ────────────────────────────────────────────────────────────────

export const CREATE_PHD_SCHOLAR = `
  mutation CreatePhdScholar($input: CreatePhdScholarInput!) {
    createPhdScholar(input: $input) {
      phdScholarId
      deptId
      guideFacultyId
      scholarName
      institution
      department
      yearOfRegistration
      thesisTitle
      yearOfDegreeAwarded
      courseWorkCompleted
      prePhdViva
      finalThesisSubmitted
      status
    }
  }
`

export const UPDATE_PHD_SCHOLAR = `
  mutation UpdatePhdScholar($input: UpdatePhdScholarInput!) {
    updatePhdScholar(input: $input) {
      phdScholarId
      deptId
      guideFacultyId
      scholarName
      institution
      department
      yearOfRegistration
      thesisTitle
      yearOfDegreeAwarded
      courseWorkCompleted
      prePhdViva
      finalThesisSubmitted
      status
    }
  }
`

export const DELETE_PHD_SCHOLAR = `
  mutation DeletePhdScholar($phdScholarId: ID!) {
    deletePhdScholar(phdScholarId: $phdScholarId) {
      phdScholarId
    }
  }
`
