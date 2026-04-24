import { useState, useEffect } from 'react'
import { settingsService } from '../api/settingsApi'
import type { SystemSetting } from '../types'

export function useSettings(category?: 'security' | 'operational') {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = category
        ? await settingsService.getByCategory(category)
        : await settingsService.getAll()
      setSettings(data)
    } catch {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category])

  // Returns a typed value by key, with a fallback default
  function getValue(key: string, defaultValue = ''): string {
    return settings.find(s => s.key === key)?.value ?? defaultValue
  }

  return { settings, loading, error, reload: load, getValue }
}
