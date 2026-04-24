import { gqlRequest } from '@/api/graphqlClient'
import type { FeatureFlag, FeatureName } from '@/shared/types/models'
import { LIST_FEATURE_FLAGS } from '../graphql/featureFlags.query'
import { SET_FEATURE_FLAG } from '../graphql/featureFlags.mutation'

export const featureFlagsService = {
  async getByCollege(collegeId: string): Promise<FeatureFlag[]> {
    const data = await gqlRequest<{ listFeatureFlags: FeatureFlag[] }>(
      LIST_FEATURE_FLAGS,
      { collegeId }
    )
    return data.listFeatureFlags ?? []
  },

  async setFlag(collegeId: string, feature: FeatureName, enabled: boolean): Promise<FeatureFlag> {
    const data = await gqlRequest<{ setFeatureFlag: FeatureFlag }>(
      SET_FEATURE_FLAG,
      { collegeId, feature, enabled }
    )
    return data.setFeatureFlag
  },
}
