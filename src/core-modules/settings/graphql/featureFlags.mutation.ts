export const SET_FEATURE_FLAG = `
  mutation SetFeatureFlag($collegeId: ID!, $feature: String!, $enabled: Boolean!) {
    setFeatureFlag(collegeId: $collegeId, feature: $feature, enabled: $enabled) {
      collegeId
      feature
      enabled
      updatedAt
    }
  }
`
