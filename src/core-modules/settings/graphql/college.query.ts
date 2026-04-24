export const LIST_COLLEGES = `
  query ListColleges {
    listColleges {
      id
      name
      shortCode
      adminEmail
      status
      createdAt
      updatedAt
    }
  }
`

export const GET_COLLEGE = `
  query GetCollege($id: ID!) {
    getCollege(id: $id) {
      id
      name
      shortCode
      adminEmail
      status
      createdAt
      updatedAt
    }
  }
`
