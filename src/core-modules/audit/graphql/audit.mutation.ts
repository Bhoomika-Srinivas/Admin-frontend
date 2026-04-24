export const CREATE_AUDIT_ENTRY = `
  mutation CreateAuditEntry($input: CreateAuditEntryInput!) {
    createAuditEntry(input: $input) {
      success
      message
    }
  }
`
