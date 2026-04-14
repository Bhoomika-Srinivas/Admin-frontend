// ─── Singletons ───────────────────────────────────────────────────────────────

export const SAVE_ADMISSIONS_OVERVIEW = /* GraphQL */ `
  mutation SaveAdmissionsOverview($input: SaveAdmissionsOverviewInput!) {
    saveAdmissionsOverview(input: $input) {
      headline subheadline description highlights imageUrl bannerUrl updatedAt
    }
  }
`

export const SAVE_PROSPECTUS = /* GraphQL */ `
  mutation SaveProspectus($input: SaveProspectusInput!) {
    saveProspectus(input: $input) {
      title description fileUrl fileName uploadedAt
    }
  }
`

export const DELETE_PROSPECTUS = /* GraphQL */ `
  mutation DeleteProspectus {
    deleteProspectus
  }
`

export const SAVE_WHY_ENQUIRE = /* GraphQL */ `
  mutation SaveWhyEnquire($input: SaveWhyEnquireInput!) {
    saveWhyEnquire(input: $input) {
      title points
    }
  }
`

// ─── Programs ─────────────────────────────────────────────────────────────────

export const CREATE_ADMISSIONS_PROGRAM = /* GraphQL */ `
  mutation CreateAdmissionsProgram($input: CreateAdmissionsProgramInput!) {
    createAdmissionsProgram(input: $input) {
      programId level name duration seats description eligibility order
    }
  }
`

export const UPDATE_ADMISSIONS_PROGRAM = /* GraphQL */ `
  mutation UpdateAdmissionsProgram($input: UpdateAdmissionsProgramInput!) {
    updateAdmissionsProgram(input: $input) {
      programId level name duration seats description eligibility order
    }
  }
`

export const DELETE_ADMISSIONS_PROGRAM = /* GraphQL */ `
  mutation DeleteAdmissionsProgram($programId: ID!) {
    deleteAdmissionsProgram(programId: $programId) { programId }
  }
`

// ─── UG Courses ───────────────────────────────────────────────────────────────

export const CREATE_UG_COURSE = /* GraphQL */ `
  mutation CreateUGCourse($input: CreateUGCourseInput!) {
    createUGCourse(input: $input) {
      courseId name code duration seats description order
    }
  }
`

export const UPDATE_UG_COURSE = /* GraphQL */ `
  mutation UpdateUGCourse($input: UpdateUGCourseInput!) {
    updateUGCourse(input: $input) {
      courseId name code duration seats description order
    }
  }
`

export const DELETE_UG_COURSE = /* GraphQL */ `
  mutation DeleteUGCourse($courseId: ID!) {
    deleteUGCourse(courseId: $courseId) { courseId }
  }
`

// ─── PG Courses ───────────────────────────────────────────────────────────────

export const CREATE_PG_COURSE = /* GraphQL */ `
  mutation CreatePGCourse($input: CreatePGCourseInput!) {
    createPGCourse(input: $input) {
      courseId name code duration seats description order
    }
  }
`

export const UPDATE_PG_COURSE = /* GraphQL */ `
  mutation UpdatePGCourse($input: UpdatePGCourseInput!) {
    updatePGCourse(input: $input) {
      courseId name code duration seats description order
    }
  }
`

export const DELETE_PG_COURSE = /* GraphQL */ `
  mutation DeletePGCourse($courseId: ID!) {
    deletePGCourse(courseId: $courseId) { courseId }
  }
`

// ─── Eligibility ──────────────────────────────────────────────────────────────

export const CREATE_ELIGIBILITY_ENTRY = /* GraphQL */ `
  mutation CreateEligibilityEntry($input: CreateEligibilityEntryInput!) {
    createEligibilityEntry(input: $input) {
      entryId title description order
    }
  }
`

export const UPDATE_ELIGIBILITY_ENTRY = /* GraphQL */ `
  mutation UpdateEligibilityEntry($input: UpdateEligibilityEntryInput!) {
    updateEligibilityEntry(input: $input) {
      entryId title description order
    }
  }
`

export const DELETE_ELIGIBILITY_ENTRY = /* GraphQL */ `
  mutation DeleteEligibilityEntry($entryId: ID!) {
    deleteEligibilityEntry(entryId: $entryId) { entryId }
  }
`

// ─── Steps ────────────────────────────────────────────────────────────────────

export const CREATE_ADMISSION_STEP = /* GraphQL */ `
  mutation CreateAdmissionStep($input: CreateAdmissionStepInput!) {
    createAdmissionStep(input: $input) {
      stepId title description iconName order
    }
  }
`

export const UPDATE_ADMISSION_STEP = /* GraphQL */ `
  mutation UpdateAdmissionStep($input: UpdateAdmissionStepInput!) {
    updateAdmissionStep(input: $input) {
      stepId title description iconName order
    }
  }
`

export const DELETE_ADMISSION_STEP = /* GraphQL */ `
  mutation DeleteAdmissionStep($stepId: ID!) {
    deleteAdmissionStep(stepId: $stepId) { stepId }
  }
`

export const REORDER_ADMISSION_STEPS = /* GraphQL */ `
  mutation ReorderAdmissionSteps($ids: [ID!]!) {
    reorderAdmissionSteps(ids: $ids) {
      stepId order
    }
  }
`

