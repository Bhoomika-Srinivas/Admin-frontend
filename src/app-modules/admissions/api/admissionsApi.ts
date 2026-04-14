import { gqlRequest } from '@/api/graphqlClient'
import type {
  AdmissionsOverview, AdmissionsProgram, UGCourse, PGCourse,
  EligibilityEntry, AdmissionStep, ImportantDate, Prospectus,
  FeeDocument, Scholarship, AuditStatement, AdmissionsEnquiry,
  AdmissionsContact, WhyEnquire, EnquiryCategory, InfoBlock,
} from '@/shared/types/models'
import {
  GET_ADMISSIONS_OVERVIEW, LIST_ADMISSIONS_PROGRAMS,
  LIST_UG_COURSES, LIST_PG_COURSES, LIST_ELIGIBILITY_ENTRIES,
  LIST_ADMISSION_STEPS, LIST_IMPORTANT_DATES, GET_PROSPECTUS,
  LIST_FEE_DOCUMENTS, LIST_SCHOLARSHIPS, LIST_AUDIT_STATEMENTS,
  LIST_ADMISSIONS_ENQUIRIES, LIST_ADMISSIONS_CONTACTS,
  GET_WHY_ENQUIRE, LIST_ENQUIRY_CATEGORIES, LIST_INFO_BLOCKS,
} from '../graphql/admissions.query'
import {
  SAVE_ADMISSIONS_OVERVIEW, SAVE_PROSPECTUS, DELETE_PROSPECTUS, SAVE_WHY_ENQUIRE,
  CREATE_ADMISSIONS_PROGRAM, UPDATE_ADMISSIONS_PROGRAM, DELETE_ADMISSIONS_PROGRAM,
  CREATE_UG_COURSE, UPDATE_UG_COURSE, DELETE_UG_COURSE,
  CREATE_PG_COURSE, UPDATE_PG_COURSE, DELETE_PG_COURSE,
  CREATE_ELIGIBILITY_ENTRY, UPDATE_ELIGIBILITY_ENTRY, DELETE_ELIGIBILITY_ENTRY,
  CREATE_ADMISSION_STEP, UPDATE_ADMISSION_STEP, DELETE_ADMISSION_STEP, REORDER_ADMISSION_STEPS,
  CREATE_IMPORTANT_DATE, UPDATE_IMPORTANT_DATE, DELETE_IMPORTANT_DATE,
  CREATE_FEE_DOCUMENT, UPDATE_FEE_DOCUMENT, DELETE_FEE_DOCUMENT,
  CREATE_SCHOLARSHIP, UPDATE_SCHOLARSHIP, DELETE_SCHOLARSHIP,
  CREATE_AUDIT_STATEMENT, DELETE_AUDIT_STATEMENT,
  CREATE_ENQUIRY_CATEGORY, UPDATE_ENQUIRY_CATEGORY, DELETE_ENQUIRY_CATEGORY,
  CREATE_INFO_BLOCK, UPDATE_INFO_BLOCK, DELETE_INFO_BLOCK,
  UPDATE_ENQUIRY_STATUS, UPDATE_ADMISSIONS_CONTACT,
} from '../graphql/admissions.mutation'

// ─── Enum converters ──────────────────────────────────────────────────────────

const ENQUIRY_STATUS_FROM: Record<string, AdmissionsEnquiry['status']> = {
  NEW: 'New', CONTACTED: 'Contacted', CLOSED: 'Closed',
}
const ENQUIRY_STATUS_TO: Record<AdmissionsEnquiry['status'], string> = {
  New: 'NEW', Contacted: 'CONTACTED', Closed: 'CLOSED',
}

const SCHOLARSHIP_TYPE_FROM: Record<string, Scholarship['category']> = {
  STATE: 'State', GOVERNMENT_OF_INDIA: 'Government of India',
  INSTITUTIONAL: 'Institutional', OTHERS: 'Others',
}
const SCHOLARSHIP_TYPE_TO: Record<Scholarship['category'], string> = {
  'State': 'STATE', 'Government of India': 'GOVERNMENT_OF_INDIA',
  'Institutional': 'INSTITUTIONAL', 'Others': 'OTHERS',
}

