import { gqlRequest } from '@/api/graphqlClient'
import type { DeptBatch, DeptSection, DeptSlot, DeptCourse, DeptTimetable, LearningMaterial, InnovativeTeaching, ResultAnalysis } from '@/shared/types/models'
import {
  LIST_DEPT_SLOTS,
  LIST_DEPT_SECTIONS,
  LIST_DEPT_BATCHES,
  LIST_DEPT_COURSES,
  LIST_DEPT_TIMETABLES,
  LIST_LEARNING_MATERIALS,
  LIST_INNOVATIVE_TEACHING,
  LIST_RESULT_ANALYSES,
} from '../graphql/deptAcademics.query'
import {
  CREATE_DEPT_SLOT,
  UPDATE_DEPT_SLOT,
  DELETE_DEPT_SLOT,
  CREATE_DEPT_SECTION,
  DELETE_DEPT_SECTION,
  CREATE_DEPT_BATCH,
  DELETE_DEPT_BATCH,
  CREATE_DEPT_COURSE,
  UPDATE_DEPT_COURSE,
  DELETE_DEPT_COURSE,
  CREATE_DEPT_TIMETABLE,
  UPDATE_DEPT_TIMETABLE,
  DELETE_DEPT_TIMETABLE,
  CREATE_LEARNING_MATERIAL,
  UPDATE_LEARNING_MATERIAL,
  DELETE_LEARNING_MATERIAL,
  CREATE_INNOVATIVE_TEACHING,
  UPDATE_INNOVATIVE_TEACHING,
  DELETE_INNOVATIVE_TEACHING,
  CREATE_RESULT_ANALYSIS,
  UPDATE_RESULT_ANALYSIS,
  DELETE_RESULT_ANALYSIS,
} from '../graphql/deptAcademics.mutation'

// ── Shape helpers ──────────────────────────────────────────────────────────────

function toSlot(r: Record<string, unknown>): DeptSlot {
  return {
    id:         r.deptSlotId as string,
    deptId:     r.deptId as string,
    sectionId:  r.sectionId as string,
    day:        r.day as DeptSlot['day'],
    period:     r.period as number,
    courseCode: r.courseCode as string,
    courseName: r.courseName as string,
    type:       r.type as DeptSlot['type'],
    facultyId:  r.facultyId as string | undefined,
  }
}

function toSection(r: Record<string, unknown>): DeptSection {
  return {
    id: r.deptSectionId as string,
    deptId: r.deptId as string,
    programId: r.programId as string,
    batchName: r.batchName as string,
    semester: r.semester as number,
    name: r.name as string,
  }
}

function toBatch(r: Record<string, unknown>): DeptBatch {
  return {
    id: r.deptBatchId as string,
    deptId: r.deptId as string,
    programId: r.programId as string,
    name: r.name as string,
    startYear: r.startYear as number | undefined,
    endYear: r.endYear as number | undefined,
  }
}

function toCourse(r: Record<string, unknown>): DeptCourse {
  return {
    id: r.deptCourseId as string,
    deptId: r.deptId as string,
    code: r.code as string,
    name: r.name as string,
    semester: r.semester as number,
    credits: r.credits as number,
    type: r.type as DeptCourse['type'],
    scheme: r.scheme as string,
  }
}

function toTimetable(r: Record<string, unknown>): DeptTimetable {
  return {
    id: r.deptTimetableId as string,
    deptId: r.deptId as string,
    section: r.section as string,
    semester: r.semester as number,
    academicYear: r.academicYear as string,
    fileUrl: (r.fileUrl as string | undefined) ?? undefined,
    uploadedAt: r.uploadedAt as string,
  }
}

function toMaterial(r: Record<string, unknown>): LearningMaterial {
  return {
    id: r.learningMaterialId as string,
    deptId: r.deptId as string,
    courseCode: r.courseCode as string,
    courseName: r.courseName as string,
    title: r.title as string,
    type: r.type as LearningMaterial['type'],
    fileUrl: r.fileUrl as string,
    uploadedBy: r.uploadedBy as string,
    uploadedAt: (r.uploadedAt as string | undefined) ?? '',
  }
}

function toTeaching(r: Record<string, unknown>): InnovativeTeaching {
  return {
    id: r.innovativeTeachingId as string,
    deptId: r.deptId as string,
    facultyName: r.facultyName as string,
    method: r.method as string,
    description: r.description as string,
    courseApplied: r.courseApplied as string,
    year: r.year as string,
    outcome: r.outcome as string,
  }
}

function toResult(r: Record<string, unknown>): ResultAnalysis {
  return {
    id: r.resultAnalysisId as string,
    deptId: r.deptId as string,
    title: r.title as string,
    semester: r.semester as number,
    batch: r.batch as string,
    pdfUrl: (r.pdfUrl as string | undefined) ?? undefined,
    graphImageUrl: (r.graphImageUrl as string | undefined) ?? undefined,
    uploadedAt: (r.uploadedAt as string | undefined) ?? '',
  }
}

