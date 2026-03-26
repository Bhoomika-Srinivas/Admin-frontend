import { useState, useEffect } from 'react'
import type { User } from '@/shared/types/models'
import { userService } from '@/core-modules/users/api/usersApi'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = userService.getAll()
      setUsers(data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { users, loading, error, reload: load }
}
