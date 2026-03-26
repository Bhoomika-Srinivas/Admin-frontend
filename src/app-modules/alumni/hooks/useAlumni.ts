import { useState, useEffect } from 'react'
import type { Alumni } from '@/shared/types/models'
import { alumniService } from '@/app-modules/alumni/api/alumniApi'

interface AlumniFilter {
  search?: string
  batch?: string
}

export function useAlumni(filter?: AlumniFilter) {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getAll({
        search: filter?.search,
        batch:  filter?.batch,
      })
      setAlumni(data)
    } catch {
      setError('Failed to load alumni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter?.search, filter?.batch])

  return { alumni, loading, error, reload: load }
}
