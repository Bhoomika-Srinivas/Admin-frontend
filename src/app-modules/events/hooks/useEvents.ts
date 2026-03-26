import { useState, useEffect } from 'react'
import type { Event } from '@/shared/types/models'
import { eventService } from '@/app-modules/events/api/eventsApi'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await eventService.getAll()
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { events, loading, error, reload: load }
}
