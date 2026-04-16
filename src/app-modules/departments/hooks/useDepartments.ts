import { useState, useEffect } from 'react'
import type { Department } from '@/shared/types/models'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import { useAuth } from '@/auth/AuthContext'

export function useDepartments() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await departmentService.getAll(user.tenantId ?? '')
      setDepartments(data)
    } catch {
      setError('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user.tenantId])

  return { departments, loading, error, reload: load }
}
