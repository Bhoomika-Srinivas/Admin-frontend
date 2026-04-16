import { getCurrentToken } from './cognitoClient'

const APPSYNC_URL = import.meta.env.VITE_APPSYNC_URL

if (!APPSYNC_URL) {
  throw new Error('VITE_APPSYNC_URL environment variable is required')
}

let isRedirecting = false

export async function gqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getCurrentToken()

  if (!token) {
    if (!isRedirecting) {
      isRedirecting = true
      window.location.href = '/login'
    }
    throw new Error('Not authenticated')
  }

  const res = await fetch(APPSYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (res.status === 401) {
    if (!isRedirecting) {
      isRedirecting = true
      window.location.href = '/login'
    }
    throw new Error('Session expired')
  }

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  return json.data as T
}
