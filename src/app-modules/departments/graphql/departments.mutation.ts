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

export const CREATE_DEPARTMENT = `
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      ${DEPARTMENT_FIELDS}
    }
  }
`

export const UPDATE_DEPARTMENT = `
  mutation UpdateDepartment($input: UpdateDepartmentInput!) {
    updateDepartment(input: $input) {
      ${DEPARTMENT_FIELDS}
    }
  }
`

export const DELETE_DEPARTMENT = `
  mutation DeleteDepartment($departmentId: ID!) {
    deleteDepartment(departmentId: $departmentId) {
      departmentId
    }
  }
`
