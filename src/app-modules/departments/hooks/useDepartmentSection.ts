import { useState, useEffect, useCallback, useRef } from 'react'

/** Synchronous version — kept for backwards compatibility. */
export function useDepartmentSection<T>(loader: () => T[]) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    try {
      setData(loader())
    } finally {
      setLoading(false)
    }
  }, [loader])

  useEffect(() => { reload() }, [reload])

  return { data, loading, reload }
}

/** Async version — accepts a loader that returns a Promise. */
export function useDepartmentSectionAsync<T>(loader: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Always keep a ref to the latest loader so reload() calls the current version
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    loaderRef.current()
      .then(items => { setData(items) })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load'
        console.error('[useDepartmentSectionAsync]', msg)
        setError(msg)
      })
      .finally(() => { setLoading(false) })
  }, [])

  useEffect(() => { reload() }, [reload])

  return { data, setData, loading, error, reload }
}