// ── DeptSlot service ───────────────────────────────────────────────────────────

export const deptSlotService = {
  async getAll(deptId: string, sectionId: string): Promise<DeptSlot[]> {
    const data = await gqlRequest<{ listDeptSlots: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_SLOTS,
      { deptId, sectionId },
    )
    return (data.listDeptSlots?.items ?? []).map(toSlot)
  },

  async create(input: Omit<DeptSlot, 'id'>): Promise<DeptSlot> {
    const data = await gqlRequest<{ createDeptSlot: Record<string, unknown> | null }>(
      CREATE_DEPT_SLOT,
      { input },
    )
    if (!data.createDeptSlot) throw new Error('Failed to create slot: no data returned')
    return toSlot(data.createDeptSlot)
  },

  async update(id: string, fields: Partial<Omit<DeptSlot, 'id' | 'deptId' | 'sectionId' | 'day' | 'period'>>): Promise<DeptSlot> {
    const data = await gqlRequest<{ updateDeptSlot: Record<string, unknown> | null }>(
      UPDATE_DEPT_SLOT,
      { input: { deptSlotId: id, ...fields } },
    )
    if (!data.updateDeptSlot) throw new Error('Failed to update slot: no data returned')
    return toSlot(data.updateDeptSlot)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_SLOT, { deptSlotId: id })
  },
}

// ── DeptSection service ────────────────────────────────────────────────────────

export const deptSectionService = {
  async getAll(deptId: string, programId: string, semester: number, batchName: string): Promise<DeptSection[]> {
    const data = await gqlRequest<{ listDeptSections: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_SECTIONS,
      { deptId, programId, semester, batchName },
    )
    return (data.listDeptSections?.items ?? []).map(toSection)
  },

  async create(input: Omit<DeptSection, 'id'>): Promise<DeptSection> {
    const data = await gqlRequest<{ createDeptSection: Record<string, unknown> | null }>(
      CREATE_DEPT_SECTION,
      { input },
    )
    if (!data.createDeptSection) throw new Error('Failed to create section: no data returned')
    return toSection(data.createDeptSection)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_SECTION, { deptSectionId: id })
  },
}

// ── DeptBatch service ──────────────────────────────────────────────────────────

export const deptBatchService = {
  async getAll(deptId: string, programId: string): Promise<DeptBatch[]> {
    const data = await gqlRequest<{ listDeptBatches: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_BATCHES,
      { deptId, programId },
    )
    return (data.listDeptBatches?.items ?? []).map(toBatch)
  },

  async create(input: Omit<DeptBatch, 'id'>): Promise<DeptBatch> {
    const data = await gqlRequest<{ createDeptBatch: Record<string, unknown> | null }>(
      CREATE_DEPT_BATCH,
      { input },
    )
    if (!data.createDeptBatch) throw new Error('Failed to create batch: no data returned')
    return toBatch(data.createDeptBatch)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_BATCH, { deptBatchId: id })
  },
}

// ── DeptCourse service ─────────────────────────────────────────────────────────

export const deptCourseService = {
  async getAll(deptId: string): Promise<DeptCourse[]> {
    const data = await gqlRequest<{ listDeptCourses: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_COURSES,
      { deptId },
    )
    return (data.listDeptCourses?.items ?? []).map(toCourse)
  },

  async create(input: Omit<DeptCourse, 'id'>): Promise<DeptCourse> {
    const data = await gqlRequest<{ createDeptCourse: Record<string, unknown> | null }>(
      CREATE_DEPT_COURSE,
      { input },
    )
    if (!data.createDeptCourse) throw new Error('Failed to create course: no data returned')
    return toCourse(data.createDeptCourse)
  },

  async update(id: string, fields: Partial<Omit<DeptCourse, 'id'>>): Promise<DeptCourse> {
    const data = await gqlRequest<{ updateDeptCourse: Record<string, unknown> | null }>(
      UPDATE_DEPT_COURSE,
      { input: { deptCourseId: id, ...fields } },
    )
    if (!data.updateDeptCourse) throw new Error('Failed to update course: no data returned')
    return toCourse(data.updateDeptCourse)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_COURSE, { deptCourseId: id })
  },
}

// ── Timetable service ──────────────────────────────────────────────────────────

export const timetableService = {
  async getAll(deptId: string): Promise<DeptTimetable[]> {
    const data = await gqlRequest<{ listDeptTimetables: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_TIMETABLES,
      { deptId },
    )
    return (data.listDeptTimetables?.items ?? []).map(toTimetable)
  },

  async create(input: Omit<DeptTimetable, 'id'>): Promise<DeptTimetable> {
    const data = await gqlRequest<{ createDeptTimetable: Record<string, unknown> | null }>(
      CREATE_DEPT_TIMETABLE,
      { input },
    )
    if (!data.createDeptTimetable) throw new Error('Failed to create timetable: no data returned')
    return toTimetable(data.createDeptTimetable)
  },

  async update(id: string, fields: Partial<Omit<DeptTimetable, 'id'>>): Promise<DeptTimetable> {
    const data = await gqlRequest<{ updateDeptTimetable: Record<string, unknown> | null }>(
      UPDATE_DEPT_TIMETABLE,
      { input: { deptTimetableId: id, ...fields } },
    )
    if (!data.updateDeptTimetable) throw new Error('Failed to update timetable: no data returned')
    return toTimetable(data.updateDeptTimetable)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_TIMETABLE, { deptTimetableId: id })
  },
}

