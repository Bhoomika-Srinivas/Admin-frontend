import { useState } from 'react'

interface UsePaginationReturn<T> {
  page: number
  setPage: (page: number) => void
  limit: number
  totalPages: number
  data: T[]
  resetPage: () => void
}

export function usePagination<T>(items: T[], limit = 8): UsePaginationReturn<T> {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(items.length / limit)
  // Clamp page to valid range when items shrink (e.g. after filtering)
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages)
  const data = items.slice((safePage - 1) * limit, safePage * limit)

  return {
    page: safePage,
    setPage,
    limit,
    totalPages,
    data,
    resetPage: () => setPage(1),
  }
}