const INFO_BLOCK_TYPE_FROM: Record<string, InfoBlock['type']> = {
  PHONE: 'Phone', OFFICE_HOURS: 'Office Hours', EMAIL: 'Email',
}
const INFO_BLOCK_TYPE_TO: Record<InfoBlock['type'], string> = {
  Phone: 'PHONE', 'Office Hours': 'OFFICE_HOURS', Email: 'EMAIL',
}

// ─── Mappers (backend shape → frontend shape) ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOverview(r: any): AdmissionsOverview {
  return {
    headline:    r?.headline    ?? '',
    subheadline: r?.subheadline ?? '',
    description: r?.description ?? '',
    highlights:  r?.highlights  ?? [],
    imageUrl:    r?.imageUrl    ?? '',
    bannerUrl:   r?.bannerUrl   ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProgram(r: any): AdmissionsProgram {
  return {
    id:          r.programId,
    level:       r.level,
    name:        r.name,
    duration:    r.duration    ?? '',
    seats:       r.seats       ?? 0,
    description: r.description ?? '',
    eligibility: r.eligibility ?? '',
    order:       r.order       ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUGCourse(r: any): UGCourse {
  return {
    id:          r.courseId,
    name:        r.name,
    code:        r.code        ?? '',
    duration:    r.duration    ?? '',
    seats:       r.seats       ?? 0,
    description: r.description ?? '',
    order:       r.order       ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPGCourse(r: any): PGCourse {
  return {
    id:          r.courseId,
    name:        r.name,
    code:        r.code        ?? '',
    duration:    r.duration    ?? '',
    seats:       r.seats       ?? 0,
    description: r.description ?? '',
    order:       r.order       ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEligibilityEntry(r: any): EligibilityEntry {
  return { id: r.entryId, title: r.title, description: r.description ?? '', order: r.order ?? 0 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStep(r: any): AdmissionStep {
  return { id: r.stepId, title: r.title, description: r.description ?? '', iconName: r.iconName ?? '', order: r.order }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDate(r: any): ImportantDate {
  return {
    id:          r.dateId,
    title:       r.event,   // backend field is 'event'
    date:        r.date,
    description: r.description ?? '',
    category:    r.category    ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProspectus(r: any): Prospectus {
  return {
    title:       r.title       ?? '',
    description: r.description ?? '',
    fileUrl:     r.fileUrl,
    fileName:    r.fileName    ?? '',
    uploadedAt:  r.uploadedAt  ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFeeDoc(r: any): FeeDocument {
  return {
    id:         r.feeDocId,
    title:      r.title,
    fileUrl:    r.fileUrl,
    fileName:   r.fileName    ?? '',
    uploadedAt: r.uploadedAt  ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScholarship(r: any): Scholarship {
  return {
    id:          r.scholarshipId,
    category:    SCHOLARSHIP_TYPE_FROM[r.type] ?? 'Others',
    name:        r.name,
    description: r.description ?? '',
    amount:      r.amount      ?? '',
    eligibility: r.eligibility ?? '',
    order:       r.order       ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAudit(r: any): AuditStatement {
  return {
    id:         r.auditId,
    year:       r.year,
    title:      r.title    ?? '',
    fileUrl:    r.fileUrl,
    fileName:   r.fileName ?? '',
    uploadedAt: r.createdAt ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEnquiry(r: any): AdmissionsEnquiry {
  return {
    id:        r.enquiryId,
    name:      r.name,
    email:     r.email,
    phone:     r.phone    ?? '',
    category:  r.program  ?? '',   // backend field is 'program'
    message:   r.message  ?? '',
    status:    ENQUIRY_STATUS_FROM[r.status] ?? 'New',
    createdAt: r.createdAt ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContact(r: any): AdmissionsContact {
  return {
    id:             r.contactId,
    name:           r.name           ?? '',
    role:           r.role,
    email:          r.email          ?? '',
    phone:          r.phone          ?? '',
    officeLocation: r.officeLocation ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWhyEnquire(r: any): WhyEnquire {
  return { title: r?.title ?? '', points: r?.points ?? [] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEnquiryCategory(r: any): EnquiryCategory {
  return { id: r.categoryId, title: r.title, description: r.description ?? '' }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInfoBlock(r: any): InfoBlock {
  return { id: r.blockId, type: INFO_BLOCK_TYPE_FROM[r.type] ?? 'Phone', description: r.description }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const admissionsService = {
  // Overview
  async getOverview(): Promise<AdmissionsOverview> {
    const d = await gqlRequest<{ getAdmissionsOverview: unknown }>(GET_ADMISSIONS_OVERVIEW)
    return mapOverview(d.getAdmissionsOverview)
  },
  async saveOverview(input: AdmissionsOverview): Promise<AdmissionsOverview> {
    const d = await gqlRequest<{ saveAdmissionsOverview: unknown }>(SAVE_ADMISSIONS_OVERVIEW, { input })
    return mapOverview(d.saveAdmissionsOverview)
  },

  // Programs
  async getPrograms(level?: string): Promise<AdmissionsProgram[]> {
    const d = await gqlRequest<{ listAdmissionsPrograms: unknown[] }>(LIST_ADMISSIONS_PROGRAMS, { level })
    return (d.listAdmissionsPrograms ?? []).map(mapProgram)
  },
  async createProgram(input: Omit<AdmissionsProgram, 'id'>): Promise<AdmissionsProgram> {
    const d = await gqlRequest<{ createAdmissionsProgram: unknown }>(CREATE_ADMISSIONS_PROGRAM, { input })
    return mapProgram(d.createAdmissionsProgram)
  },
  async updateProgram(id: string, data: Partial<AdmissionsProgram>): Promise<AdmissionsProgram> {
    const d = await gqlRequest<{ updateAdmissionsProgram: unknown }>(UPDATE_ADMISSIONS_PROGRAM, {
      input: { programId: id, ...data },
    })
    return mapProgram(d.updateAdmissionsProgram)
  },
  async deleteProgram(id: string): Promise<void> {
    await gqlRequest(DELETE_ADMISSIONS_PROGRAM, { programId: id })
  },

  // UG Courses
  async getUGCourses(): Promise<UGCourse[]> {
    const d = await gqlRequest<{ listUGCourses: unknown[] }>(LIST_UG_COURSES)
    return (d.listUGCourses ?? []).map(mapUGCourse)
  },
  async createUGCourse(input: Omit<UGCourse, 'id'>): Promise<UGCourse> {
    const d = await gqlRequest<{ createUGCourse: unknown }>(CREATE_UG_COURSE, { input })
    return mapUGCourse(d.createUGCourse)
  },
  async updateUGCourse(id: string, data: Partial<UGCourse>): Promise<UGCourse> {
    const d = await gqlRequest<{ updateUGCourse: unknown }>(UPDATE_UG_COURSE, {
      input: { courseId: id, ...data },
    })
    return mapUGCourse(d.updateUGCourse)
  },
  async deleteUGCourse(id: string): Promise<void> {
    await gqlRequest(DELETE_UG_COURSE, { courseId: id })
  },

  // PG Courses
  async getPGCourses(): Promise<PGCourse[]> {
    const d = await gqlRequest<{ listPGCourses: unknown[] }>(LIST_PG_COURSES)
    return (d.listPGCourses ?? []).map(mapPGCourse)
  },
  async createPGCourse(input: Omit<PGCourse, 'id'>): Promise<PGCourse> {
    const d = await gqlRequest<{ createPGCourse: unknown }>(CREATE_PG_COURSE, { input })
    return mapPGCourse(d.createPGCourse)
  },
  async updatePGCourse(id: string, data: Partial<PGCourse>): Promise<PGCourse> {
    const d = await gqlRequest<{ updatePGCourse: unknown }>(UPDATE_PG_COURSE, {
      input: { courseId: id, ...data },
    })
    return mapPGCourse(d.updatePGCourse)
  },
  async deletePGCourse(id: string): Promise<void> {
    await gqlRequest(DELETE_PG_COURSE, { courseId: id })
  },

  // Eligibility Entries
  async getEligibilityEntries(): Promise<EligibilityEntry[]> {
    const d = await gqlRequest<{ listEligibilityEntries: unknown[] }>(LIST_ELIGIBILITY_ENTRIES)
    return (d.listEligibilityEntries ?? []).map(mapEligibilityEntry).sort((a, b) => a.order - b.order)
  },
  async createEligibilityEntry(input: Omit<EligibilityEntry, 'id'>): Promise<EligibilityEntry> {
    const d = await gqlRequest<{ createEligibilityEntry: unknown }>(CREATE_ELIGIBILITY_ENTRY, { input })
    return mapEligibilityEntry(d.createEligibilityEntry)
  },
  async updateEligibilityEntry(id: string, data: Partial<EligibilityEntry>): Promise<EligibilityEntry> {
    const d = await gqlRequest<{ updateEligibilityEntry: unknown }>(UPDATE_ELIGIBILITY_ENTRY, {
      input: { entryId: id, ...data },
    })
    return mapEligibilityEntry(d.updateEligibilityEntry)
  },
  async deleteEligibilityEntry(id: string): Promise<void> {
    await gqlRequest(DELETE_ELIGIBILITY_ENTRY, { entryId: id })
  },
  // Reorder is done client-side by updating order field individually via updateEligibilityEntry

  // Steps
  async getSteps(): Promise<AdmissionStep[]> {
    const d = await gqlRequest<{ listAdmissionSteps: unknown[] }>(LIST_ADMISSION_STEPS)
    return (d.listAdmissionSteps ?? []).map(mapStep).sort((a, b) => a.order - b.order)
  },
  async createStep(input: Omit<AdmissionStep, 'id'>): Promise<AdmissionStep> {
    const d = await gqlRequest<{ createAdmissionStep: unknown }>(CREATE_ADMISSION_STEP, { input })
    return mapStep(d.createAdmissionStep)
  },
  async updateStep(id: string, data: Partial<AdmissionStep>): Promise<AdmissionStep> {
    const d = await gqlRequest<{ updateAdmissionStep: unknown }>(UPDATE_ADMISSION_STEP, {
      input: { stepId: id, ...data },
    })
    return mapStep(d.updateAdmissionStep)
  },
  async deleteStep(id: string): Promise<void> {
    await gqlRequest(DELETE_ADMISSION_STEP, { stepId: id })
  },
  async reorderSteps(ids: string[]): Promise<void> {
    await gqlRequest(REORDER_ADMISSION_STEPS, { ids })
  },

  // Important Dates
  async getDates(): Promise<ImportantDate[]> {
    const d = await gqlRequest<{ listImportantDates: unknown[] }>(LIST_IMPORTANT_DATES)
    return (d.listImportantDates ?? []).map(mapDate)
  },
  async createDate(input: Omit<ImportantDate, 'id'>): Promise<ImportantDate> {
    // frontend uses 'title', backend expects 'event'
    const { title, ...rest } = input
    const d = await gqlRequest<{ createImportantDate: unknown }>(CREATE_IMPORTANT_DATE, {
      input: { event: title, ...rest },
    })
    return mapDate(d.createImportantDate)
  },
  async updateDate(id: string, data: Partial<ImportantDate>): Promise<ImportantDate> {
    const { title, ...rest } = data
    const d = await gqlRequest<{ updateImportantDate: unknown }>(UPDATE_IMPORTANT_DATE, {
      input: { dateId: id, ...(title !== undefined ? { event: title } : {}), ...rest },
    })
    return mapDate(d.updateImportantDate)
  },
  async deleteDate(id: string): Promise<void> {
    await gqlRequest(DELETE_IMPORTANT_DATE, { dateId: id })
  },

  // Prospectus
  async getProspectus(): Promise<Prospectus | null> {
    try {
      const d = await gqlRequest<{ getProspectus: unknown }>(GET_PROSPECTUS)
      return d.getProspectus ? mapProspectus(d.getProspectus) : null
    } catch {
      return null
    }
  },
  async saveProspectus(data: { title: string; description: string; fileBase64: string; fileName: string }): Promise<Prospectus> {
    const d = await gqlRequest<{ saveProspectus: unknown }>(SAVE_PROSPECTUS, { input: data })
    return mapProspectus(d.saveProspectus)
  },
  async deleteProspectus(): Promise<void> {
    await gqlRequest(DELETE_PROSPECTUS)
  },

  // Fee Documents
  async getFeeDocuments(): Promise<FeeDocument[]> {
    const d = await gqlRequest<{ listFeeDocuments: unknown[] }>(LIST_FEE_DOCUMENTS)
    return (d.listFeeDocuments ?? []).map(mapFeeDoc)
  },
  async createFeeDocument(data: { title: string; fileBase64: string; fileName: string }): Promise<FeeDocument> {
    const d = await gqlRequest<{ createFeeDocument: unknown }>(CREATE_FEE_DOCUMENT, { input: data })
    return mapFeeDoc(d.createFeeDocument)
  },
  async updateFeeDocument(id: string, data: { title?: string; fileBase64?: string; fileName?: string }): Promise<FeeDocument> {
    const d = await gqlRequest<{ updateFeeDocument: unknown }>(UPDATE_FEE_DOCUMENT, {
      input: { feeDocId: id, ...data },
    })
    return mapFeeDoc(d.updateFeeDocument)
  },
  async deleteFeeDocument(id: string): Promise<void> {
    await gqlRequest(DELETE_FEE_DOCUMENT, { feeDocId: id })
  },

  // Scholarships
  async getScholarships(): Promise<Scholarship[]> {
    const d = await gqlRequest<{ listScholarships: unknown[] }>(LIST_SCHOLARSHIPS)
    return (d.listScholarships ?? []).map(mapScholarship)
  },
  async createScholarship(input: Omit<Scholarship, 'id'>): Promise<Scholarship> {
    const { category, ...rest } = input
    const d = await gqlRequest<{ createScholarship: unknown }>(CREATE_SCHOLARSHIP, {
      input: { type: SCHOLARSHIP_TYPE_TO[category], ...rest },
    })
    return mapScholarship(d.createScholarship)
  },
  async updateScholarship(id: string, data: Partial<Scholarship>): Promise<Scholarship> {
    const { category, ...rest } = data
    const d = await gqlRequest<{ updateScholarship: unknown }>(UPDATE_SCHOLARSHIP, {
      input: { scholarshipId: id, ...(category ? { type: SCHOLARSHIP_TYPE_TO[category] } : {}), ...rest },
    })
    return mapScholarship(d.updateScholarship)
  },
  async deleteScholarship(id: string): Promise<void> {
    await gqlRequest(DELETE_SCHOLARSHIP, { scholarshipId: id })
  },

  // Audit Statements
  async getAuditStatements(): Promise<AuditStatement[]> {
    const d = await gqlRequest<{ listAuditStatements: unknown[] }>(LIST_AUDIT_STATEMENTS)
    return (d.listAuditStatements ?? []).map(mapAudit).sort((a, b) => b.year.localeCompare(a.year))
  },
  async createAuditStatement(data: { year: string; title: string; fileBase64: string; fileName: string }): Promise<AuditStatement> {
    const d = await gqlRequest<{ createAuditStatement: unknown }>(CREATE_AUDIT_STATEMENT, { input: data })
    return mapAudit(d.createAuditStatement)
  },
  async deleteAuditStatement(id: string): Promise<void> {
    await gqlRequest(DELETE_AUDIT_STATEMENT, { auditId: id })
  },

  // Enquiries
  async getEnquiries(status?: string): Promise<AdmissionsEnquiry[]> {
    const d = await gqlRequest<{ listAdmissionsEnquiries: unknown[] }>(LIST_ADMISSIONS_ENQUIRIES, { status })
    return (d.listAdmissionsEnquiries ?? []).map(mapEnquiry)
  },
  async updateEnquiryStatus(id: string, status: AdmissionsEnquiry['status']): Promise<void> {
    await gqlRequest(UPDATE_ENQUIRY_STATUS, { enquiryId: id, status: ENQUIRY_STATUS_TO[status] })
  },

  // Contacts
  async getContacts(): Promise<AdmissionsContact[]> {
    const d = await gqlRequest<{ listAdmissionsContacts: unknown[] }>(LIST_ADMISSIONS_CONTACTS)
    return (d.listAdmissionsContacts ?? []).map(mapContact)
  },
  async updateContact(id: string, data: Partial<AdmissionsContact>): Promise<AdmissionsContact> {
    const { id: _id, role: _role, ...input } = data
    const d = await gqlRequest<{ updateAdmissionsContact: unknown }>(UPDATE_ADMISSIONS_CONTACT, {
      contactId: id, input,
    })
    return mapContact(d.updateAdmissionsContact)
  },

  // Why Enquire
  async getWhyEnquire(): Promise<WhyEnquire> {
    const d = await gqlRequest<{ getWhyEnquire: unknown }>(GET_WHY_ENQUIRE)
    return mapWhyEnquire(d.getWhyEnquire)
  },
  async saveWhyEnquire(input: WhyEnquire): Promise<WhyEnquire> {
    const d = await gqlRequest<{ saveWhyEnquire: unknown }>(SAVE_WHY_ENQUIRE, { input })
    return mapWhyEnquire(d.saveWhyEnquire)
  },

  // Enquiry Categories
  async getEnquiryCategories(): Promise<EnquiryCategory[]> {
    const d = await gqlRequest<{ listEnquiryCategories: unknown[] }>(LIST_ENQUIRY_CATEGORIES)
    return (d.listEnquiryCategories ?? []).map(mapEnquiryCategory)
  },
  async createEnquiryCategory(input: Omit<EnquiryCategory, 'id'>): Promise<EnquiryCategory> {
    const d = await gqlRequest<{ createEnquiryCategory: unknown }>(CREATE_ENQUIRY_CATEGORY, { input })
    return mapEnquiryCategory(d.createEnquiryCategory)
  },
  async updateEnquiryCategory(id: string, data: Partial<EnquiryCategory>): Promise<EnquiryCategory> {
    const d = await gqlRequest<{ updateEnquiryCategory: unknown }>(UPDATE_ENQUIRY_CATEGORY, {
      input: { categoryId: id, ...data },
    })
    return mapEnquiryCategory(d.updateEnquiryCategory)
  },
  async deleteEnquiryCategory(id: string): Promise<void> {
    await gqlRequest(DELETE_ENQUIRY_CATEGORY, { categoryId: id })
  },

  // Info Blocks
  async getInfoBlocks(): Promise<InfoBlock[]> {
    const d = await gqlRequest<{ listInfoBlocks: unknown[] }>(LIST_INFO_BLOCKS)
    return (d.listInfoBlocks ?? []).map(mapInfoBlock)
  },
  async createInfoBlock(input: Omit<InfoBlock, 'id'>): Promise<InfoBlock> {
    const d = await gqlRequest<{ createInfoBlock: unknown }>(CREATE_INFO_BLOCK, {
      input: { type: INFO_BLOCK_TYPE_TO[input.type], description: input.description },
    })
    return mapInfoBlock(d.createInfoBlock)
  },
  async updateInfoBlock(id: string, data: Partial<InfoBlock>): Promise<InfoBlock> {
    const d = await gqlRequest<{ updateInfoBlock: unknown }>(UPDATE_INFO_BLOCK, {
      input: { blockId: id, ...(data.type ? { type: INFO_BLOCK_TYPE_TO[data.type] } : {}), description: data.description },
    })
    return mapInfoBlock(d.updateInfoBlock)
  },
  async deleteInfoBlock(id: string): Promise<void> {
    await gqlRequest(DELETE_INFO_BLOCK, { blockId: id })
  },
}
