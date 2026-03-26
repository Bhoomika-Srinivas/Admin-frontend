import type { AdminProgram, AdminProgramDept, AdminBatch, AdminCourse, CourseMaterial, TimetableSection, TimetableSlot, User } from '@/shared/types/models'
import { programs } from '@/data/coursesData'
import { auditService } from '@/core-modules/audit/api/auditApi'

// ── ID generator ──────────────────────────────────────────────────────────────

let seq = 1
const uid = () => `ac-${seq++}`

// ── Seed from coursesData ─────────────────────────────────────────────────────

const programStore: AdminProgram[] = programs.map(p => ({
  id:           p.id,
  name:         p.name,
  fullName:     p.fullName,
  duration:     p.duration,
  maxSemesters: p.maxSemesters,
}))

const deptStore: AdminProgramDept[] = programs.flatMap(p =>
  p.departments.map(d => ({
    id:        `${p.id}-${d.id}`,
    programId: p.id,
    name:      d.name,
    shortName: d.shortName,
  }))
)

// Seed batches: one record per (program × dept × batchYear)
const batchStore: AdminBatch[] = programs.flatMap(p =>
  p.departments.flatMap(d =>
    p.batches.map(b => ({
      id:           `${p.id}-${d.id}-${b}`,
      programId:    p.id,
      departmentId: d.id,
      batchYear:    b,
    }))
  )
)

const courseStore: AdminCourse[] = []

// ── Generic CRUD factory ──────────────────────────────────────────────────────

function makeStore<T extends { id: string }>(store: T[], entity: string) {
  return {
    items: store,
    create(data: Omit<T, 'id'>, actor: User): T {
      const item = { ...data, id: uid() } as T
      store.push(item)
      auditService.log(actor.id, actor.name, `${entity} Created`, 'Course Catalog', item.id)
      return item
    },
    update(id: string, data: Partial<T>, actor: User): T | null {
      const idx = store.findIndex(i => i.id === id)
      if (idx === -1) return null
      store[idx] = { ...store[idx], ...data }
      auditService.log(actor.id, actor.name, `${entity} Updated`, 'Course Catalog', id)
      return store[idx]
    },
    delete(id: string, actor: User): boolean {
      const idx = store.findIndex(i => i.id === id)
      if (idx === -1) return false
      store.splice(idx, 1)
      auditService.log(actor.id, actor.name, `${entity} Deleted`, 'Course Catalog', id)
      return true
    },
  }
}

// ── Exported services ─────────────────────────────────────────────────────────

export const adminProgramService = {
  ...makeStore(programStore, 'Program'),
  getAll: () => [...programStore],
  getById: (id: string) => programStore.find(p => p.id === id),
}

export const adminDeptService = {
  ...makeStore(deptStore, 'Program Dept'),
  getByProgram: (programId: string) => deptStore.filter(d => d.programId === programId),
  getById: (id: string) => deptStore.find(d => d.id === id),
  /** Find the catalog dept record matching a workspace dept by shortName */
  findByShortName: (programId: string, shortName: string) =>
    deptStore.find(d => d.programId === programId && d.shortName.toLowerCase() === shortName.toLowerCase()),
  /** Get all programs that contain a dept with this shortName */
  getProgramsForShortName: (shortName: string) => {
    const matchingDepts = deptStore.filter(d => d.shortName.toLowerCase() === shortName.toLowerCase())
    return programStore.filter(p => matchingDepts.some(d => d.programId === p.id))
  },
}

export const adminBatchService = {
  ...makeStore(batchStore, 'Batch'),
  getByDept: (programId: string, departmentId: string) =>
    batchStore.filter(b => b.programId === programId && b.departmentId === departmentId),
  existsForDept: (programId: string, departmentId: string, batchYear: string, excludeId?: string) =>
    batchStore.some(b =>
      b.programId === programId &&
      b.departmentId === departmentId &&
      b.batchYear === batchYear &&
      b.id !== excludeId
    ),
}

export const adminCourseService = {
  ...makeStore(courseStore, 'Course'),
  getByCourse: (programId: string, departmentId: string, semesterNumber: number, batchYear: string) =>
    courseStore.filter(
      c =>
        c.programId === programId &&
        c.departmentId === departmentId &&
        c.semesterNumber === semesterNumber &&
        c.batchYear === batchYear
    ),
  countForSemester: (programId: string, departmentId: string, semesterNumber: number) =>
    courseStore.filter(
      c => c.programId === programId && c.departmentId === departmentId && c.semesterNumber === semesterNumber
    ).length,
}

// ── Timetable stores ──────────────────────────────────────────────────────────

const sectionStore: TimetableSection[] = []
const slotStore: TimetableSlot[] = []

