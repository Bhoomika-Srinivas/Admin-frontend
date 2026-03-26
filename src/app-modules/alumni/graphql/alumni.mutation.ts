export const CREATE_ALUMNI = `
  mutation CreateAlumni($input: CreateAlumniInput!) {
    createAlumni(input: $input) {
      alumniId
      name
      batch
      department
      company
      designation
      location
      email
      linkedin
      image
      createdAt
    }
  }
`

export const UPDATE_ALUMNI = `
  mutation UpdateAlumni($input: UpdateAlumniInput!) {
    updateAlumni(input: $input) {
      alumniId
      name
      batch
      department
      company
      designation
      location
      email
      linkedin
      image
      updatedAt
    }
  }
`

export const DELETE_ALUMNI = `
  mutation DeleteAlumni($alumniId: ID!) {
    deleteAlumni(alumniId: $alumniId) {
      alumniId
    }
  }
`
