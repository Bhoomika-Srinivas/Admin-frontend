export const LIST_ACCREDITATIONS = /* GraphQL */`
  query ListAccreditationRecords(
    $type: String!
    $section: String
    $sub_section: String
    $sub_sub_section: String
    $department: String
    $limit: Int
    $nextToken: String
  ) {
    listAccreditationRecords(
      type: $type
      section: $section
      sub_section: $sub_section
      sub_sub_section: $sub_sub_section
      department: $department
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        accreditationId
        type
        section
        sub_section
        sub_sub_section
        department
        title
        description
        year
        program
        cycle
        file_url
        order
        createdBy
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`

export const GET_ACCREDITATION = /* GraphQL */`
  query GetAccreditationRecord($accreditationId: ID!) {
    getAccreditationRecord(accreditationId: $accreditationId) {
      accreditationId
      type
      section
      sub_section
      sub_sub_section
      department
      title
      description
      year
      program
      cycle
      file_url
      order
      createdBy
      createdAt
      updatedAt
    }
  }
`