export const timetableSectionService = {
  getBySemBatch: (programId: string, departmentId: string, semesterNumber: number, batchYear: string) =>
    sectionStore.filter(s =>
      s.programId === programId && s.departmentId === departmentId &&
      s.semesterNumber === semesterNumber && s.batchYear === batchYear
    ),
  countForSemester: (programId: string, departmentId: string, semesterNumber: number) =>
    sectionStore.filter(s =>
      s.programId === programId && s.departmentId === departmentId && s.semesterNumber === semesterNumber
    ).length,
  existsForBatch: (programId: string, deptId: string, sem: number, batch: string, name: string, excludeId?: string) =>
    sectionStore.some(s =>
      s.programId === programId && s.departmentId === deptId &&
      s.semesterNumber === sem && s.batchYear === batch &&
      s.name.toLowerCase() === name.toLowerCase() && s.id !== excludeId
    ),
  create(data: Omit<TimetableSection, 'id'>, actor: User): TimetableSection {
    const item: TimetableSection = { ...data, id: uid() }
    sectionStore.push(item)
    auditService.log(actor.id, actor.name, 'Section Created', 'Timetable', item.id)
    return item
  },
  delete(id: string, actor: User): boolean {
    const idx = sectionStore.findIndex(s => s.id === id)
    if (idx === -1) return false
    sectionStore.splice(idx, 1)
    // cascade-delete all slots for this section
    const toDelete = slotStore.filter(s => s.sectionId === id).map(s => s.id)
    toDelete.forEach(sid => {
      const i = slotStore.findIndex(s => s.id === sid)
      if (i !== -1) slotStore.splice(i, 1)
    })
    auditService.log(actor.id, actor.name, 'Section Deleted', 'Timetable', id)
    return true
  },
}

export const timetableSlotService = {
  getBySection: (sectionId: string) => slotStore.filter(s => s.sectionId === sectionId),
  countBySection: (sectionId: string) => slotStore.filter(s => s.sectionId === sectionId).length,
  hasConflict: (sectionId: string, day: string, period: number, excludeId?: string) =>
    slotStore.some(s => s.sectionId === sectionId && s.day === day && s.period === period && s.id !== excludeId),
  create(data: Omit<TimetableSlot, 'id'>, actor: User): TimetableSlot {
    const item: TimetableSlot = { ...data, id: uid() }
    slotStore.push(item)
    auditService.log(actor.id, actor.name, 'Slot Created', 'Timetable', item.id)
    return item
  },
  update(id: string, data: Partial<Omit<TimetableSlot, 'id' | 'sectionId'>>, actor: User): TimetableSlot | null {
    const idx = slotStore.findIndex(s => s.id === id)
    if (idx === -1) return null
    slotStore[idx] = { ...slotStore[idx], ...data }
    auditService.log(actor.id, actor.name, 'Slot Updated', 'Timetable', id)
    return slotStore[idx]
  },
  delete(id: string, actor: User): boolean {
    const idx = slotStore.findIndex(s => s.id === id)
    if (idx === -1) return false
    slotStore.splice(idx, 1)
    auditService.log(actor.id, actor.name, 'Slot Deleted', 'Timetable', id)
    return true
  },
}

// ── Course Materials store ────────────────────────────────────────────────────

const materialStore: CourseMaterial[] = []

export const courseMaterialService = {
  getByCourse: (courseId: string) => materialStore.filter(m => m.courseId === courseId),
  countByCourse: (courseId: string) => materialStore.filter(m => m.courseId === courseId).length,
  countForSemester: (programId: string, departmentId: string, semesterNumber: number) =>
    materialStore.filter(m => m.programId === programId && m.departmentId === departmentId && m.semesterNumber === semesterNumber).length,
  countForBatch: (programId: string, departmentId: string, semesterNumber: number, batchYear: string) =>
    materialStore.filter(m => m.programId === programId && m.departmentId === departmentId && m.semesterNumber === semesterNumber && m.batchYear === batchYear).length,
  create(data: Omit<CourseMaterial, 'id'>, actor: User): CourseMaterial {
    const item: CourseMaterial = { ...data, id: uid() }
    materialStore.push(item)
    auditService.log(actor.id, actor.name, 'Material Uploaded', 'Learning Materials', item.id)
    return item
  },
  update(id: string, data: Partial<Omit<CourseMaterial, 'id'>>, actor: User): CourseMaterial | null {
    const idx = materialStore.findIndex(m => m.id === id)
    if (idx === -1) return null
    materialStore[idx] = { ...materialStore[idx], ...data }
    auditService.log(actor.id, actor.name, 'Material Updated', 'Learning Materials', id)
    return materialStore[idx]
  },
  delete(id: string, actor: User): boolean {
    const idx = materialStore.findIndex(m => m.id === id)
    if (idx === -1) return false
    materialStore.splice(idx, 1)
    auditService.log(actor.id, actor.name, 'Material Deleted', 'Learning Materials', id)
    return true
  },
}
