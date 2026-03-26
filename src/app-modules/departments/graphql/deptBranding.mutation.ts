// src/app-modules/departments/graphql/deptBranding.mutation.ts

export const SAVE_DEPT_BRANDING = /* GraphQL */ `
  mutation SaveDeptBranding($deptId: ID!, $input: SaveDeptBrandingInput!) {
    saveDeptBranding(deptId: $deptId, input: $input) {
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

export const SAVE_INSTITUTE_SETTINGS = /* GraphQL */ `
  mutation SaveInstituteSettings($input: SaveInstituteSettingsInput!) {
    saveInstituteSettings(input: $input) {
      instituteName
      instituteLogoUrl
      defaultCopyrightText
      defaultWebsiteCredits
    }
  }
`
