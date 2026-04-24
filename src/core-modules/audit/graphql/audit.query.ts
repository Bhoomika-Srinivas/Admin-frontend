export const LIST_AUDIT_ENTRIES = `
  query ListAuditEntries($filter: AuditFilterInput, $pagination: PaginationInput) {
    listAuditEntries(filter: $filter, pagination: $pagination) {
      items {
        entry_id
        actor_id
        actor_email
        action
        resource_type
        resource_id
        after
        metadata
        timestamp
      }
      pageInfo {
        total
        page
        limit
      }
    }
  }
`
