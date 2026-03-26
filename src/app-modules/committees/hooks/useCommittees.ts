import { useState, useEffect } from 'react'
import type { Committee } from '@/shared/types/models'
import { committeeService } from '@/app-modules/committees/api/committeesApi'

export function useCommittees() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = committeeService.getAll()
      setCommittees(data)
    } catch {
      setError('Failed to load committees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { committees, loading, error, reload: load }
}
