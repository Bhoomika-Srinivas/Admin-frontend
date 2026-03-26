import { useState, useEffect } from 'react'
import type { News } from '@/shared/types/models'
import { newsService } from '@/app-modules/news/api/newsApi'

export function useNews() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = newsService.getAll()
      setNews(data)
    } catch {
      setError('Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { news, loading, error, reload: load }
}
