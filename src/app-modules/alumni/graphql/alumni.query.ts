export const LIST_ALUMNI = `
  query ListAlumni(
    $search: String,
    $batch: String
  ) {
    listAlumni(
      search: $search,
      batch: $batch
    ) {
      items {
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
      nextToken
    }
  }
`

export const GET_ALUMNI = `
  query GetAlumni($alumniId: ID!) {
    getAlumni(alumniId: $alumniId) {
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
