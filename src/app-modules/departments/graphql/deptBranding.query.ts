// src/app-modules/departments/graphql/deptBranding.query.ts

export const GET_DEPT_BRANDING = /* GraphQL */ `
  query GetDeptBranding($deptId: ID!) {
    getDeptBranding(deptId: $deptId) {
      deptId
      departmentTitle
      departmentLogoUrl
      twitterUrl
      linkedinUrl
      youtubeUrl
      emailContact
      mapLocationLink
      fullAddress
      hodPhone
      hodEmail
      departmentPhone
      departmentFax
      departmentEmail
      copyrightText
      websiteCredits
    }
  }
`

export const GET_INSTITUTE_SETTINGS = /* GraphQL */ `
  query GetInstituteSettings {
    getInstituteSettings {
      instituteName
      instituteLogoUrl
      defaultCopyrightText
      defaultWebsiteCredits
    }
  }
`
