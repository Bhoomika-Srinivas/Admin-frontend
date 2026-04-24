import { gqlRequest } from '@/api/graphqlClient'
import { LIST_AUDIT_ENTRIES } from '../graphql/audit.query'
import { CREATE_AUDIT_ENTRY } from '../graphql/audit.mutation'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  details?: string
  timestamp: string
  ipAddress?: string
  severity?: 'info' | 'warn' | 'critical'
  resourceType?: string
  resourceId?: string
}

interface GqlAuditEntry {
  entry_id: string
  actor_id: string
  actor_email: string
  action: string
  resource_type: string
  resource_id?: string
  after?: string        // AWSJSON — stringified object
  metadata?: string     // AWSJSON — stringified object
  timestamp: string
}

function mapAuditLog(raw: GqlAuditEntry): AuditLog {
  let details: string | undefined
  let ipAddress: string | undefined
  try {
    const meta = raw.metadata ? JSON.parse(raw.metadata) : {}
    ipAddress = meta.ip
  } catch { /* ignore */ }
  try {
    const after = raw.after ? JSON.parse(raw.after) : {}
    details = typeof after === 'object' ? JSON.stringify(after) : String(after)
  } catch { /* ignore */ }

  return {
    id:           raw.entry_id,
    userId:       raw.actor_id,
    userName:     raw.actor_email,
    action:       raw.action,
    module:       raw.resource_type,
    details,
    timestamp:    raw.timestamp,
    ipAddress,
    resourceType: raw.resource_type,
    resourceId:   raw.resource_id,
  }
}

export const auditService = {
  // Fire-and-forget: write an audit entry. Called by in-memory app-module services.
  log(
    userId: string,
    userName: string,
    action: string,
    resourceType: string,
    details?: string,
  ): void {
    gqlRequest(CREATE_AUDIT_ENTRY, {
      input: { actor_id: userId, actor_email: userName, action, resource_type: resourceType, after: details ? JSON.stringify({ details }) : null },
    }).catch(() => { /* best-effort */ })
  },

  async getLogs(params?: {
    userId?: string
    action?: string
    from?: string
    to?: string
  }): Promise<AuditLog[]> {
    const filter = params && Object.keys(params).length > 0 ? params : undefined
    const data = await gqlRequest<{ listAuditEntries: { items: GqlAuditEntry[] } }>(
      LIST_AUDIT_ENTRIES,
      { filter },
    )
    return (data.listAuditEntries?.items ?? []).map(mapAuditLog)
  },
}
