export const GET_COLLEGE_PROFILE = /* GraphQL */ `
  query GetCollegeProfile {
    getCollegeProfile {
      tenant_id
      logo_url
      name
      shortName
      established
      affiliatedUniversity
      collegeType
      address
      city
      state
      pincode
      phone
      email
      website
    }
  }
`
