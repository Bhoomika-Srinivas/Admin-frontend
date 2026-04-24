export const LIST_FEATURE_FLAGS = `
  query ListFeatureFlags($collegeId: ID!) {
    listFeatureFlags(collegeId: $collegeId) {
      collegeId
      feature
      enabled
      updatedAt
    }
  }
`
