export const UPSERT_COLLEGE_PROFILE = /* GraphQL */ `
  mutation UpsertCollegeProfile($input: CollegeProfileInput!) {
    upsertCollegeProfile(input: $input) {
      success
      message
    }
  }
`
