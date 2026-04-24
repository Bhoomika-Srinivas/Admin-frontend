import { gqlRequest } from '@/api/graphqlClient'
import type { College } from '@/shared/types/models'
import type { CollegeFormData } from '../types'
import { LIST_COLLEGES, GET_COLLEGE } from '../graphql/college.query'
import { CREATE_COLLEGE, UPDATE_COLLEGE, DISABLE_COLLEGE } from '../graphql/college.mutation'

export const collegeService = {
  async getAll(): Promise<College[]> {
    const data = await gqlRequest<{ listColleges: College[] }>(LIST_COLLEGES)
    return data.listColleges ?? []
  },

  async getById(id: string): Promise<College> {
    const data = await gqlRequest<{ getCollege: College }>(GET_COLLEGE, { id })
    return data.getCollege
  },

  async create(input: CollegeFormData): Promise<College> {
    const data = await gqlRequest<{ createCollege: College }>(CREATE_COLLEGE, { input })
    return data.createCollege
  },

  async update(id: string, input: Partial<CollegeFormData>): Promise<College> {
    const data = await gqlRequest<{ updateCollege: College }>(UPDATE_COLLEGE, { id, input })
    return data.updateCollege
  },

  async disable(id: string): Promise<void> {
    await gqlRequest(DISABLE_COLLEGE, { id })
  },
}
