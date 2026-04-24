import { useState, useEffect } from 'react'
import { auditService, type AuditLog } from '../api/auditApi'

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await auditService.getLogs()
      setLogs(data)
    } catch {
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { logs, loading, error, reload: load }
}
