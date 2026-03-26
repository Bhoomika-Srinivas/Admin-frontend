import { useState, useEffect } from 'react'
import type { Department } from '@/shared/types/models'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await departmentService.getAll()
      setDepartments(data)
    } catch {
      setError('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { departments, loading, error, reload: load }
}