// ─── Important Dates ─────────────────────────────────────────────────────────

export const CREATE_IMPORTANT_DATE = /* GraphQL */ `
  mutation CreateImportantDate($input: CreateImportantDateInput!) {
    createImportantDate(input: $input) {
      dateId event date description category
    }
  }
`

export const UPDATE_IMPORTANT_DATE = /* GraphQL */ `
  mutation UpdateImportantDate($input: UpdateImportantDateInput!) {
    updateImportantDate(input: $input) {
      dateId event date description category
    }
  }
`

export const DELETE_IMPORTANT_DATE = /* GraphQL */ `
  mutation DeleteImportantDate($dateId: ID!) {
    deleteImportantDate(dateId: $dateId) { dateId }
  }
`

// ─── Fee Documents ────────────────────────────────────────────────────────────

export const CREATE_FEE_DOCUMENT = /* GraphQL */ `
  mutation CreateFeeDocument($input: CreateFeeDocumentInput!) {
    createFeeDocument(input: $input) {
      feeDocId title fileUrl fileName uploadedAt
    }
  }
`

export const UPDATE_FEE_DOCUMENT = /* GraphQL */ `
  mutation UpdateFeeDocument($input: UpdateFeeDocumentInput!) {
    updateFeeDocument(input: $input) {
      feeDocId title fileUrl fileName uploadedAt
    }
  }
`

export const DELETE_FEE_DOCUMENT = /* GraphQL */ `
  mutation DeleteFeeDocument($feeDocId: ID!) {
    deleteFeeDocument(feeDocId: $feeDocId)
  }
`

// ─── Scholarships ─────────────────────────────────────────────────────────────

export const CREATE_SCHOLARSHIP = /* GraphQL */ `
  mutation CreateScholarship($input: CreateScholarshipInput!) {
    createScholarship(input: $input) {
      scholarshipId type name description amount eligibility order
    }
  }
`

export const UPDATE_SCHOLARSHIP = /* GraphQL */ `
  mutation UpdateScholarship($input: UpdateScholarshipInput!) {
    updateScholarship(input: $input) {
      scholarshipId type name description amount eligibility order
    }
  }
`

export const DELETE_SCHOLARSHIP = /* GraphQL */ `
  mutation DeleteScholarship($scholarshipId: ID!) {
    deleteScholarship(scholarshipId: $scholarshipId) { scholarshipId }
  }
`

// ─── Audit Statements ────────────────────────────────────────────────────────

export const CREATE_AUDIT_STATEMENT = /* GraphQL */ `
  mutation CreateAuditStatement($input: CreateAuditStatementInput!) {
    createAuditStatement(input: $input) {
      auditId year title fileUrl fileName createdAt
    }
  }
`

export const DELETE_AUDIT_STATEMENT = /* GraphQL */ `
  mutation DeleteAuditStatement($auditId: ID!) {
    deleteAuditStatement(auditId: $auditId)
  }
`

// ─── Enquiry Categories ───────────────────────────────────────────────────────

export const CREATE_ENQUIRY_CATEGORY = /* GraphQL */ `
  mutation CreateEnquiryCategory($input: CreateEnquiryCategoryInput!) {
    createEnquiryCategory(input: $input) {
      categoryId title description
    }
  }
`

export const UPDATE_ENQUIRY_CATEGORY = /* GraphQL */ `
  mutation UpdateEnquiryCategory($input: UpdateEnquiryCategoryInput!) {
    updateEnquiryCategory(input: $input) {
      categoryId title description
    }
  }
`

export const DELETE_ENQUIRY_CATEGORY = /* GraphQL */ `
  mutation DeleteEnquiryCategory($categoryId: ID!) {
    deleteEnquiryCategory(categoryId: $categoryId) { categoryId }
  }
`

// ─── Info Blocks ──────────────────────────────────────────────────────────────

export const CREATE_INFO_BLOCK = /* GraphQL */ `
  mutation CreateInfoBlock($input: CreateInfoBlockInput!) {
    createInfoBlock(input: $input) {
      blockId type description
    }
  }
`

export const UPDATE_INFO_BLOCK = /* GraphQL */ `
  mutation UpdateInfoBlock($input: UpdateInfoBlockInput!) {
    updateInfoBlock(input: $input) {
      blockId type description
    }
  }
`

export const DELETE_INFO_BLOCK = /* GraphQL */ `
  mutation DeleteInfoBlock($blockId: ID!) {
    deleteInfoBlock(blockId: $blockId)
  }
`

// ─── Enquiries & Contacts ────────────────────────────────────────────────────

export const UPDATE_ENQUIRY_STATUS = /* GraphQL */ `
  mutation UpdateEnquiryStatus($enquiryId: ID!, $status: EnquiryStatus!) {
    updateEnquiryStatus(enquiryId: $enquiryId, status: $status) {
      enquiryId status updatedAt
    }
  }
`

export const UPDATE_ADMISSIONS_CONTACT = /* GraphQL */ `
  mutation UpdateAdmissionsContact($contactId: ID!, $input: UpdateAdmissionsContactInput!) {
    updateAdmissionsContact(contactId: $contactId, input: $input) {
      contactId role name phone email officeLocation
    }
  }
`
