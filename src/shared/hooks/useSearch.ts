import { useState, useEffect } from 'react'

interface UseSearchReturn {
  searchTerm: string
  setSearchTerm: (value: string) => void
  debouncedSearch: string
}

export function useSearch(delay = 300): UseSearchReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), delay)
    return () => clearTimeout(id)
  }, [searchTerm, delay])

  return { searchTerm, setSearchTerm, debouncedSearch }
}
