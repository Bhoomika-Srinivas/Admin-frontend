export const CREATE_ACCREDITATION = /* GraphQL */`
  mutation CreateAccreditationRecord($input: CreateAccreditationRecordInput!) {
    createAccreditationRecord(input: $input) {
      accreditationId
      type
      title
      file_url
      order
    }
  }
`

export const UPDATE_ACCREDITATION = /* GraphQL */`
  mutation UpdateAccreditationRecord($input: UpdateAccreditationRecordInput!) {
    updateAccreditationRecord(input: $input) {
      accreditationId
      title
      file_url
      order
    }
  }
`

export const DELETE_ACCREDITATION = /* GraphQL */`
  mutation DeleteAccreditationRecord($accreditationId: ID!) {
    deleteAccreditationRecord(accreditationId: $accreditationId) {
      accreditationId
    }
  }
`
