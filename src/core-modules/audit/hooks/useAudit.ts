// Wraps the existing auditService — extend with GraphQL when backend is ready
import { auditService } from '../api/auditApi'
// Hook implementation TBD
export function useAudit() {
  // TODO: implement with useEffect + state
  return { auditService }
}
