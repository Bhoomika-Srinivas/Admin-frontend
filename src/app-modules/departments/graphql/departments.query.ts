const DEPARTMENT_FIELDS = `
  departmentId
  tenantId
  name
  shortName
  hod
  established
  totalFaculty
  totalStudents
  status
  description
  imageUrl
  createdAt
  updatedAt
  programTypes
`

export const GET_DEPARTMENT = `
  query GetDepartment($tenantId: ID!, $departmentId: ID!) {
    getDepartment(tenantId: $tenantId, departmentId: $departmentId) {
      ${DEPARTMENT_FIELDS}
    }
  }
`

export const LIST_DEPARTMENTS = `
  query ListDepartments($tenantId: ID!, $limit: Int, $nextToken: String) {
    listDepartments(tenantId: $tenantId, limit: $limit, nextToken: $nextToken) {
      items {
        ${DEPARTMENT_FIELDS}
      }
      nextToken
    }
  }
`
