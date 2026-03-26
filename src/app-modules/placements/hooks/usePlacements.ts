import { useState, useEffect } from 'react'
import type { Placement } from '@/shared/types/models'
import { placementService } from '@/app-modules/placements/api/placementsApi'

export function usePlacements() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = placementService.getAll()
      setPlacements(data)
    } catch {
      setError('Failed to load placements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { placements, loading, error, reload: load }
}
