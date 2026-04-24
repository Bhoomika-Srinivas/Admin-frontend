import { getCurrentToken } from './cognitoClient'
import { getCsrfToken, initCsrf } from '@/shared/utils/csrf'

const APPSYNC_URL = import.meta.env.VITE_APPSYNC_URL

if (!APPSYNC_URL) {
  throw new Error('VITE_APPSYNC_URL environment variable is required')
}

let isRedirecting = false

// Initialize CSRF on module load
initCsrf()

class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

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
    throw new AppError('Not authenticated', 'AUTH_REQUIRED', 401)
  }

  const csrfToken = getCsrfToken()

  try {
    const res = await fetch(APPSYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        'X-CSRF-Token': csrfToken || '',
      },
      body: JSON.stringify({ query, variables }),
    })

    if (res.status === 401) {
      if (!isRedirecting) {
        isRedirecting = true
        window.location.href = '/login'
      }
      throw new AppError('Session expired', 'SESSION_EXPIRED', 401)
    }

    const json = await res.json()

    if (json.errors) {
      const error = json.errors[0]
      // Don't expose internal error details to users
      const message = import.meta.env.PROD
        ? 'An error occurred. Please try again.'
        : error.message
      throw new AppError(message, error.extensions?.code || 'GRAPHQL_ERROR')
    }

    return json.data as T
  } catch (error) {
    if (error instanceof AppError) throw error
    // Network or parsing errors
    throw new AppError('Network error. Please check your connection.', 'NETWORK_ERROR')
  }
}
