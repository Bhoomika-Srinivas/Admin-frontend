// src/api/graphqlClient.ts
// Centralized GraphQL client — all API communication goes through here.
import { getCurrentToken } from './cognitoClient'

export async function gqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getCurrentToken()

  if (!token) {
    // Session expired or not logged in — redirect to login
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }

  const res = await fetch(import.meta.env.VITE_APPSYNC_URL ?? '', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  return json.data as T
}
