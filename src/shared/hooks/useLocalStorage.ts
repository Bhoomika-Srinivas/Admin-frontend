import { useState, useEffect, useCallback } from 'react'

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  syncAcrossTabs?: boolean
}

/** Persists state to localStorage with type safety */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
  } = options

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, serialize(valueToStore))
      } catch (error) {
        console.error(`Error saving localStorage key "${key}":`, error)
      }
    },
    [key, serialize, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue))
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, deserialize, syncAcrossTabs])

  return [storedValue, setValue, removeValue]
}

/** Session version - clears on tab close */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.sessionStorage.getItem(key)
      if (item) {
        const parsed = options?.deserialize
          ? options.deserialize(item)
          : JSON.parse(item)
        setStoredValue(parsed)
      }
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.sessionStorage.setItem(
        key,
        options?.serialize ? options.serialize(valueToStore) : JSON.stringify(valueToStore)
      )
    },
    [key, storedValue, options]
  )

  const removeValue = useCallback(() => {
    window.sessionStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
