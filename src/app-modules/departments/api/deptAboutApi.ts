import { gqlRequest } from '@/api/graphqlClient'
import type { DeptIntroduction, DeptAbout, SWOTAnalysis, ProgramOutcome, HODProfile, DistinguishedAlumnus } from '@/shared/types/models'
import {
  GET_DEPT_INTRODUCTION,
  GET_DEPT_ABOUT,
  GET_DEPT_SWOT,
  GET_HOD_PROFILE,
  LIST_PROGRAM_OUTCOMES,
} from '../graphql/deptInfo.query'
import {
  SAVE_DEPT_INTRODUCTION,
  SAVE_DEPT_ABOUT,
  SAVE_DEPT_SWOT,
  SAVE_HOD_PROFILE,
  CREATE_PROGRAM_OUTCOME,
  UPDATE_PROGRAM_OUTCOME,
  DELETE_PROGRAM_OUTCOME,
  REORDER_PROGRAM_OUTCOMES,
} from '../graphql/deptInfo.mutation'
import { LIST_ALUMNI } from '@/app-modules/alumni/graphql/alumni.query'
import { CREATE_ALUMNI, UPDATE_ALUMNI, DELETE_ALUMNI } from '@/app-modules/alumni/graphql/alumni.mutation'

// ── Response shape helpers ────────────────────────────────────────────────────

interface BackendProgramOutcome {
  programOutcomeId: string
  deptId: string
  type: 'PEO' | 'PSO'
  statement: string
  order: number
}

function mapDistinguishedAlumnus(raw: Record<string, unknown>): DistinguishedAlumnus {
  return {
    id:           raw.alumniId as string,
    deptId:       (raw.deptId ?? raw.department) as string,
    name:         (raw.name as string) ?? '',
    batch:        (raw.batch as string) ?? '',
    currentRole:  (raw.designation as string) ?? '',
    organization: (raw.company as string) ?? '',
    achievement:  (raw.location as string) ?? '',
    imageUrl:     raw.image as string | undefined,
    linkedin:     raw.linkedin as string | undefined,
  }
}

