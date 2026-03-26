import { gqlRequest } from '@/api/graphqlClient'
import type { Faculty } from '@/shared/types/models'
import { GET_FACULTY, LIST_FACULTY, LIST_DESIGNATION_OPTIONS } from '../graphql/faculty.query'
import {
  CREATE_FACULTY, UPDATE_FACULTY, DELETE_FACULTY,
  ADD_PUBLICATION, UPDATE_PUBLICATION, REMOVE_PUBLICATION,
  ADD_EDUCATION, UPDATE_EDUCATION, REMOVE_EDUCATION,
  ADD_WORK_EXPERIENCE, UPDATE_WORK_EXPERIENCE, REMOVE_WORK_EXPERIENCE,
  ADD_RESEARCH_PROJECT, UPDATE_RESEARCH_PROJECT, REMOVE_RESEARCH_PROJECT,
  ADD_COURSE_TEACHING, UPDATE_COURSE_TEACHING, REMOVE_COURSE_TEACHING,
  ADD_HONOR, UPDATE_HONOR, REMOVE_HONOR,
} from '../graphql/faculty.mutation'

// ── GraphQL response → Frontend shape mapper ─────────────────────────────────

function mapFaculty(raw: Record<string, unknown>): Faculty {
  return {
    id:             raw.facultyId as string,
    name:           (raw.name as string) ?? '',
    email:          '',
    designation:    raw.designation as Faculty['designation'],
    deptId:         raw.deptId as string | undefined,
    department:     (raw.department as string) ?? '',
    qualification:  '',
    experience:     0,
    specialization: '',
    status:         (raw.status as Faculty['status']) ?? 'active',
    profileImage:   raw.profileImage as string | undefined,
    cvUrl:          raw.cvUrl as string | undefined,
    order:          raw.order as number | undefined,
    createdAt:      (raw.createdAt as string) ?? new Date().toISOString(),
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const facultyService = {
  async getDesignationOptions(): Promise<string[]> {
    const data = await gqlRequest<{ listDesignationOptions: { items: string[] } }>(LIST_DESIGNATION_OPTIONS)
    return data.listDesignationOptions?.items ?? []
  },

  async getAll(params?: {
    deptId?: string
    designation?: string
    status?: string
    search?: string
  }): Promise<Faculty[]> {
    const vars: Record<string, unknown> = {}
    if (params?.deptId)       vars.deptId       = params.deptId
    if (params?.designation)  vars.designation  = params.designation
    if (params?.status)       vars.status       = params.status
    if (params?.search)       vars.search       = params.search
    const data = await gqlRequest<{ listFaculty: { items: Record<string, unknown>[] } }>(
      LIST_FACULTY, Object.keys(vars).length ? vars : undefined
    )
    return (data.listFaculty?.items ?? []).map(mapFaculty)
  },

  async getById(facultyId: string): Promise<Faculty> {
    const data = await gqlRequest<{ getFaculty: Record<string, unknown> }>(
      GET_FACULTY, { facultyId }
    )
    return mapFaculty(data.getFaculty)
  },

  async create(input: Record<string, unknown>): Promise<Faculty> {
    const data = await gqlRequest<{ createFaculty: Record<string, unknown> }>(
      CREATE_FACULTY, {
        input: {
          name:         input.name,
          designation:  input.designation,
          deptId:       input.deptId,
          department:   input.department || undefined,
          profileImage: input.profileImage || undefined,
          cvUrl:        input.cvUrl || undefined,
          status:       input.status ?? 'active',
          order:        input.order !== undefined ? Number(input.order) : undefined,
          insertMode:   input.insertMode === true ? true : undefined,
        },
      }
    )
    return mapFaculty(data.createFaculty)
  },

  async update(facultyId: string, input: Record<string, unknown>): Promise<Faculty> {
    const data = await gqlRequest<{ updateFaculty: Record<string, unknown> }>(
      UPDATE_FACULTY, {
        input: {
          facultyId,
          name:         input.name,
          designation:  input.designation,
          deptId:       input.deptId,
          department:   input.department || undefined,
          profileImage: input.profileImage || undefined,
          cvUrl:        input.cvUrl || undefined,
          status:       input.status,
          order:        input.order !== undefined ? Number(input.order) : undefined,
          insertMode:   input.insertMode === true ? true : undefined,
        },
      }
    )
    return mapFaculty(data.updateFaculty)
  },

  async delete(facultyId: string): Promise<string> {
    const data = await gqlRequest<{ deleteFaculty: { facultyId: string } }>(
      DELETE_FACULTY, { facultyId }
    )
    return data.deleteFaculty.facultyId
  },

  // ── Sub-entity operations — all pass { input: { facultyId, ...fields } } ────

  async addPublication(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_PUBLICATION, { input: { facultyId, ...input } })
  },
  async updatePublication(facultyId: string, publicationId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_PUBLICATION, { input: { facultyId, publicationId, ...input } })
  },
  async removePublication(facultyId: string, publicationId: string) {
    return gqlRequest(REMOVE_PUBLICATION, { input: { facultyId, publicationId } })
  },

  async addEducation(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_EDUCATION, { input: { facultyId, ...input } })
  },
  async updateEducation(facultyId: string, educationId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_EDUCATION, { input: { facultyId, educationId, ...input } })
  },
  async removeEducation(facultyId: string, educationId: string) {
    return gqlRequest(REMOVE_EDUCATION, { input: { facultyId, educationId } })
  },

  async addWorkExperience(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_WORK_EXPERIENCE, { input: { facultyId, ...input } })
  },
  async updateWorkExperience(facultyId: string, workExperienceId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_WORK_EXPERIENCE, { input: { facultyId, workExperienceId, ...input } })
  },
  async removeWorkExperience(facultyId: string, workExperienceId: string) {
    return gqlRequest(REMOVE_WORK_EXPERIENCE, { input: { facultyId, workExperienceId } })
  },

  async addResearchProject(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_RESEARCH_PROJECT, { input: { facultyId, ...input } })
  },
  async updateResearchProject(facultyId: string, researchProjectId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_RESEARCH_PROJECT, { input: { facultyId, researchProjectId, ...input } })
  },
  async removeResearchProject(facultyId: string, researchProjectId: string) {
    return gqlRequest(REMOVE_RESEARCH_PROJECT, { input: { facultyId, researchProjectId } })
  },

  async addCourseTeaching(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_COURSE_TEACHING, { input: { facultyId, ...input } })
  },
  async updateCourseTeaching(facultyId: string, courseTeachingId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_COURSE_TEACHING, { input: { facultyId, courseTeachingId, ...input } })
  },
  async removeCourseTeaching(facultyId: string, courseTeachingId: string) {
    return gqlRequest(REMOVE_COURSE_TEACHING, { input: { facultyId, courseTeachingId } })
  },

  async addHonor(facultyId: string, input: Record<string, unknown>) {
    return gqlRequest(ADD_HONOR, { input: { facultyId, ...input } })
  },
  async updateHonor(facultyId: string, honorId: string, input: Record<string, unknown>) {
    return gqlRequest(UPDATE_HONOR, { input: { facultyId, honorId, ...input } })
  },
  async removeHonor(facultyId: string, honorId: string) {
    return gqlRequest(REMOVE_HONOR, { input: { facultyId, honorId } })
  },
}
