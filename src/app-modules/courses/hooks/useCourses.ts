import { useState, useEffect } from 'react'
import { programs, type Program } from '@/data/coursesData'

export function useCourses() {
  const [data, setData] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setData(programs)
    } catch {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { programs: data, loading, error, reload: load }
}
