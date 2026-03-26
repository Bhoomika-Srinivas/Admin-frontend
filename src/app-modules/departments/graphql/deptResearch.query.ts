// ── Publications ──────────────────────────────────────────────────────────────

export const LIST_DEPT_PUBLICATIONS = `
  query ListDeptPublications($deptId: ID!) {
    listDeptPublications(deptId: $deptId) {
      items {
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
  }
`

// ── Publication Profiles ───────────────────────────────────────────────────────

export const LIST_PUBLICATION_PROFILES = `
  query ListPublicationProfiles($deptId: ID!) {
    listPublicationProfiles(deptId: $deptId) {
      items {
        publicationProfileId
        deptId
        facultyId
        googleScholarLink
        irinsLink
      }
    }
  }
`

// ── Research Grants ────────────────────────────────────────────────────────────

export const LIST_RESEARCH_GRANTS = `
  query ListResearchGrants($deptId: ID!) {
    listResearchGrants(deptId: $deptId) {
      items {
        researchGrantId
        deptId
        text
      }
    }
  }
`

// ── Patents ───────────────────────────────────────────────────────────────────

export const LIST_PATENTS = `
  query ListPatents($deptId: ID!) {
    listPatents(deptId: $deptId) {
      items {
        patentId
        deptId
        text
      }
    }
  }
`

// ── Faculty Research Summaries ─────────────────────────────────────────────────

export const LIST_FACULTY_RESEARCH_SUMMARIES = `
  query ListFacultyResearchSummaries($deptId: ID!) {
    listFacultyResearchSummaries(deptId: $deptId) {
      items {
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
  }
`

// ── PhD Guides ────────────────────────────────────────────────────────────────

export const LIST_PHD_GUIDES = `
  query ListPhdGuides($deptId: ID!) {
    listPhdGuides(deptId: $deptId) {
      items {
        phdGuideId
        deptId
        facultyName
        university
        recognizedYear
        scholarsGuided
        ongoingScholars
      }
    }
  }
`

// ── PhD Scholars ──────────────────────────────────────────────────────────────

export const LIST_PHD_SCHOLARS = `
  query ListPhdScholars($deptId: ID!) {
    listPhdScholars(deptId: $deptId) {
      items {
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
  }
`

export const LIST_PHD_SCHOLARS_BY_GUIDE = `
  query ListPhdScholarsByGuide($deptId: ID!, $guideFacultyId: ID!) {
    listPhdScholars(deptId: $deptId, guideFacultyId: $guideFacultyId) {
      items {
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
  }
`
