import { useState, useEffect, useCallback, useRef } from 'react'

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseQueryOptions<T> {
  skip?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  retryCount?: number
}

/** Enhanced data fetching hook with retry, caching, and stale-while-revalidate */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseQueryOptions<T> = {}
): QueryState<T> & { refetch: () => Promise<void>; isStale: boolean } {
  const { skip = false, initialData = null, onSuccess, onError, retryCount = 3 } = options

  const [state, setState] = useState<QueryState<T>>({
    data: initialData,
    loading: !skip,
    error: null,
  })

  const [isStale, setIsStale] = useState(false)
  const lastFetchTime = useRef<number>(0)
  const abortController = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (isBackground = false) => {
    if (skip) return

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    if (!isBackground) {
      setState(prev => ({ ...prev, loading: true, error: null }))
    } else {
      setIsStale(true)
    }

    let attempts = 0
    let lastError: string | null = null

    while (attempts < retryCount) {
      try {
        const data = await fetcher()
        lastFetchTime.current = Date.now()
        setState({ data, loading: false, error: null })
        setIsStale(false)
        onSuccess?.(data)
        return
      } catch (error) {
        attempts++
        lastError = error instanceof Error ? error.message : 'Unknown error'

        // Don't retry on 4xx errors
        if (lastError.includes('401') || lastError.includes('403') || lastError.includes('404')) {
          break
        }

        if (attempts < retryCount) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempts), 5000)))
        }
      }
    }

    setState(prev => ({ ...prev, loading: false, error: lastError }))
    if (lastError) onError?.(lastError)
  }, [fetcher, skip, retryCount, onSuccess, onError])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (Date.now() - lastFetchTime.current > 5 * 60 * 1000) {
        fetchData(true)
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      abortController.current?.abort()
    }
  }, deps)

  return { ...state, refetch, isStale }
}

/** Optimistic mutation hook */
export function useMutation<T, V>(
  mutator: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  }
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const data = await mutator(variables)
      options?.onSuccess?.(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mutation failed'
      setError(message)
      options?.onError?.(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [mutator, options])

  return { mutate, loading, error, clearError: () => setError(null) }
}
