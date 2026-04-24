import { useState, useCallback, useMemo } from 'react'

interface ServerPaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface UseServerPaginationReturn {
  page: number
  limit: number
  total: number
  totalPages: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  prevPage: () => void
  params: ServerPaginationParams
  canNextPage: boolean
  canPrevPage: boolean
}

/** Server-side pagination hook */
export function useServerPagination(
  total: number,
  initialLimit = 20
): UseServerPaginationReturn {
  const [page, setPageState] = useState(1)
  const [limit, setLimit] = useState(initialLimit)

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit])

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, Math.min(newPage, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    setPage(page + 1)
  }, [page, setPage])

  const prevPage = useCallback(() => {
    setPage(page - 1)
  }, [page, setPage])

  const params = useMemo(() => ({
    page,
    limit,
  }), [page, limit])

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    params,
    canNextPage: page < totalPages,
    canPrevPage: page > 1,
  }
}
