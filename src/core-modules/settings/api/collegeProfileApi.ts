import { gqlRequest } from '@/api/graphqlClient'
import type { CollegeProfile } from '@/shared/types/models'
import type { CollegeProfileFormData } from '../types'
import { GET_COLLEGE_PROFILE } from '../graphql/collegeProfile.query'
import { UPSERT_COLLEGE_PROFILE } from '../graphql/collegeProfile.mutation'

export const collegeProfileService = {
  async get(): Promise<CollegeProfile | null> {
    const data = await gqlRequest<{ getCollegeProfile: CollegeProfile | null }>(GET_COLLEGE_PROFILE)
    return data.getCollegeProfile ?? null
  },

  async upsert(input: CollegeProfileFormData): Promise<void> {
    await gqlRequest<{ upsertCollegeProfile: { success: boolean; message: string } }>(
      UPSERT_COLLEGE_PROFILE,
      { input },
    )
  },
}
