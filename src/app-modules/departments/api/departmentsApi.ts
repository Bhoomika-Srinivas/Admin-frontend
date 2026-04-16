import { gqlRequest } from '@/api/graphqlClient'
import type { Department } from '@/shared/types/models'
import { GET_DEPARTMENT, LIST_DEPARTMENTS } from '../graphql/departments.query'
import { CREATE_DEPARTMENT, UPDATE_DEPARTMENT, DELETE_DEPARTMENT } from '../graphql/departments.mutation'

function mapDepartment(raw: Record<string, unknown>): Department {
  return {
    id:            raw.departmentId as string,
    name:          raw.name as string,
    shortName:     raw.shortName as string,
    hod:           (raw.hod as string) ?? '',
    established:   (raw.established as number) ?? 0,
    totalFaculty:  (raw.totalFaculty as number) ?? 0,
    totalStudents: (raw.totalStudents as number) ?? 0,
    status:        ((raw.status as string) ?? 'active') as Department['status'],
    description:   (raw.description as string) ?? '',
    image:        raw.imageUrl as string | undefined,
    createdAt:    (raw.createdAt as string) ?? new Date().toISOString(),
    programTypes: (raw.programTypes as string[] | undefined) ?? [],
  }
}

export const departmentService = {
  async getAll(tenantId: string): Promise<Department[]> {
    const data = await gqlRequest<{ listDepartments: { items: Record<string, unknown>[] } }>(
      LIST_DEPARTMENTS, { tenantId, limit: 100 }
    )
    return (data.listDepartments.items ?? []).map(mapDepartment)
  },

  async getById(departmentId: string): Promise<Department | null> {
    try {
      const data = await gqlRequest<{ getDepartment: Record<string, unknown> | null }>(
        GET_DEPARTMENT, { departmentId }
      )
      return data.getDepartment ? mapDepartment(data.getDepartment) : null
    } catch {
      return null
    }
  },

  async create(input: Partial<Department>): Promise<Department> {
    const data = await gqlRequest<{ createDepartment: Record<string, unknown> }>(
      CREATE_DEPARTMENT, {
        input: {
          name:        input.name,
          shortName:   input.shortName,
          hod:         input.hod,
          established: input.established,
          description:  input.description,
          imageUrl:     input.image,
          status:       input.status,
          programTypes: input.programTypes,
        },
      }
    )
    return mapDepartment(data.createDepartment)
  },

  async update(departmentId: string, input: Partial<Department>): Promise<Department> {
    const data = await gqlRequest<{ updateDepartment: Record<string, unknown> }>(
      UPDATE_DEPARTMENT, {
        input: {
          departmentId,
          name:          input.name,
          shortName:     input.shortName,
          hod:           input.hod,
          established:   input.established,
          totalFaculty:  input.totalFaculty,
          totalStudents: input.totalStudents,
          description:   input.description,
          imageUrl:      input.image,
          status:        input.status,
          programTypes:  input.programTypes,
        },
      }
    )
    return mapDepartment(data.updateDepartment)
  },

  async delete(departmentId: string): Promise<void> {
    await gqlRequest(DELETE_DEPARTMENT, { departmentId })
  },
}
