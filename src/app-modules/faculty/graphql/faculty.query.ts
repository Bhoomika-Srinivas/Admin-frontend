export const GET_FACULTY = `
  query GetFaculty($facultyId: ID!) {
    getFaculty(facultyId: $facultyId) {
      facultyId
      name
      designation
      deptId
      department
      profileImage
      cvUrl
      status
      order
      createdAt
      updatedAt
    }
  }
`

export const LIST_DESIGNATION_OPTIONS = `
  query ListDesignationOptions {
    listDesignationOptions {
      items
    }
  }
`

export const LIST_FACULTY = `
  query ListFaculty(
    $deptId: ID,
    $designation: String,
    $status: String,
    $search: String
  ) {
    listFaculty(
      deptId: $deptId,
      designation: $designation,
      status: $status,
      search: $search
    ) {
      items {
        facultyId
        name
        designation
        deptId
        department
        profileImage
        cvUrl
        status
        order
        createdAt
      }
      nextToken
    }
  }
`
