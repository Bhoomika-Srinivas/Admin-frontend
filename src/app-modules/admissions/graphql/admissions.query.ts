export const GET_ADMISSIONS_OVERVIEW = /* GraphQL */ `
  query GetAdmissionsOverview {
    getAdmissionsOverview {
      headline subheadline description highlights imageUrl bannerUrl updatedAt
    }
  }
`

export const LIST_ADMISSIONS_PROGRAMS = /* GraphQL */ `
  query ListAdmissionsPrograms($level: String) {
    listAdmissionsPrograms(level: $level) {
      programId level name duration seats description eligibility order
    }
  }
`

export const LIST_UG_COURSES = /* GraphQL */ `
  query ListUGCourses {
    listUGCourses {
      courseId name code duration seats description order
    }
  }
`

export const LIST_PG_COURSES = /* GraphQL */ `
  query ListPGCourses {
    listPGCourses {
      courseId name code duration seats description order
    }
  }
`

export const LIST_ELIGIBILITY_ENTRIES = /* GraphQL */ `
  query ListEligibilityEntries {
    listEligibilityEntries {
      entryId title description order
    }
  }
`

export const LIST_ADMISSION_STEPS = /* GraphQL */ `
  query ListAdmissionSteps {
    listAdmissionSteps {
      stepId title description iconName order
    }
  }
`

export const LIST_IMPORTANT_DATES = /* GraphQL */ `
  query ListImportantDates {
    listImportantDates {
      dateId event date description category
    }
  }
`

export const GET_PROSPECTUS = /* GraphQL */ `
  query GetProspectus {
    getProspectus {
      title description fileUrl fileName uploadedAt
    }
  }
`

export const LIST_FEE_DOCUMENTS = /* GraphQL */ `
  query ListFeeDocuments {
    listFeeDocuments {
      feeDocId title fileUrl fileName uploadedAt
    }
  }
`

export const LIST_SCHOLARSHIPS = /* GraphQL */ `
  query ListScholarships {
    listScholarships {
      scholarshipId type name description amount eligibility order
    }
  }
`

export const LIST_AUDIT_STATEMENTS = /* GraphQL */ `
  query ListAuditStatements {
    listAuditStatements {
      auditId year title fileUrl fileName createdAt
    }
  }
`

export const LIST_ADMISSIONS_ENQUIRIES = /* GraphQL */ `
  query ListAdmissionsEnquiries($status: String) {
    listAdmissionsEnquiries(status: $status) {
      enquiryId name email phone program message status createdAt
    }
  }
`

export const LIST_ADMISSIONS_CONTACTS = /* GraphQL */ `
  query ListAdmissionsContacts {
    listAdmissionsContacts {
      contactId role name phone email officeLocation
    }
  }
`

export const GET_WHY_ENQUIRE = /* GraphQL */ `
  query GetWhyEnquire {
    getWhyEnquire {
      title points
    }
  }
`

export const LIST_ENQUIRY_CATEGORIES = /* GraphQL */ `
  query ListEnquiryCategories {
    listEnquiryCategories {
      categoryId title description
    }
  }
`

export const LIST_INFO_BLOCKS = /* GraphQL */ `
  query ListInfoBlocks {
    listInfoBlocks {
      blockId type description
    }
  }
`
