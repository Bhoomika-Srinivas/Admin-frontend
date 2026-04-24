import { useState, useEffect, useCallback } from 'react'
import type { FeatureFlag } from '@/shared/types/models'
import { featureFlagsService } from '../api/featureFlagsApi'

export function useFeatureFlags(collegeId: string | null) {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!collegeId) {
      setFlags([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await featureFlagsService.getByCollege(collegeId)
      setFlags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }, [collegeId])

  useEffect(() => { load() }, [load])

  return { flags, setFlags, loading, error, reload: load }
}
