import { gqlRequest } from './graphqlClient'
import { generateCacheKey, getCache, setCache, invalidateCache } from '@/shared/utils/queryCache'

interface QueryOptions {
  skipCache?: boolean
  cacheKey?: string
}

/** GraphQL query with caching support */
export async function cachedGqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options: QueryOptions = {}
): Promise<T> {
  const key = options.cacheKey || generateCacheKey(query, variables)

  if (!options.skipCache) {
    const cached = getCache<T>(key)
    if (cached) {
      return cached
    }
  }

  const data = await gqlRequest<T>(query, variables)
  setCache(key, data)
  return data
}

/** Invalidate specific cache entries */
export function invalidateQuery(pattern: string): void {
  invalidateCache(pattern)
}

/** Mutations automatically invalidate related cache */
export async function gqlMutation<T = unknown>(
  mutation: string,
  variables?: Record<string, unknown>,
  invalidatePatterns?: string[]
): Promise<T> {
  const data = await gqlRequest<T>(mutation, variables)

  // Invalidate related caches
  invalidatePatterns?.forEach(pattern => invalidateCache(pattern))

  return data
}
