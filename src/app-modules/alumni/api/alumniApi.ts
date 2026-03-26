import { gqlRequest } from '@/api/graphqlClient'
import type { Alumni } from '@/shared/types/models'
import { LIST_ALUMNI, GET_ALUMNI } from '../graphql/alumni.query'
import { CREATE_ALUMNI, UPDATE_ALUMNI, DELETE_ALUMNI } from '../graphql/alumni.mutation'

function mapAlumni(raw: Record<string, unknown>): Alumni {
  return {
    id:          raw.alumniId as string,
    name:        (raw.name as string) ?? '',
    batch:       (raw.batch as string) ?? '',
    department:  (raw.department as string) ?? '',
    company:     (raw.company as string) ?? '',
    designation: (raw.designation as string) ?? '',
    location:    (raw.location as string) ?? '',
    email:       raw.email as string | undefined,
    linkedin:    raw.linkedin as string | undefined,
    image:       raw.image as string | undefined,
    createdAt:   (raw.createdAt as string) ?? new Date().toISOString(),
  }
}

export const alumniService = {
  async getAll(params?: {
    search?: string
    batch?: string
  }): Promise<Alumni[]> {
    const vars: Record<string, unknown> = {}
    if (params?.search) vars.search = params.search
    if (params?.batch)  vars.batch  = params.batch
    const data = await gqlRequest<{ listAlumni: { items: Record<string, unknown>[] } }>(
      LIST_ALUMNI, Object.keys(vars).length ? vars : undefined
    )
    return (data.listAlumni?.items ?? []).map(mapAlumni)
  },

  async getById(alumniId: string): Promise<Alumni> {
    const data = await gqlRequest<{ getAlumni: Record<string, unknown> }>(
      GET_ALUMNI, { alumniId }
    )
    return mapAlumni(data.getAlumni)
  },

  async create(input: Record<string, unknown>): Promise<Alumni> {
    const data = await gqlRequest<{ createAlumni: Record<string, unknown> }>(
      CREATE_ALUMNI, {
        input: {
          name:        input.name,
          batch:       input.batch,
          department:  input.department,
          company:     input.company,
          designation: input.designation,
          location:    input.location  || undefined,
          email:       input.email     || undefined,
          linkedin:    input.linkedin  || undefined,
          image:       input.image     || undefined,
        },
      }
    )
    return mapAlumni(data.createAlumni)
  },

  async update(alumniId: string, input: Record<string, unknown>): Promise<Alumni> {
    const data = await gqlRequest<{ updateAlumni: Record<string, unknown> }>(
      UPDATE_ALUMNI, {
        input: {
          alumniId,
          name:        input.name,
          batch:       input.batch,
          department:  input.department,
          company:     input.company,
          designation: input.designation,
          location:    input.location  || undefined,
          email:       input.email     || undefined,
          linkedin:    input.linkedin  || undefined,
          image:       input.image     || undefined,
        },
      }
    )
    return mapAlumni(data.updateAlumni)
  },

  async delete(alumniId: string): Promise<string> {
    const data = await gqlRequest<{ deleteAlumni: { alumniId: string } }>(
      DELETE_ALUMNI, { alumniId }
    )
    return data.deleteAlumni.alumniId
  },
}
