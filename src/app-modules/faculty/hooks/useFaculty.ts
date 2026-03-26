import { useState, useEffect } from 'react'
import type { Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'

interface FacultyFilter {
  deptId?: string
  designation?: string
  search?: string
}

export function useFaculty(filter?: FacultyFilter) {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await facultyService.getAll({
        deptId:      filter?.deptId,
        designation: filter?.designation,
        search:      filter?.search,
      })
      setFaculty(data)
    } catch (err) {
      console.error('[useFaculty] load error:', err)
      setError('Failed to load faculty')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter?.deptId, filter?.designation, filter?.search])

  return { faculty, loading, error, reload: load }
}