// ── LearningMaterial service ───────────────────────────────────────────────────

export const learningMaterialService = {
  async getAll(deptId: string, courseCode?: string): Promise<LearningMaterial[]> {
    const data = await gqlRequest<{ listLearningMaterials: { items: Record<string, unknown>[] } }>(
      LIST_LEARNING_MATERIALS,
      { deptId, courseCode },
    )
    return (data.listLearningMaterials?.items ?? []).map(toMaterial)
  },

  async create(input: Omit<LearningMaterial, 'id'>): Promise<LearningMaterial> {
    const { uploadedAt: _ts, courseName: _cn, ...rest } = input
    const data = await gqlRequest<{ createLearningMaterial: Record<string, unknown> | null }>(
      CREATE_LEARNING_MATERIAL,
      { input: rest },
    )
    if (!data.createLearningMaterial) throw new Error('Failed to create material: no data returned')
    return toMaterial(data.createLearningMaterial)
  },

  async update(id: string, fields: Partial<Omit<LearningMaterial, 'id'>>): Promise<LearningMaterial> {
    const { uploadedAt: _ts, courseName: _cn, ...rest } = fields
    const data = await gqlRequest<{ updateLearningMaterial: Record<string, unknown> | null }>(
      UPDATE_LEARNING_MATERIAL,
      { input: { learningMaterialId: id, ...rest } },
    )
    if (!data.updateLearningMaterial) throw new Error('Failed to update material: no data returned')
    return toMaterial(data.updateLearningMaterial)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_LEARNING_MATERIAL, { learningMaterialId: id })
  },
}

// ── InnovativeTeaching service ─────────────────────────────────────────────────

export const innovativeTeachingService = {
  async getAll(deptId: string): Promise<InnovativeTeaching[]> {
    const data = await gqlRequest<{ listInnovativeTeaching: { items: Record<string, unknown>[] } }>(
      LIST_INNOVATIVE_TEACHING,
      { deptId },
    )
    return (data.listInnovativeTeaching?.items ?? []).map(toTeaching)
  },

  async create(input: Omit<InnovativeTeaching, 'id'>): Promise<InnovativeTeaching> {
    const data = await gqlRequest<{ createInnovativeTeaching: Record<string, unknown> | null }>(
      CREATE_INNOVATIVE_TEACHING,
      { input },
    )
    if (!data.createInnovativeTeaching) throw new Error('Failed to create record: no data returned')
    return toTeaching(data.createInnovativeTeaching)
  },

  async update(id: string, fields: Partial<Omit<InnovativeTeaching, 'id'>>): Promise<InnovativeTeaching> {
    const data = await gqlRequest<{ updateInnovativeTeaching: Record<string, unknown> | null }>(
      UPDATE_INNOVATIVE_TEACHING,
      { input: { innovativeTeachingId: id, ...fields } },
    )
    if (!data.updateInnovativeTeaching) throw new Error('Failed to update record: no data returned')
    return toTeaching(data.updateInnovativeTeaching)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_INNOVATIVE_TEACHING, { innovativeTeachingId: id })
  },
}

// ── ResultAnalysis service ─────────────────────────────────────────────────────

export const resultAnalysisService = {
  async getAll(deptId: string): Promise<ResultAnalysis[]> {
    const data = await gqlRequest<{ listResultAnalyses: { items: Record<string, unknown>[] } }>(
      LIST_RESULT_ANALYSES,
      { deptId },
    )
    return (data.listResultAnalyses?.items ?? []).map(toResult)
  },

  async create(input: Omit<ResultAnalysis, 'id'>): Promise<ResultAnalysis> {
    const { uploadedAt: _ts, ...rest } = input
    const data = await gqlRequest<{ createResultAnalysis: Record<string, unknown> | null }>(
      CREATE_RESULT_ANALYSIS,
      { input: rest },
    )
    if (!data.createResultAnalysis) throw new Error('Failed to create result analysis: no data returned')
    return toResult(data.createResultAnalysis)
  },

  async update(id: string, fields: Partial<Omit<ResultAnalysis, 'id'>>): Promise<ResultAnalysis> {
    const { uploadedAt: _ts, ...rest } = fields
    const data = await gqlRequest<{ updateResultAnalysis: Record<string, unknown> | null }>(
      UPDATE_RESULT_ANALYSIS,
      { input: { resultAnalysisId: id, ...rest } },
    )
    if (!data.updateResultAnalysis) throw new Error('Failed to update result analysis: no data returned')
    return toResult(data.updateResultAnalysis)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_RESULT_ANALYSIS, { resultAnalysisId: id })
  },
}
