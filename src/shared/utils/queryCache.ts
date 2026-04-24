interface CacheEntry<T> {
  data: T
  timestamp: number
  key: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>()

/** Generates a cache key from query and variables */
export function generateCacheKey(query: string, variables?: Record<string, unknown>): string {
  return JSON.stringify({ query, variables })
}

/** Gets cached data if valid */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

/** Sets cache data */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    key,
  })
}

/** Invalidates cache entries by pattern */
export function invalidateCache(pattern: string): void {
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

/** Clears all cache */
export function clearCache(): void {
  cache.clear()
}

/** Returns cache stats for debugging */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()).map(k => k.slice(0, 50) + '...'),
  }
}
