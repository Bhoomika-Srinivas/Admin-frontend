// src/app-modules/departments/graphql/deptInfo.query.ts

export const GET_DEPT_INTRODUCTION = /* GraphQL */ `
  query GetDeptIntroduction($deptId: ID!) {
    getDeptIntroduction(deptId: $deptId) {
      deptId
      departmentName
      logoUrl
      imageUrl
      description
    }
  }
`

export const GET_DEPT_ABOUT = /* GraphQL */ `
  query GetDeptAbout($deptId: ID!) {
    getDeptAbout(deptId: $deptId) {
      deptId
      vision
      mission
      updatedAt
    }
  }
`

export const GET_DEPT_SWOT = /* GraphQL */ `
  query GetDeptSwot($deptId: ID!) {
    getDeptSwot(deptId: $deptId) {
      deptId
      strengths
      weaknesses
      opportunities
      threats
    }
  }
`

export const GET_HOD_PROFILE = /* GraphQL */ `
  query GetHodProfile($deptId: ID!) {
    getHodProfile(deptId: $deptId) {
      deptId
      name
      title
      designation
      qualification
      experience
      specialization
      message
      profileSummary
      email
      phone
      imageUrl
      cvUrl
    }
  }
`

export const LIST_PROGRAM_OUTCOMES = /* GraphQL */ `
  query ListProgramOutcomes($deptId: ID!, $type: String, $limit: Int, $nextToken: String) {
    listProgramOutcomes(deptId: $deptId, type: $type, limit: $limit, nextToken: $nextToken) {
      items {
        programOutcomeId
        deptId
        type
        statement
        order
      }
      nextToken
    }
  }
`

export const LIST_DISTINGUISHED_ALUMNI = /* GraphQL */ `
  query ListDistinguishedAlumni($deptId: ID!) {
    listDistinguishedAlumni(deptId: $deptId) {
      items {
        distinguishedAlumnusId
        deptId
        name
        batch
        currentRole
        organization
        achievement
        imageUrl
      }
    }
  }
`
