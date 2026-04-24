export const CREATE_COLLEGE = `
  mutation CreateCollege($input: CreateCollegeInput!) {
    createCollege(input: $input) {
      id
      name
      shortCode
      adminEmail
      status
      createdAt
    }
  }
`

export const UPDATE_COLLEGE = `
  mutation UpdateCollege($id: ID!, $input: UpdateCollegeInput!) {
    updateCollege(id: $id, input: $input) {
      id
      name
      shortCode
      adminEmail
      status
      updatedAt
    }
  }
`

export const DISABLE_COLLEGE = `
  mutation DisableCollege($id: ID!) {
    disableCollege(id: $id) {
      id
      status
      updatedAt
    }
  }
`
