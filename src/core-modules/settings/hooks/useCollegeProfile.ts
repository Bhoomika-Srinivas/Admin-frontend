import { useState, useEffect, useCallback } from 'react'
import type { CollegeProfile } from '@/shared/types/models'
import { collegeProfileService } from '../api/collegeProfileApi'

export function useCollegeProfile() {
  const [profile, setProfile]   = useState<CollegeProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await collegeProfileService.get()
      setProfile(data)
    } catch {
      setError('Failed to load college profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { profile, loading, error, reload: load }
}
