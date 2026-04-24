import { useState, useEffect, useCallback } from 'react'
import type { College } from '@/shared/types/models'
import { collegeService } from '../api/collegeApi'

export function useColleges() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await collegeService.getAll()
      setColleges(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load colleges')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { colleges, loading, error, reload: load }
}
