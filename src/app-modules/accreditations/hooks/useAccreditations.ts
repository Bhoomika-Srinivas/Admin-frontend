import { useState, useEffect, useCallback } from 'react'
import { accreditationService, type AccreditationFilters } from '../api/accreditationsApi'
import type { AccreditationRecord } from '@/shared/types/models'

export function useAccreditations(filters: AccreditationFilters) {
  const [data, setData]       = useState<AccreditationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<Error | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    accreditationService.getAll(filters)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e : new Error('Failed to load records')))
      .finally(() => setLoading(false))
  }, [filters.type, filters.section, filters.sub_section, filters.sub_sub_section, filters.department])

  useEffect(() => { load() }, [load])

  return { data, reload: load, loading, error }
}
