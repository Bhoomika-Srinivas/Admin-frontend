import { useState, useEffect } from 'react'
import { rolesService } from '../api/rolesApi'
import type { Role } from '../types'

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await rolesService.getAll()
      setRoles(data)
    } catch {
      setError('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { roles, loading, error, reload: load }
}

export function useAllPermissions() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await rolesService.getAllPermissions()
      setPermissions(data)
    } catch {
      setError('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Group permissions by module (first segment of "module:action:scope")
  const byModule = permissions.reduce<Record<string, string[]>>((acc, p) => {
    const module = p.split(':')[0] ?? 'unknown'
    if (!acc[module]) acc[module] = []
    acc[module].push(p)
    return acc
  }, {})

  return { permissions, byModule, loading, error, reload: load }
}