function mapProgramOutcome(item: BackendProgramOutcome): ProgramOutcome {
  return {
    id: item.programOutcomeId,
    deptId: item.deptId,
    type: item.type,
    statement: item.statement,
    order: item.order,
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const deptAboutService = {
  // ── Introduction ──────────────────────────────────────────────────────────
  async getIntroduction(deptId: string): Promise<DeptIntroduction> {
    const data = await gqlRequest<{ getDeptIntroduction: Record<string, unknown> | null }>(
      GET_DEPT_INTRODUCTION,
      { deptId },
    )
    const raw = data.getDeptIntroduction
    if (!raw) return { deptId, department_name: '', logo: '', image: '', description: '' }
    return {
      deptId:           raw.deptId as string,
      department_name:  (raw.departmentName as string) ?? '',
      logo:             (raw.logoUrl as string) ?? '',
      image:            (raw.imageUrl as string) ?? '',
      description:      (raw.description as string) ?? '',
    }
  },

  async saveIntroduction(
    deptId: string,
    input: Omit<DeptIntroduction, 'deptId'>,
  ): Promise<DeptIntroduction> {
    const data = await gqlRequest<{ saveDeptIntroduction: Record<string, unknown> }>(
      SAVE_DEPT_INTRODUCTION,
      {
        deptId,
        input: {
          departmentName: input.department_name,
          logoUrl:        input.logo,
          imageUrl:       input.image,
          description:    input.description,
        },
      },
    )
    const raw = data.saveDeptIntroduction
    return {
      deptId:          raw.deptId as string,
      department_name: (raw.departmentName as string) ?? '',
      logo:            (raw.logoUrl as string) ?? '',
      image:           (raw.imageUrl as string) ?? '',
      description:     (raw.description as string) ?? '',
    }
  },

  // ── Vision & Mission ──────────────────────────────────────────────────────
  async getAbout(deptId: string): Promise<DeptAbout> {
    const data = await gqlRequest<{ getDeptAbout: DeptAbout | null }>(
      GET_DEPT_ABOUT,
      { deptId },
    )
    return data.getDeptAbout ?? { deptId, vision: '', mission: '', updatedAt: '' }
  },

  async saveAbout(
    deptId: string,
    input: Pick<DeptAbout, 'vision' | 'mission'>,
  ): Promise<DeptAbout> {
    const data = await gqlRequest<{ saveDeptAbout: DeptAbout }>(
      SAVE_DEPT_ABOUT,
      { deptId, input },
    )
    return data.saveDeptAbout
  },

  // ── SWOT ──────────────────────────────────────────────────────────────────
  async getSWOT(deptId: string): Promise<SWOTAnalysis> {
    const data = await gqlRequest<{ getDeptSwot: SWOTAnalysis | null }>(
      GET_DEPT_SWOT,
      { deptId },
    )
    return data.getDeptSwot ?? {
      deptId, strengths: [], weaknesses: [], opportunities: [], threats: [],
    }
  },

  async saveSWOT(
    deptId: string,
    input: Omit<SWOTAnalysis, 'deptId'>,
  ): Promise<SWOTAnalysis> {
    const data = await gqlRequest<{ saveDeptSwot: SWOTAnalysis }>(
      SAVE_DEPT_SWOT,
      { deptId, input },
    )
    return data.saveDeptSwot
  },

  // ── Program Outcomes (PEOs & PSOs) ────────────────────────────────────────
  async getProgramOutcomes(deptId: string, type?: 'PEO' | 'PSO'): Promise<ProgramOutcome[]> {
    const data = await gqlRequest<{
      listProgramOutcomes: { items: BackendProgramOutcome[]; nextToken: string | null }
    }>(LIST_PROGRAM_OUTCOMES, { deptId, type: type ?? null })
    return (data.listProgramOutcomes.items ?? [])
      .map(mapProgramOutcome)
      .sort((a, b) => a.order - b.order)
  },

  async createProgramOutcome(
    input: Omit<ProgramOutcome, 'id'>,
  ): Promise<ProgramOutcome> {
    const data = await gqlRequest<{ createProgramOutcome: BackendProgramOutcome }>(
      CREATE_PROGRAM_OUTCOME,
      { input: { deptId: input.deptId, type: input.type, statement: input.statement, order: input.order } },
    )
    return mapProgramOutcome(data.createProgramOutcome)
  },

  async updateProgramOutcome(
    id: string,
    fields: Partial<Omit<ProgramOutcome, 'id' | 'deptId'>>,
  ): Promise<ProgramOutcome> {
    const data = await gqlRequest<{ updateProgramOutcome: BackendProgramOutcome }>(
      UPDATE_PROGRAM_OUTCOME,
      { input: { programOutcomeId: id, ...fields } },
    )
    return mapProgramOutcome(data.updateProgramOutcome)
  },

  async deleteProgramOutcome(id: string): Promise<void> {
    await gqlRequest(DELETE_PROGRAM_OUTCOME, { programOutcomeId: id })
  },

  async reorderProgramOutcomes(
    deptId: string,
    type: 'PEO' | 'PSO',
    orderedIds: string[],
  ): Promise<void> {
    await gqlRequest(REORDER_PROGRAM_OUTCOMES, {
      input: { deptId, type, orderedIds },
    })
  },

  // ── HOD Profile ───────────────────────────────────────────────────────────
  async getHOD(deptId: string): Promise<HODProfile> {
    const data = await gqlRequest<{ getHodProfile: HODProfile | null }>(
      GET_HOD_PROFILE,
      { deptId },
    )
    return data.getHodProfile ?? {
      deptId, name: '', title: '', designation: 'Head of Department',
      qualification: '', experience: '', specialization: '',
      message: '', profileSummary: '', email: '', phone: '', imageUrl: '', cvUrl: '',
    }
  },

  async saveHOD(
    deptId: string,
    input: Omit<HODProfile, 'deptId'>,
  ): Promise<HODProfile> {
    const data = await gqlRequest<{ saveHodProfile: HODProfile }>(
      SAVE_HOD_PROFILE,
      { deptId, input },
    )
    return data.saveHodProfile
  },

  // ── Distinguished Alumni ──────────────────────────────────────────────────
  async getAlumni(deptId: string): Promise<DistinguishedAlumnus[]> {
    const data = await gqlRequest<{ listAlumni: { items: Record<string, unknown>[] } }>(
      LIST_ALUMNI, { deptId }
    )
    const items = data.listAlumni?.items ?? []
    console.log('[deptAboutService.getAlumni] raw items sample:', items.slice(0, 3).map(r => ({ alumniId: r.alumniId, department: r.department, deptId: r.deptId })))
    return items.map(mapDistinguishedAlumnus)
  },

  async createAlumnus(input: Omit<DistinguishedAlumnus, 'id'>): Promise<DistinguishedAlumnus> {
    const data = await gqlRequest<{ createAlumni: Record<string, unknown> }>(
      CREATE_ALUMNI, {
        input: {
          deptId:      input.deptId,
          name:        input.name,
          batch:       input.batch,
          designation: input.currentRole  || undefined,
          company:     input.organization || undefined,
          location:    input.achievement  || undefined,
          image:       input.imageUrl     || undefined,
          linkedin:    input.linkedin     || undefined,
        },
      }
    )
    return mapDistinguishedAlumnus(data.createAlumni)
  },

  async updateAlumnus(id: string, fields: Partial<Omit<DistinguishedAlumnus, 'id' | 'deptId'>>): Promise<DistinguishedAlumnus> {
    const data = await gqlRequest<{ updateAlumni: Record<string, unknown> }>(
      UPDATE_ALUMNI, {
        input: {
          alumniId:    id,
          name:        fields.name,
          batch:       fields.batch,
          designation: fields.currentRole  || undefined,
          company:     fields.organization || undefined,
          location:    fields.achievement  || undefined,
          image:       fields.imageUrl     || undefined,
          linkedin:    fields.linkedin     || undefined,
        },
      }
    )
    return mapDistinguishedAlumnus(data.updateAlumni)
  },

  async deleteAlumnus(id: string): Promise<void> {
    await gqlRequest(DELETE_ALUMNI, { alumniId: id })
  },
}
